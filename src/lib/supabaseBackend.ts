import type { Backend, ContributionInput, ReportInput, ThankYouInput } from "./backend";
import { filterWishes, sortWishes, wishProgress } from "./backend";
import { resizeImageFile } from "./image";
import { getSupabase } from "./supabase";
import type {
  AppNotification,
  Contribution,
  DemoSession,
  Profile,
  Report,
  ThankYou,
  Wish,
} from "./types";

/* ------------------------------------------------------------------ rows */

/**
 * Public-safe profile columns. `email` is deliberately excluded: the database
 * revokes SELECT on that column for anon/authenticated so one visitor can never
 * read another visitor's address. The signed-in user's own email comes from
 * their auth session, not from this table.
 */
const PROFILE_COLUMNS = "id, display_name, anonymous, avatar_url, bio, role, status, created_at";

interface ProfileRow {
  id: string;
  email?: string;
  display_name: string;
  anonymous: boolean;
  avatar_url: string | null;
  bio: string | null;
  role: "user" | "admin";
  status: "active" | "banned";
  created_at: string;
}

interface WishRow {
  id: string;
  author_id: string;
  title: string;
  story: string;
  category: Wish["category"];
  goal_amount: number;
  currency: Wish["currency"];
  image_url: string | null;
  item_url: string | null;
  fulfillment_method: Wish["fulfillmentMethod"];
  anonymous: boolean;
  raised_amount: number;
  supporter_count: number;
  thank_you: string | null;
  created_at: string;
  updated_at: string;
  removed: boolean;
  remove_reason: string | null;
  featured: boolean;
}

interface ContributionRow {
  id: string;
  wish_id: string;
  supporter_id: string;
  amount: number;
  currency: Contribution["currency"];
  anonymous: boolean;
  method: Contribution["method"];
  status: Contribution["status"];
  is_demo: boolean;
  reference: string;
  message: string | null;
  created_at: string;
}

interface NotificationRow {
  id: string;
  profile_id: string;
  kind: AppNotification["kind"];
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  created_at: string;
}

interface ReportRow {
  id: string;
  wish_id: string;
  reporter_id: string;
  reason: Report["reason"];
  details: string;
  status: Report["status"];
  created_at: string;
  resolution: string | null;
}

interface ThankYouRow {
  id: string;
  wish_id: string;
  from_profile_id: string;
  to_profile_id: string;
  anonymous: boolean;
  message: string;
  created_at: string;
}

/* --------------------------------------------------------------- mappers */

const toProfile = (r: ProfileRow): Profile => ({
  id: r.id,
  email: r.email ?? "",
  displayName: r.display_name,
  anonymous: r.anonymous,
  avatarUrl: r.avatar_url,
  bio: r.bio,
  role: r.role,
  status: r.status,
  createdAt: r.created_at,
});

const toWish = (r: WishRow): Wish => {
  const wish: Wish = {
    id: r.id,
    authorId: r.author_id,
    title: r.title,
    story: r.story,
    category: r.category,
    goalAmount: r.goal_amount,
    currency: r.currency,
    imageUrl: r.image_url,
    itemUrl: r.item_url,
    fulfillmentMethod: r.fulfillment_method,
    anonymous: r.anonymous,
    status: "open",
    raisedAmount: r.raised_amount,
    supporterCount: r.supporter_count,
    thankYou: r.thank_you,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    removed: r.removed,
    removeReason: r.remove_reason,
    featured: r.featured,
  };
  wish.status = wishProgress(wish).status;
  return wish;
};

const toContribution = (r: ContributionRow) => ({
  id: r.id,
  wishId: r.wish_id,
  supporterId: r.supporter_id,
  amount: r.amount,
  currency: r.currency,
  anonymous: r.anonymous,
  method: r.method,
  status: r.status,
  isDemo: r.is_demo,
  reference: r.reference,
  message: r.message,
  createdAt: r.created_at,
});

const toReport = (r: ReportRow): Report => ({
  id: r.id,
  wishId: r.wish_id,
  reporterId: r.reporter_id,
  reason: r.reason,
  details: r.details,
  status: r.status,
  createdAt: r.created_at,
  resolution: r.resolution,
});

const toThankYou = (r: ThankYouRow): ThankYou => ({
  id: r.id,
  wishId: r.wish_id,
  fromProfileId: r.from_profile_id,
  toProfileId: r.to_profile_id,
  anonymous: r.anonymous,
  message: r.message,
  createdAt: r.created_at,
});

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

async function currentProfileId(): Promise<string> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Sign in to continue.");
  return id;
}

/* --------------------------------------------------------------- backend */

