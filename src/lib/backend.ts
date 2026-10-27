import type {
  AppNotification,
  Category,
  Contribution,
  Currency,
  DemoSession,
  FulfillmentMethod,
  Profile,
  Report,
  ReportReason,
  ReportStatus,
  ThankYou,
  Wish,
  WishDraft,
  WishFilter,
} from "./types";

export interface ContributionInput {
  wishId: string;
  supporterId: string;
  amount: number;
  anonymous: boolean;
  method: "money" | "gift_item";
  message: string | null;
  paymentReference: string;
  paymentStatus: "pending" | "confirmed" | "refunded";
}

export interface ReportInput {
  wishId: string;
  reporterId: string;
  reason: ReportReason;
  details: string;
}

export interface ThankYouInput {
  wishId: string;
  fromProfileId: string;
  toProfileId: string;
  anonymous: boolean;
  message: string;
}

export type WishSort = NonNullable<WishFilter["sort"]>;

export interface Backend {
  readonly mode: "supabase" | "local-demo";

  // auth + profiles
  getSession(): Promise<DemoSession | null>;
  subscribeAuth(listener: (session: DemoSession | null) => void): () => void;
  signIn(email: string, password: string): Promise<DemoSession>;
  signUp(input: {
    email: string;
    password: string;
    displayName: string;
    anonymous: boolean;
  }): Promise<DemoSession | null>;
  signOut(): Promise<void>;
  getProfile(id: string): Promise<Profile | null>;
  listProfiles(): Promise<Profile[]>;
  updateProfile(
    id: string,
    patch: Partial<Pick<Profile, "displayName" | "anonymous" | "bio" | "avatarUrl">>,
  ): Promise<Profile>;
  setProfileStatus(id: string, status: Profile["status"]): Promise<void>;

  // wishes
  listWishes(filter?: WishFilter): Promise<Wish[]>;
  getWish(id: string): Promise<Wish | null>;
  createWish(authorId: string, draft: WishDraft): Promise<Wish>;
  updateWish(id: string, patch: Partial<Wish>): Promise<Wish>;
  deleteWish(id: string): Promise<void>;
  moderateWish(
    id: string,
    action: { remove: boolean; reason?: string; feature?: boolean },
  ): Promise<Wish>;

  // saved wishes
  listSaved(profileId: string): Promise<Wish[]>;
  toggleSave(profileId: string, wishId: string): Promise<boolean>;

  // contributions
  createContribution(input: ContributionInput): Promise<{ contribution: Contribution; wish: Wish }>;
  listMyContributions(profileId: string): Promise<(Contribution & { wish: Wish })[]>;

  // notifications
  listNotifications(profileId: string): Promise<AppNotification[]>;
  markNotificationsRead(profileId: string): Promise<void>;

  // moderation
  createReport(input: ReportInput): Promise<Report>;
  listReports(): Promise<Report[]>;
  updateReport(
    id: string,
    patch: { status: ReportStatus; resolution?: string | null },
  ): Promise<Report>;

  // thank-you messages
  postThankYou(input: ThankYouInput): Promise<ThankYou>;
  listThankYous(wishId: string): Promise<ThankYou[]>;

  // storage
  uploadWishImage(file: File): Promise<string>;

  resetDemoData?(): Promise<void>;
}

export function wishProgress(wish: Wish) {
  const percent = wish.goalAmount
    ? Math.min(100, Math.round((wish.raisedAmount / wish.goalAmount) * 100))
    : 0;
  const remaining = Math.max(0, wish.goalAmount - wish.raisedAmount);
  const status: Wish["status"] =
    wish.raisedAmount >= wish.goalAmount
      ? "fulfilled"
      : wish.raisedAmount > 0
        ? "partially_fulfilled"
        : "open";
  return { percent, remaining, status };
}

export function sortWishes(wishes: Wish[], sort: WishSort = "newest"): Wish[] {
  const list = [...wishes];
  if (sort === "newest") {
    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } else if (sort === "most_supported") {
    list.sort((a, b) => b.supporterCount - a.supporterCount || b.raisedAmount - a.raisedAmount);
  } else {
    list.sort((a, b) => {
      const pa = a.raisedAmount / Math.max(a.goalAmount, 1);
      const pb = b.raisedAmount / Math.max(b.goalAmount, 1);
      const aOpen = a.status === "fulfilled" ? 1 : 0;
      const bOpen = b.status === "fulfilled" ? 1 : 0;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return pb - pa;
    });
  }
  return list;
}

export function filterWishes(wishes: Wish[], filter: WishFilter = {}): Wish[] {
  const query = filter.query?.trim().toLowerCase();
  return wishes.filter((wish) => {
    if (!filter.includeRemoved && wish.removed) return false;
    if (filter.category && filter.category !== "all" && wish.category !== filter.category) return false;
    if (filter.status && filter.status !== "all" && wish.status !== filter.status) return false;
    if (filter.minBudget && wish.goalAmount < filter.minBudget) return false;
    if (filter.maxBudget && wish.goalAmount > filter.maxBudget) return false;
    if (query) {
      const haystack = `${wish.title} ${wish.story} ${wish.category}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export interface CategoryCount {
  value: Category | "all";
  label: string;
  count: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  education: "Education",
  technology: "Technology",
  essentials: "Essentials",
  experiences: "Experiences",
  other: "Other",
};

export type { Contribution, Currency, FulfillmentMethod, Wish };
