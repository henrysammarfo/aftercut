import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSession,
  signIn as storeSignIn,
  signOut as storeSignOut,
  signUp as storeSignUp,
  type Session,
} from "./auth-store";
import {
  addIngest as storeAddIngest,
  applyLiveAtomize,
  applyLiveProactive,
  approveDraft as storeApproveDraft,
  denyPublishAll as storeDenyPublishAll,
  exportTenantJson as storeExport,
  importTenantJson as storeImport,
  loadTenant,
  markSoulSyncedLive,
  rejectDraft as storeRejectDraft,
  saveBrandKit as storeSaveBrandKit,
  setCognitionNote as storeSetCognitionNote,
  setDraftStage as storeSetDraftStage,
  tenantHealth,
  type TenantState,
} from "./tenant-store";
import type { BrandKit, Stage } from "./aftercut-data";
import {
  atomizeLive,
  fetchMindStatus,
  notifyLeashLive,
  proactiveLive,
  syncSoulLive,
  type LiveStatusResult,
} from "./minds/live";

type OpOk = { ok: true };
type OpFail = { ok: false; error: string };
type AsyncOp = Promise<OpOk | OpFail>;

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  tenant: TenantState | null;
  productMode: "live";
  mindStatus: LiveStatusResult | null;
  mindLoading: boolean;
  health: ReturnType<typeof tenantHealth> | null;
  refreshMindStatus: () => Promise<void>;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (input: {
    email: string;
    password: string;
    name: string;
  }) => { ok: boolean; error?: string };
  signOut: () => void;
  refreshTenant: () => void;
  saveBrandKit: (kit: BrandKit) => AsyncOp;
  setCognitionNote: (note: string) => void;
  addIngest: (input: {
    title?: string;
    text: string;
    source?: string;
  }) => OpOk | OpFail;
  atomizeIngest: (ingestId?: string) => AsyncOp;
  setDraftStage: (draftId: string, stage: Stage) => OpOk | OpFail;
  approveDraft: (draftId: string) => OpOk | OpFail;
  rejectDraft: (draftId: string) => OpOk | OpFail;
  denyPublishAll: () => Promise<{ detail: string }>;
  /** Live Day-2 proactive from Director Mind (not a local rewrite). */
  requestProactiveFollowup: () => AsyncOp;
  exportTenant: () => string | null;
  importTenant: (json: string) => OpOk | OpFail;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [tenant, setTenant] = useState<TenantState | null>(null);
  const [mindStatus, setMindStatus] = useState<LiveStatusResult | null>(null);
  const [mindLoading, setMindLoading] = useState(false);

  const refreshMindStatus = useCallback(async () => {
    setMindLoading(true);
    try {
      const s = await fetchMindStatus();
      setMindStatus(s);
    } catch (e) {
      setMindStatus({
        ok: false,
        connected: false,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setMindLoading(false);
    }
  }, []);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    setTenant(s ? loadTenant(s.userId) : null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    void refreshMindStatus();
    const id = setInterval(() => void refreshMindStatus(), 45_000);
    return () => clearInterval(id);
  }, [ready, refreshMindStatus]);

  const refreshTenant = useCallback(() => {
    if (!session) {
      setTenant(null);
      return;
    }
    setTenant(loadTenant(session.userId));
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      tenant,
      productMode: "live",
      mindStatus,
      mindLoading,
      health: tenant ? tenantHealth(tenant) : null,
      refreshMindStatus,
      signIn: (email, password) => {
        const res = storeSignIn({ email, password });
        if (!res.ok) return { ok: false, error: res.error };
        setSession(res.session);
        setTenant(loadTenant(res.session.userId));
        return { ok: true };
      },
      signUp: (input) => {
        const res = storeSignUp(input);
        if (!res.ok) return { ok: false, error: res.error };
        setSession(res.session);
        setTenant(loadTenant(res.session.userId));
        return { ok: true };
      },
      signOut: () => {
        storeSignOut();
        setSession(null);
        setTenant(null);
      },
      refreshTenant,
      saveBrandKit: async (kit) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = storeSaveBrandKit(session.userId, kit);
        if (!res.ok) return { ok: false, error: res.message };
        setTenant(res.state);

        const live = await syncSoulLive({
          data: {
            userId: session.userId,
            kit: res.state.brandKit,
            cognitionNote: res.state.cognitionNote,
          },
        });
        if (!live.ok) {
          return {
            ok: false,
            error: `Kit saved locally but live Mind sync failed: ${live.error}`,
          };
        }
        setTenant(markSoulSyncedLive(session.userId, live.mindName, live.confirm));
        void refreshMindStatus();
        return { ok: true };
      },
      setCognitionNote: (note) => {
        if (!session) return;
        setTenant(storeSetCognitionNote(session.userId, note));
      },
      addIngest: (input) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = storeAddIngest(session.userId, input);
        if (!res.ok) return { ok: false, error: res.message };
        setTenant(res.state);
        return { ok: true };
      },
      atomizeIngest: async (ingestId) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const state = loadTenant(session.userId);
        const target =
          (ingestId ? state.ingests.find((i) => i.id === ingestId) : null) ??
          state.ingests.find((i) => i.status === "queued") ??
          state.ingests[0];
        if (!target) return { ok: false, error: "Queue an ingest before atomizing." };
        if (!state.brandKit.name.trim() || !state.brandKit.tone.trim()) {
          return { ok: false, error: "Save brand kit and sync Soul first." };
        }

        const live = await atomizeLive({
          data: {
            userId: session.userId,
            kit: state.brandKit,
            title: target.title,
            source: target.source,
            text: target.text,
            ingestId: target.id,
          },
        });
        if (!live.ok) return { ok: false, error: live.error };

        setTenant(
          applyLiveAtomize(session.userId, {
            ingestId: target.id,
            beatCount: live.beatCount,
            mindName: live.mindName,
            mindId: live.mindId,
            drafts: live.drafts,
          }),
        );
        void refreshMindStatus();
        return { ok: true };
      },
      setDraftStage: (draftId, stage) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = storeSetDraftStage(session.userId, draftId, stage);
        setTenant(res.state);
        if (!res.ok) return { ok: false, error: res.error };
        return { ok: true };
      },
      approveDraft: (draftId) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = storeApproveDraft(session.userId, draftId);
        setTenant(res.state);
        if (!res.ok) return { ok: false, error: res.error };
        return { ok: true };
      },
      rejectDraft: (draftId) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = storeRejectDraft(session.userId, draftId);
        setTenant(res.state);
        if (!res.ok) return { ok: false, error: res.error };
        return { ok: true };
      },
      denyPublishAll: async () => {
        if (!session) return { detail: "Sign in first." };
        const { state, detail } = storeDenyPublishAll(session.userId);
        setTenant(state);
        // Best-effort notify live Mind (leash memory)
        void notifyLeashLive({ data: { userId: session.userId, detail } });
        return { detail };
      },
      requestProactiveFollowup: async () => {
        if (!session) return { ok: false, error: "Sign in first." };
        const state = loadTenant(session.userId);
        if (!state.brandKit.name.trim()) {
          return { ok: false, error: "Save + sync brand kit first." };
        }
        if (state.ingests.length === 0) {
          return { ok: false, error: "Add long-form ingest first." };
        }
        const live = await proactiveLive({
          data: {
            userId: session.userId,
            kit: state.brandKit,
            lastIngestTitle: state.ingests[0]?.title,
            drafts: state.drafts.map((d) => ({
              title: d.title,
              platform: d.platform,
              hook: d.hook,
              stage: d.stage,
            })),
          },
        });
        if (!live.ok) return { ok: false, error: live.error };
        setTenant(
          applyLiveProactive(session.userId, {
            title: live.title,
            hook: live.hook,
            platform: live.platform,
            agent: live.agent,
            mindName: live.mindName,
            mindId: live.mindId,
          }),
        );
        void refreshMindStatus();
        return { ok: true };
      },
      exportTenant: () => {
        if (!session) return null;
        return storeExport(session.userId);
      },
      importTenant: (json) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = storeImport(session.userId, json);
        if (!res.ok) return { ok: false, error: res.message };
        setTenant(res.state);
        return { ok: true };
      },
    }),
    [
      ready,
      session,
      tenant,
      mindStatus,
      mindLoading,
      refreshTenant,
      refreshMindStatus,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