export const supabaseBackend: Backend = {
  mode: "supabase",

  async getSession() {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    return user ? ({ profileId: user.id, email: user.email ?? "" } as DemoSession) : null;
  },

  subscribeAuth(listener) {
    const supabase = getSupabase();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      listener(
        session
          ? { profileId: session.user.id, email: session.user.email ?? "" }
          : null,
      );
    });
    return () => data.subscription.unsubscribe();
  },

  async signIn(email, password) {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { profileId: data.user.id, email: data.user.email ?? "" };
  },

  async signUp({ email, password, displayName, anonymous }) {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, anonymous } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Check your inbox to confirm your email, then sign in.");
    if (data.session) {
      return { profileId: data.user.id, email: data.user.email ?? "" };
    }
    // With email confirmation enabled there is no authenticated session yet.
    // The auth trigger creates the profile from the metadata above.
    return null;
  },

  async signOut() {
    await getSupabase().auth.signOut();
  },

  async getProfile(id) {
    const rows = unwrap(
      await getSupabase().from("profiles").select(PROFILE_COLUMNS).eq("id", id).limit(1),
    );
    return rows.length ? toProfile(rows[0] as unknown as ProfileRow) : null;
  },

  async listProfiles() {
    const rows = unwrap(
      await getSupabase().from("profiles").select(PROFILE_COLUMNS).order("created_at"),
    );
    return (rows as unknown as ProfileRow[]).map(toProfile);
  },

  async updateProfile(id, patch) {
    const rows = unwrap(
      await getSupabase()
        .from("profiles")
        .update({
          ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
          ...(patch.anonymous !== undefined ? { anonymous: patch.anonymous } : {}),
          ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
          ...(patch.avatarUrl !== undefined ? { avatar_url: patch.avatarUrl } : {}),
        })
        .eq("id", id)
        .select(PROFILE_COLUMNS),
    );
    if (!rows.length) throw new Error("Profile not found.");
    return toProfile(rows[0] as unknown as ProfileRow);
  },

  async setProfileStatus(id, status) {
    unwrap(await getSupabase().from("profiles").update({ status }).eq("id", id));
  },

  async listWishes(filter = {}) {
    let query = getSupabase().from("wishes").select("*");
    if (filter.category && filter.category !== "all") query = query.eq("category", filter.category);
    if (filter.minBudget) query = query.gte("goal_amount", filter.minBudget);
    if (filter.maxBudget) query = query.lte("goal_amount", filter.maxBudget);
    if (!filter.includeRemoved) query = query.eq("removed", false);
    if (filter.query) query = query.or(`title.ilike.%${filter.query}%,story.ilike.%${filter.query}%`);
    query = query.order("created_at", { ascending: false }).limit(200);
    const rows = unwrap(await query);
    return sortWishes(filterWishes((rows as WishRow[]).map(toWish), filter), filter.sort ?? "newest");
  },

  async getWish(id) {
    const rows = unwrap(await getSupabase().from("wishes").select("*").eq("id", id).limit(1));
    return rows.length ? toWish(rows[0] as WishRow) : null;
  },

  async createWish(authorId, draft) {
    const rows = unwrap(
      await getSupabase()
        .from("wishes")
        .insert({
          author_id: authorId,
          title: draft.title,
          story: draft.story,
          category: draft.category,
          goal_amount: draft.goalAmount,
          currency: draft.currency,
          image_url: draft.imageUrl,
          item_url: draft.itemUrl,
          fulfillment_method: draft.fulfillmentMethod,
          anonymous: draft.anonymous,
        })
        .select("*"),
    );
    return toWish(rows[0] as WishRow);
  },

  async updateWish(id, patch) {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const map: (keyof Wish)[] = [
      "title",
      "story",
      "category",
      "goalAmount",
      "currency",
      "imageUrl",
      "itemUrl",
      "fulfillmentMethod",
      "anonymous",
      "thankYou",
    ];
    const columns: Record<string, string> = {
      goalAmount: "goal_amount",
      currency: "currency",
      imageUrl: "image_url",
      itemUrl: "item_url",
      fulfillmentMethod: "fulfillment_method",
      thankYou: "thank_you",
    };
    for (const key of map) {
      if (key in patch) payload[columns[key] ?? key] = (patch as Record<string, unknown>)[key];
    }
    const rows = unwrap(
      await getSupabase().from("wishes").update(payload).eq("id", id).select("*"),
    );
    if (!rows.length) throw new Error("Wish not found.");
    return toWish(rows[0] as WishRow);
  },

  async deleteWish(id) {
    unwrap(await getSupabase().from("wishes").delete().eq("id", id));
  },

  async moderateWish(id, action) {
    const rows = unwrap(
      await getSupabase()
        .from("wishes")
        .update({
          removed: action.remove,
          remove_reason: action.remove ? action.reason ?? "Removed by moderation." : null,
          ...(action.feature !== undefined ? { featured: action.feature } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*"),
    );
    if (!rows.length) throw new Error("Wish not found.");
    return toWish(rows[0] as WishRow);
  },

  async listSaved(profileId) {
    const rows = unwrap(
      await getSupabase()
        .from("saved_wishes")
        .select("wish_id, wishes(*)")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false }),
    );
    return rows
      .map((row) => (row as unknown as { wishes: WishRow | null }).wishes)
      .filter((w): w is WishRow => Boolean(w))
      .map(toWish)
      .filter((w) => !w.removed);
  },

  async toggleSave(profileId, wishId) {
    const supabase = getSupabase();
    const existing = unwrap(
      await supabase
        .from("saved_wishes")
        .select("wish_id")
        .eq("profile_id", profileId)
        .eq("wish_id", wishId),
    );
    if (existing.length) {
      unwrap(
        await supabase
          .from("saved_wishes")
          .delete()
          .eq("profile_id", profileId)
          .eq("wish_id", wishId),
      );
      return false;
    }
    unwrap(await supabase.from("saved_wishes").insert({ profile_id: profileId, wish_id: wishId }));
    return true;
  },

  async createContribution(input: ContributionInput) {
    const supabase = getSupabase();
    // support_wish() is SECURITY DEFINER: it validates the amount, updates the
    // wish atomically and writes the notification — the client never edits totals.
    const { data, error } = await supabase.rpc("support_wish", {
      p_wish_id: input.wishId,
      p_amount: input.amount,
      p_anonymous: input.anonymous,
      p_method: input.method,
      p_message: input.message,
      p_reference: input.paymentReference,
      p_status: input.paymentStatus,
    });
    if (error) throw new Error(error.message);
    const contribution = toContribution((data as { contribution: ContributionRow }).contribution);
    const wish = toWish((data as { wish: WishRow }).wish);
    return { contribution, wish };
  },

  async listMyContributions(profileId) {
    const rows = unwrap(
      await getSupabase()
        .from("contributions")
        .select("*, wishes(*)")
        .eq("supporter_id", profileId)
        .order("created_at", { ascending: false }),
    );
    return rows
      .map((row) => {
        const typed = row as ContributionRow & { wishes: WishRow | null };
        return typed.wishes
          ? { ...toContribution(typed), wish: toWish(typed.wishes) }
          : null;
      })
      .filter((c): c is Contribution & { wish: Wish } => c !== null);
  },

  async listNotifications(profileId) {
    const rows = unwrap(
      await getSupabase()
        .from("notifications")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(50),
    );
    return (rows as NotificationRow[]).map((r) => ({
      id: r.id,
      profileId: r.profile_id,
      kind: r.kind,
      title: r.title,
      body: r.body,
      href: r.href,
      read: r.read,
      createdAt: r.created_at,
    }));
  },

  async markNotificationsRead(profileId) {
    unwrap(
      await getSupabase()
        .from("notifications")
        .update({ read: true })
        .eq("profile_id", profileId)
        .eq("read", false),
    );
  },

  async createReport(input: ReportInput) {
    const rows = unwrap(
      await getSupabase()
        .from("reports")
        .insert({
          wish_id: input.wishId,
          reporter_id: input.reporterId,
          reason: input.reason,
          details: input.details,
        })
        .select("*"),
    );
    return toReport(rows[0] as ReportRow);
  },

  async listReports() {
    const rows = unwrap(await getSupabase().from("reports").select("*").order("created_at"));
    return (rows as ReportRow[]).map(toReport);
  },

  async updateReport(id, patch) {
    const rows = unwrap(
      await getSupabase()
        .from("reports")
        .update({ status: patch.status, resolution: patch.resolution ?? null })
        .eq("id", id)
        .select("*"),
    );
    return toReport(rows[0] as ReportRow);
  },

  async postThankYou(input: ThankYouInput) {
    const rows = unwrap(
      await getSupabase()
        .from("thank_yous")
        .insert({
          wish_id: input.wishId,
          from_profile_id: input.fromProfileId,
          to_profile_id: input.toProfileId,
          anonymous: input.anonymous,
          message: input.message,
        })
        .select("*"),
    );
    return toThankYou(rows[0] as ThankYouRow);
  },

  async listThankYous(wishId) {
    const rows = unwrap(
      await getSupabase().from("thank_yous").select("*").eq("wish_id", wishId).order("created_at"),
    );
    return (rows as ThankYouRow[]).map(toThankYou);
  },

  async uploadWishImage(file) {
    const supabase = getSupabase();
    const profileId = await currentProfileId();
    const { blob } = await resizeImageFile(file);
    const path = `${profileId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    unwrap(await supabase.storage.from("wish-images").upload(path, blob, { contentType: blob.type }));
    const { data } = supabase.storage.from("wish-images").getPublicUrl(path);
    return data.publicUrl;
  },
};
