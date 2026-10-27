import { buildSeedStore, DEMO_PASSWORD, demoProfiles } from "./demo-data";
import type {
  AppNotification,
  Contribution,
  DemoSession,
  Profile,
  Report,
  SavedWish,
  ThankYou,
  Wish,
} from "./types";

const STORE_KEY = "wishdrop.store.v1";
const SESSION_KEY = "wishdrop.session.v1";
const CREDENTIALS_KEY = "wishdrop.credentials.v1";

export interface StoreData {
  version: number;
  profiles: Profile[];
  wishes: Wish[];
  contributions: Contribution[];
  saved: SavedWish[];
  notifications: AppNotification[];
  reports: Report[];
  thankYous: ThankYou[];
}

type Credentials = Record<
  string,
  { profileId: string; passwordHash: string }
>;

async function hash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("WishDrop could not persist data (storage full):", error);
  }
}

let cache: StoreData | null = null;
let credentials: Credentials | null = null;

async function seedCredentials(): Promise<Credentials> {
  const passwordHash = await hash(DEMO_PASSWORD);
  const creds: Credentials = {};
  for (const profile of demoProfiles) {
    creds[profile.email] = { profileId: profile.id, passwordHash };
  }
  write(CREDENTIALS_KEY, creds);
  return creds;
}

export async function loadStore(): Promise<StoreData> {
  if (cache) return cache;
  const existing = read<StoreData | null>(STORE_KEY, null);
  if (existing?.wishes?.length) {
    cache = existing;
  } else {
    cache = buildSeedStore();
    write(STORE_KEY, cache);
  }
  credentials = read<Credentials | null>(CREDENTIALS_KEY, null);
  if (!credentials || Object.keys(credentials).length === 0) {
    credentials = await seedCredentials();
  }
  return cache;
}

function commit() {
  if (cache) write(STORE_KEY, cache);
}

export function commitStore(data: StoreData) {
  cache = data;
  write(STORE_KEY, data);
}

export const store = {
  async reset() {
    cache = null;
    credentials = null;
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(CREDENTIALS_KEY);
    await loadStore();
  },

  async session(): Promise<DemoSession | null> {
    return read<DemoSession | null>(SESSION_KEY, null);
  },

  async setSession(session: DemoSession | null) {
    if (session) write(SESSION_KEY, session);
    else localStorage.removeItem(SESSION_KEY);
    return session;
  },

  async signIn(email: string, password: string): Promise<DemoSession> {
    const data = await loadStore();
    const key = email.trim().toLowerCase();
    const cred = credentials?.[key];
    if (!cred || cred.passwordHash !== (await hash(password))) {
      throw new Error("Invalid email or password.");
    }
    const profile = data.profiles.find((p) => p.id === cred.profileId);
    if (!profile) throw new Error("Account not found.");
    if (profile.status === "banned") {
      throw new Error("This account is suspended. Contact moderation@wishdrop.demo.");
    }
    const session: DemoSession = { profileId: profile.id, email: profile.email };
    await this.setSession(session);
    return session;
  },

  async signUp(input: {
    email: string;
    password: string;
    displayName: string;
    anonymous: boolean;
  }): Promise<DemoSession> {
    const data = await loadStore();
    const key = input.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(key)) {
      throw new Error("Enter a valid email address.");
    }
    if (input.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    if (credentials?.[key]) throw new Error("An account with that email already exists.");
    const profile: Profile = {
      id: `p_${Date.now().toString(36)}`,
      email: key,
      displayName: input.displayName.trim() || "New member",
      anonymous: input.anonymous,
      avatarUrl: null,
      bio: null,
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    data.profiles.push(profile);
    credentials = credentials ?? {};
    credentials[key] = { profileId: profile.id, passwordHash: await hash(input.password) };
    write(CREDENTIALS_KEY, credentials);
    data.notifications.unshift({
      id: `n_${Date.now().toString(36)}`,
      profileId: profile.id,
      kind: "welcome",
      title: "Welcome to WishDrop",
      body: "Post a wish, save the ones that move you, or simply browse. You never know who might be in a position to make your day.",
      href: "/post",
      read: false,
      createdAt: new Date().toISOString(),
    });
    commit();
    const session: DemoSession = { profileId: profile.id, email: key };
    await this.setSession(session);
    return session;
  },

  async signOut() {
    return this.setSession(null);
  },
};

export function seedDemoCredentials() {
  return DEMO_PASSWORD;
}
