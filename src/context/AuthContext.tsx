import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { AppNotification, DemoSession, Profile } from "@/lib/types";

interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
  anonymous: boolean;
}

interface AuthValue {
  session: DemoSession | null;
  profile: Profile | null;
  /** true while the initial session lookup is in flight */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  notifications: AppNotification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  savedIds: string[];
  isSaved: (wishId: string) => boolean;
  toggleSave: (wishId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async (next: DemoSession | null) => {
    setSession(next);
    if (!next) {
      setProfile(null);
      setNotifications([]);
      setSavedIds([]);
      return;
    }
    const [nextProfile, nextNotifications, nextSaved] = await Promise.all([
      api.getProfile(next.profileId),
      api.listNotifications(next.profileId),
      api.listSaved(next.profileId),
    ]);
    // The profiles table no longer exposes emails; own email comes from auth.
    setProfile(nextProfile ? { ...nextProfile, email: next.email } : null);
    setNotifications(nextNotifications);
    setSavedIds(nextSaved.map((wish) => wish.id));
  }, []);

  useEffect(() => {
    let alive = true;
    api
      .getSession()
      .then((current) => {
        if (alive) return hydrate(current);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoading(false);
      });
    const unsubscribe = api.subscribeAuth((next) => {
      void hydrate(next);
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [hydrate]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const next = await api.signIn(email, password);
      await hydrate(next);
    },
    [hydrate],
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      const next = await api.signUp(input);
      await hydrate(next);
    },
    [hydrate],
  );

  const signOut = useCallback(async () => {
    await api.signOut();
    await hydrate(null);
  }, [hydrate]);

  const refreshProfile = useCallback(async () => {
    if (!session) return;
    const next = await api.getProfile(session.profileId);
    setProfile(next);
  }, [session]);

  const refreshNotifications = useCallback(async () => {
    if (!session) {
      setNotifications([]);
      return;
    }
    setNotifications(await api.listNotifications(session.profileId));
  }, [session]);

  const markNotificationsRead = useCallback(async () => {
    if (!session) return;
    await api.markNotificationsRead(session.profileId);
    setNotifications((list) => list.map((item) => ({ ...item, read: true })));
  }, [session]);

  const toggleSave = useCallback(
    async (wishId: string) => {
      if (!session) throw new Error("Sign in to save wishes.");
      const next = await api.toggleSave(session.profileId, wishId);
      setSavedIds((ids) => (next ? [...ids, wishId] : ids.filter((id) => id !== wishId)));
      return next;
    },
    [session],
  );

  const value = useMemo<AuthValue>(
    () => ({
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      refreshNotifications,
      markNotificationsRead,
      savedIds,
      isSaved: (wishId: string) => savedIds.includes(wishId),
      toggleSave,
    }),
    [
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      notifications,
      refreshNotifications,
      markNotificationsRead,
      savedIds,
      toggleSave,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
