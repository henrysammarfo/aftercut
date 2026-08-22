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
import { authClient } from "./auth-client";
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
import {
  cloudAddIngest,
  cloudApplyLiveAtomize,
  cloudApplyLiveProactive,
  cloudApproveDraft,
  cloudDenyPublishAll,
  cloudExportTenant,
  cloudImportTenant,
  cloudMarkSoulSynced,
  cloudRejectDraft,
  cloudSaveBrandKit,
  cloudSetCognitionNote,
  cloudSetDraftStage,
  fetchCloudTenant,
  fetchProductConfig,
} from "./tenant-cloud";
import type { BrandKit, Stage } from "./aftercut-data";
import { friendlyError } from "./display";
import {
  atomizeLive,
  fetchMindStatus,
  notifyLeashLive,
  proactiveLive,
  syncSoulLive,
  type LiveStatusResult,
} from "./minds/live";
import { setBridgeSession } from "./session-bridge";

type OpOk = { ok: true };
type OpFail = { ok: false; error: string };
type AsyncOp = Promise<OpOk | OpFail>;

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  tenant: TenantState | null;
  productMode: "live" | "cloud";
  cloudStorage: boolean;
  mindStatus: LiveStatusResult | null;
  mindLoading: boolean;
  health: ReturnType<typeof tenantHealth> | null;
  refreshMindStatus: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (input: {
    email: string;
    password: string;
    name: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshTenant: () => Promise<void>;
  saveBrandKit: (kit: BrandKit) => AsyncOp;
  setCognitionNote: (note: string) => void;
  addIngest: (input: {
    title?: string;
    text: string;
    source?: string;
  }) => OpOk | OpFail | Promise<OpOk | OpFail>;
  atomizeIngest: (ingestId?: string) => AsyncOp;
  setDraftStage: (draftId: string, stage: Stage) => OpOk | OpFail | Promise<OpOk | OpFail>;
  approveDraft: (draftId: string) => OpOk | OpFail | Promise<OpOk | OpFail>;
  rejectDraft: (draftId: string) => OpOk | OpFail | Promise<OpOk | OpFail>;
  denyPublishAll: () => Promise<{ detail: string }>;
  requestProactiveFollowup: () => AsyncOp;
  exportTenant: () => Promise<string | null>;
  importTenant: (json: string) => OpOk | OpFail | Promise<OpOk | OpFail>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [tenant, setTenant] = useState<TenantState | null>(null);
  const [mindStatus, setMindStatus] = useState<LiveStatusResult | null>(null);
  const [mindLoading, setMindLoading] = useState(false);
  const [cloudStorage, setCloudStorage] = useState(false);

  const cloudSession = authClient.useSession();

  const refreshMindStatus = useCallback(async () => {
    setMindLoading(true);
    try {
      const s = await fetchMindStatus();
      setMindStatus(s);
    } catch (e) {
      setMindStatus({
        ok: false,
        connected: false,
        error: friendlyError(e instanceof Error ? e.message : String(e)),
      });
    } finally {
      setMindLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProductConfig().then((c) => setCloudStorage(c.cloudAuth && c.cloudStorage));
  }, []);

  const loadTenantForUser = useCallback(
    async (userId: string) => {
      if (cloudStorage) {
        const t = await fetchCloudTenant();
        setTenant(t.state);
        return t.state;
      }
      const state = loadTenant(userId);
      setTenant(state);
      return state;
    },
    [cloudStorage],
  );

  useEffect(() => {
    if (cloudStorage) {
      if (cloudSession.isPending) return;
      const user = cloudSession.data?.user;
      if (user) {
        const s: Session = { userId: user.id, email: user.email, name: user.name };
        setSession(s);
        setBridgeSession(s);
        void loadTenantForUser(user.id).finally(() => setReady(true));
      } else {
        setSession(null);
        setBridgeSession(null);
        setTenant(null);
        setReady(true);
      }
      return;
    }
    const s = getSession();
    setSession(s);
    setBridgeSession(s);
    setTenant(s ? loadTenant(s.userId) : null);
    setReady(true);
  }, [cloudStorage, cloudSession.isPending, cloudSession.data, loadTenantForUser]);

  useEffect(() => {
    if (!ready) return;
    void refreshMindStatus();
    const id = setInterval(() => void refreshMindStatus(), 45_000);
    return () => clearInterval(id);
  }, [ready, refreshMindStatus]);

  const refreshTenant = useCallback(async () => {
    if (!session) {
      setTenant(null);
      return;
    }
    await loadTenantForUser(session.userId);
  }, [session, loadTenantForUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      tenant,
      productMode: cloudStorage ? "cloud" : "live",
      cloudStorage,
      mindStatus,
      mindLoading,
      health: tenant ? tenantHealth(tenant) : null,
      refreshMindStatus,
      signIn: async (email, password) => {
        if (cloudStorage) {
          const res = await authClient.signIn.email({ email, password });
          if (res.error) {
            return { ok: false, error: friendlyError(res.error.message ?? "Sign in failed") };
          }
          return { ok: true };
        }
        const res = storeSignIn({ email, password });
        if (!res.ok) return { ok: false, error: friendlyError(res.error) };
        setSession(res.session);
        setBridgeSession(res.session);
        setTenant(loadTenant(res.session.userId));
        return { ok: true };
      },
      signUp: async (input) => {
        if (cloudStorage) {
          const res = await authClient.signUp.email({
            email: input.email,
            password: input.password,
            name: input.name,
          });
          if (res.error) {
            return { ok: false, error: friendlyError(res.error.message ?? "Sign up failed") };
          }
          return { ok: true };
        }
        const res = storeSignUp(input);
        if (!res.ok) return { ok: false, error: friendlyError(res.error) };
        setSession(res.session);
        setBridgeSession(res.session);
        setTenant(loadTenant(res.session.userId));
        return { ok: true };
      },
      signOut: async () => {
        if (cloudStorage) await authClient.signOut();
        else storeSignOut();
        setSession(null);
        setBridgeSession(null);
        setTenant(null);
      },
      refreshTenant,
      saveBrandKit: async (kit) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = cloudStorage
          ? await cloudSaveBrandKit({ data: { kit } })
          : storeSaveBrandKit(session.userId, kit);
        if (!res.ok) return { ok: false, error: friendlyError("message" in res ? res.message : "Save failed") };
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
            error: `Saved but your agent could not sync: ${friendlyError(live.error)}`,
          };
        }
        if (cloudStorage) {
          const synced = await cloudMarkSoulSynced({
            data: { mindName: live.mindName, confirm: live.confirm },
          });
          setTenant(synced.state);
        } else {
          setTenant(markSoulSyncedLive(session.userId, live.mindName, live.confirm));
        }
        void refreshMindStatus();
        return { ok: true };
      },
      setCognitionNote: (note) => {
        if (!session) return;
        if (cloudStorage) {
          void cloudSetCognitionNote({ data: { note } }).then((r) => setTenant(r.state));
        } else {
          setTenant(storeSetCognitionNote(session.userId, note));
        }
      },
      addIngest: async (input) => {
        if (!session) return { ok: false, error: "Sign in first." };
        if (cloudStorage) {
          const res = await cloudAddIngest({ data: input });
          if (!res.ok) return { ok: false, error: friendlyError(res.message) };
          setTenant(res.state);
          return { ok: true };
        }
        const res = storeAddIngest(session.userId, input);
        if (!res.ok) return { ok: false, error: friendlyError(res.message) };
        setTenant(res.state);
        return { ok: true };
      },
      atomizeIngest: async (ingestId) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const state = tenant ?? (cloudStorage ? (await fetchCloudTenant()).state : loadTenant(session.userId));
        const target =
          (ingestId ? state.ingests.find((i) => i.id === ingestId) : null) ??
          state.ingests.find((i) => i.status === "queued") ??
          state.ingests[0];
        if (!target) return { ok: false, error: "Import content before generating drafts." };
        if (!state.brandKit.name.trim() || !state.brandKit.tone.trim()) {
          return { ok: false, error: "Save your brand voice before generating drafts." };
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
        if (!live.ok) return { ok: false, error: friendlyError(live.error) };

        const atomizePayload = {
          ingestId: target.id,
          beatCount: live.beatCount,
          mindName: live.mindName,
          mindId: live.mindId,
          drafts: live.drafts,
          circle: live.circle,
          trendsUsed: live.trendsUsed,
        };

        if (cloudStorage) {
          const updated = await cloudApplyLiveAtomize({ data: atomizePayload });
          setTenant(updated.state);
        } else {
          setTenant(applyLiveAtomize(session.userId, atomizePayload));
        }
        void refreshMindStatus();
        return { ok: true };
      },
      setDraftStage: async (draftId, stage) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = cloudStorage
          ? await cloudSetDraftStage({ data: { draftId, stage } })
          : storeSetDraftStage(session.userId, draftId, stage);
        setTenant(res.state);
        if (!res.ok) return { ok: false, error: friendlyError(res.error) };
        return { ok: true };
      },
      approveDraft: async (draftId) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = cloudStorage
          ? await cloudApproveDraft({ data: { draftId } })
          : storeApproveDraft(session.userId, draftId);
        setTenant(res.state);
        if (!res.ok) return { ok: false, error: friendlyError(res.error) };
        return { ok: true };
      },
      rejectDraft: async (draftId) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = cloudStorage
          ? await cloudRejectDraft({ data: { draftId } })
          : storeRejectDraft(session.userId, draftId);
        setTenant(res.state);
        if (!res.ok) return { ok: false, error: friendlyError(res.error) };
        return { ok: true };
      },
      denyPublishAll: async () => {
        if (!session) return { detail: "Sign in first." };
        const out = cloudStorage
          ? await cloudDenyPublishAll({ data: {} })
          : storeDenyPublishAll(session.userId);
        setTenant(out.state);
        void notifyLeashLive({ data: { userId: session.userId, detail: out.detail } });
        return { detail: out.detail };
      },
      requestProactiveFollowup: async () => {
        if (!session) return { ok: false, error: "Sign in first." };
        const state = tenant ?? loadTenant(session.userId);
        if (!state.brandKit.name.trim()) {
          return { ok: false, error: "Save your brand voice first." };
        }
        if (state.ingests.length === 0) {
          return { ok: false, error: "Import content before improving hooks." };
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
        if (!live.ok) return { ok: false, error: friendlyError(live.error) };

        const proactivePayload = {
          title: live.title,
          hook: live.hook,
          platform: live.platform,
          agent: live.agent,
          mindName: live.mindName,
          mindId: live.mindId,
        };

        if (cloudStorage) {
          const updated = await cloudApplyLiveProactive({ data: proactivePayload });
          setTenant(updated.state);
        } else {
          setTenant(applyLiveProactive(session.userId, proactivePayload));
        }
        void refreshMindStatus();
        return { ok: true };
      },
      exportTenant: async () => {
        if (!session) return null;
        if (cloudStorage) {
          const res = await cloudExportTenant();
          return res.json;
        }
        return storeExport(session.userId);
      },
      importTenant: async (json) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = cloudStorage
          ? await cloudImportTenant({ data: { json } })
          : storeImport(session.userId, json);
        if (!res.ok) return { ok: false, error: friendlyError(res.message) };
        setTenant(res.state);
        return { ok: true };
      },
    }),
    [
      ready,
      session,
      tenant,
      cloudStorage,
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
