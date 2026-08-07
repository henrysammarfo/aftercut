export type AftercutUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type Session = {
  userId: string;
  email: string;
  name: string;
};

const USERS_KEY = "aftercut_users_v1";
const SESSION_KEY = "aftercut_session_v1";

/** Demo-grade hash only — replace with Privy / Better Auth in production. */
function hash(password: string): string {
  let h = 0;
  for (let i = 0; i < password.length; i++) h = (h * 31 + password.charCodeAt(i)) >>> 0;
  return `h_${h.toString(16)}_${password.length}`;
}

function readUsers(): AftercutUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as AftercutUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: AftercutUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function signUp(input: {
  email: string;
  password: string;
  name: string;
}): { ok: true; session: Session } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || input.password.length < 6) {
    return { ok: false, error: "Use a valid email and a password with 6+ characters." };
  }
  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }
  const user: AftercutUser = {
    id: `usr_${crypto.randomUUID().slice(0, 8)}`,
    email,
    name: input.name.trim() || email.split("@")[0]!,
    passwordHash: hash(input.password),
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  const session: Session = { userId: user.id, email: user.email, name: user.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function signIn(input: {
  email: string;
  password: string;
}): { ok: true; session: Session } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email === email);
  if (!user || user.passwordHash !== hash(input.password)) {
    return { ok: false, error: "Wrong email or password." };
  }
  const session: Session = { userId: user.id, email: user.email, name: user.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
