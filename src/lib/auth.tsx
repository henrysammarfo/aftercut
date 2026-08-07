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
  approveDraft as storeApproveDraft,
  atomizeIngest as storeAtomizeIngest,
  denyPublishAll as storeDenyPublishAll,
  loadTenant,
  rejectDraft as storeRejectDraft,
  saveBrandKit as storeSaveBrandKit,
  setCognitionNote as storeSetCognitionNote,
  setDraftStage as storeSetDraftStage,
  simulateDay2Followup as storeSimulateDay2,
  appendTimeline as storeAppendTimeline,
  type TenantState,
} from "./tenant-store";
import type { BrandKit, MemoryEvent, Stage } from "./aftercut-data";

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  tenant: TenantState | null;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (input: {
    email: string;
    password: string;
    name: string;
  }) => { ok: boolean; error?: string };
  signOut: () => void;
  refreshTenant: () => void;
  saveBrandKit: (kit: BrandKit) => void;
  setCognitionNote: (note: string) => void;
  addIngest: (input: { title?: string; text: string; source?: string }) => void;
  atomizeIngest: (ingestId?: string) => void;
  setDraftStage: (draftId: string, stage: Stage) => void;
  approveDraft: (draftId: string) => void;
  rejectDraft: (draftId: string) => void;
  denyPublishAll: () => void;
  appendTimeline: (
    partial: Omit<MemoryEvent, "id" | "time"> & { time?: string },
  ) => void;
  simulateDay2Followup: () => { ok: boolean; error?: string };
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [tenant, setTenant] = useState<TenantState | null>(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    setTenant(s ? loadTenant(s.userId) : null);
    setReady(true);
  }, []);

  const refreshTenant = useCallback(() => {
    if (!session) {
      setTenant(null);
      return;
    }
    setTenant(loadTenant(session.userId));
  }, [session]);

  const withUser = useCallback(
    (fn: (userId: string) => TenantState) => {
      if (!session) return;
      setTenant(fn(session.userId));
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      tenant,
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
      saveBrandKit: (kit) => withUser((id) => storeSaveBrandKit(id, kit)),
      setCognitionNote: (note) => withUser((id) => storeSetCognitionNote(id, note)),
      addIngest: (input) => withUser((id) => storeAddIngest(id, input)),
      atomizeIngest: (ingestId) => withUser((id) => storeAtomizeIngest(id, ingestId)),
      setDraftStage: (draftId, stage) =>
        withUser((id) => storeSetDraftStage(id, draftId, stage)),
      approveDraft: (draftId) => withUser((id) => storeApproveDraft(id, draftId)),
      rejectDraft: (draftId) => withUser((id) => storeRejectDraft(id, draftId)),
      denyPublishAll: () => withUser((id) => storeDenyPublishAll(id)),
      appendTimeline: (partial) => withUser((id) => storeAppendTimeline(id, partial)),
      simulateDay2Followup: () => {
        if (!session || !tenant) return { ok: false, error: "Sign in first." };
        const hasKit = Boolean(tenant.brandKit.name.trim() || tenant.brandKit.tone.trim());
        const hasIngest = tenant.ingests.length > 0;
        if (!hasKit || !hasIngest) {
          return {
            ok: false,
            error: "Save a brand kit and add an ingest first — Day 2 needs your data.",
          };
        }
        setTenant(storeSimulateDay2(session.userId));
        return { ok: true };
      },
    }),
    [ready, session, tenant, refreshTenant, withUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
