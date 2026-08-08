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
  exportTenantJson as storeExport,
  importTenantJson as storeImport,
  loadTenant,
  rejectDraft as storeRejectDraft,
  saveBrandKit as storeSaveBrandKit,
  setCognitionNote as storeSetCognitionNote,
  setDraftStage as storeSetDraftStage,
  simulateDay2Followup as storeSimulateDay2,
  tenantHealth,
  type TenantState,
} from "./tenant-store";
import type { BrandKit, Stage } from "./aftercut-data";

type OpOk = { ok: true };
type OpFail = { ok: false; error: string };

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  tenant: TenantState | null;
  productMode: "offline";
  health: ReturnType<typeof tenantHealth> | null;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (input: {
    email: string;
    password: string;
    name: string;
  }) => { ok: boolean; error?: string };
  signOut: () => void;
  refreshTenant: () => void;
  saveBrandKit: (kit: BrandKit) => OpOk | OpFail;
  setCognitionNote: (note: string) => void;
  addIngest: (input: {
    title?: string;
    text: string;
    source?: string;
  }) => OpOk | OpFail;
  atomizeIngest: (ingestId?: string) => OpOk | OpFail;
  setDraftStage: (draftId: string, stage: Stage) => OpOk | OpFail;
  approveDraft: (draftId: string) => void;
  rejectDraft: (draftId: string) => void;
  denyPublishAll: () => { detail: string };
  simulateDay2Followup: () => OpOk | OpFail;
  exportTenant: () => string | null;
  importTenant: (json: string) => OpOk | OpFail;
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

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      tenant,
      productMode: "offline",
      health: tenant ? tenantHealth(tenant) : null,
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
      saveBrandKit: (kit) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = storeSaveBrandKit(session.userId, kit);
        if (!res.ok) return { ok: false, error: res.message };
        setTenant(res.state);
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
      atomizeIngest: (ingestId) => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = storeAtomizeIngest(session.userId, ingestId);
        setTenant(res.state);
        if (!res.ok) return { ok: false, error: res.message };
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
        if (!session) return;
        setTenant(storeApproveDraft(session.userId, draftId));
      },
      rejectDraft: (draftId) => {
        if (!session) return;
        setTenant(storeRejectDraft(session.userId, draftId));
      },
      denyPublishAll: () => {
        if (!session) return { detail: "Sign in first." };
        const { state, detail } = storeDenyPublishAll(session.userId);
        setTenant(state);
        return { detail };
      },
      simulateDay2Followup: () => {
        if (!session) return { ok: false, error: "Sign in first." };
        const res = storeSimulateDay2(session.userId);
        setTenant(res.state);
        if (!res.ok) return { ok: false, error: res.message };
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
    [ready, session, tenant, refreshTenant],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
