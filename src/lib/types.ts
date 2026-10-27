export type Category =
  | "education"
  | "technology"
  | "essentials"
  | "experiences"
  | "other";

export type Currency = "USD" | "EUR" | "GBP" | "INR" | "CAD" | "AUD";

export type WishStatus = "open" | "partially_fulfilled" | "fulfilled";

export type FulfillmentMethod = "gift" | "contribute" | "either";

export type ReportReason =
  | "scam"
  | "misleading"
  | "harassment"
  | "prohibited"
  | "duplicate"
  | "privacy"
  | "other";

export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  anonymous: boolean;
  avatarUrl: string | null;
  bio: string | null;
  role: "user" | "admin";
  status: "active" | "banned";
  createdAt: string;
}

export interface Wish {
  id: string;
  authorId: string;
  title: string;
  story: string;
  category: Category;
  goalAmount: number;
  currency: Currency;
  imageUrl: string | null;
  itemUrl: string | null;
  fulfillmentMethod: FulfillmentMethod;
  anonymous: boolean;
  status: WishStatus;
  raisedAmount: number;
  supporterCount: number;
  thankYou: string | null;
  createdAt: string;
  updatedAt: string;
  removed: boolean;
  removeReason: string | null;
  /** moderation flag: highlighted by moderators on the homepage */
  featured: boolean;
}

export type ContributionMethod = "money" | "gift_item";

export interface Contribution {
  id: string;
  wishId: string;
  supporterId: string;
  amount: number;
  currency: Currency;
  anonymous: boolean;
  method: ContributionMethod;
  /** Always true in this build: payments run in demo mode. */
  status: "pending" | "confirmed" | "refunded";
  isDemo: boolean;
  reference: string;
  message: string | null;
  createdAt: string;
}

export interface SavedWish {
  profileId: string;
  wishId: string;
  createdAt: string;
}

export type NotificationKind =
  | "supported"
  | "fulfilled"
  | "thank_you"
  | "report"
  | "moderation"
  | "welcome";

export interface AppNotification {
  id: string;
  profileId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  wishId: string;
  reporterId: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: string;
  resolution: string | null;
}

export interface ThankYou {
  id: string;
  wishId: string;
  fromProfileId: string;
  toProfileId: string;
  anonymous: boolean;
  message: string;
  createdAt: string;
}

export interface DemoSession {
  profileId: string;
  email: string;
}

export interface WishDraft {
  title: string;
  story: string;
  category: Category;
  goalAmount: number;
  currency: Currency;
  imageUrl: string | null;
  itemUrl: string | null;
  fulfillmentMethod: FulfillmentMethod;
  anonymous: boolean;
}

export interface WishFilter {
  query?: string;
  category?: Category | "all";
  sort?: "newest" | "nearly_fulfilled" | "most_supported";
  minBudget?: number;
  maxBudget?: number;
  status?: WishStatus | "all";
  includeRemoved?: boolean;
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "education", label: "Education" },
  { value: "technology", label: "Technology" },
  { value: "essentials", label: "Essentials" },
  { value: "experiences", label: "Experiences" },
  { value: "other", label: "Other" },
];

export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"];

/**
 * Requestable goal amount limits (in user's chosen currency).
 * Configurable via Vite environment variables:
 * - VITE_MIN_GOAL_AMOUNT (default: 5)
 * - VITE_MAX_GOAL_AMOUNT (default: 200000)
 */
const envMin =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_MIN_GOAL_AMOUNT
    ? Number(import.meta.env.VITE_MIN_GOAL_AMOUNT)
    : NaN;

const envMax =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_MAX_GOAL_AMOUNT
    ? Number(import.meta.env.VITE_MAX_GOAL_AMOUNT)
    : NaN;

export const GOAL_LIMITS = {
  min: Number.isFinite(envMin) && envMin > 0 ? envMin : 5,
  max: Number.isFinite(envMax) && envMax > 0 ? envMax : 200000,
} as const;

