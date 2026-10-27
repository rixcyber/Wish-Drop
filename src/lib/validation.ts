import { GOAL_LIMITS, type WishDraft } from "./types";

export type DraftErrors = Partial<Record<keyof WishDraft | "form", string>>;

const PHONE_PATTERN = /(\+?\d[\d\s().-]{8,}\d)/;
const REQUEST_PATTERNS: { pattern: RegExp; message: string }[] = [
  {
    pattern: /\b(gift ?card|itunes|steam card|crypto|bitcoin|wallet address|western union|wire transfer|cashapp|paypal\.me)\b/i,
    message:
      "WishDrop never handles gift cards, wire transfers or crypto. Ask for a specific item or a verifiable expense instead.",
  },
  {
    pattern: /\b(send (me )?(the )?money|repay \d+x|guaranteed return|no questions asked)\b/i,
    message:
      "Wishes must describe a real item or expense, not a loan or investment promise.",
  },
];

/**
 * Validates a request amount against platform bounds and monetary precision rules.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateGoalAmount(amount: unknown): string | null {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < GOAL_LIMITS.min) {
    return `Ask for at least ${GOAL_LIMITS.min} — small, honest wishes work best.`;
  }
  if (amount > GOAL_LIMITS.max) {
    return `Keep requests under ${GOAL_LIMITS.max.toLocaleString("en-US")}. Larger needs are better split across several verifiable items.`;
  }
  const rounded = Math.round(amount * 100) / 100;
  if (Math.abs(amount - rounded) > 0.0001) {
    return "Amount cannot have more than two decimal places.";
  }
  return null;
}

export function validateWishDraft(
  draft: WishDraft,
  options: { existingTitles?: string[] } = {},
): DraftErrors {
  const errors: DraftErrors = {};
  const title = draft.title.trim();

  if (title.length < 8) {
    errors.title = "Give your wish a clear title of at least 8 characters.";
  } else if (title.length > 90) {
    errors.title = "Keep the title under 90 characters.";
  } else if (
    (options.existingTitles ?? []).some((t) => t.toLowerCase() === title.toLowerCase())
  ) {
    errors.title = "You already have an open wish with that title.";
  }

  const story = draft.story.trim();
  if (story.length < 40) {
    errors.story = "Tell the story in at least 40 characters — why does this matter to you?";
  } else if (story.length > 2000) {
    errors.story = "Keep the story under 2000 characters.";
  }

  const goalError = validateGoalAmount(draft.goalAmount);
  if (goalError) {
    errors.goalAmount = goalError;
  }

  const text = `${title} ${story}`.replace(/\s+/g, " ");
  for (const { pattern, message } of REQUEST_PATTERNS) {
    if (pattern.test(text)) {
      errors.story = errors.story ?? message;
      break;
    }
  }
  if (PHONE_PATTERN.test(story)) {
    errors.story = errors.story ?? "Never include phone numbers or addresses — keep contact inside WishDrop.";
  }

  if (draft.itemUrl && !/^https?:\/\/\S+$/i.test(draft.itemUrl.trim())) {
    errors.itemUrl = "Retailer links must start with http:// or https://.";
  }

  return errors;
}

export function firstError(errors: DraftErrors): string | null {
  const values = Object.values(errors).filter(Boolean);
  return (values[0] as string | undefined) ?? null;
}
