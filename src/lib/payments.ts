import type { Currency } from "./types";

/**
 * Payment handling.
 *
 * This build ships in DEMO MODE: `processDemoPayment` simulates the provider
 * round-trip locally and returns a reference that is clearly marked as a demo.
 * No money moves and no card data is ever collected by WishDrop.
 *
 * Going live requires, in order:
 *   1. a merchant account with a supported provider (e.g. Stripe), server-side
 *      secrets, and a webhook that flips a contribution to `confirmed`;
 *   2. a written refund/cancellation policy and payout terms;
 *   3. KYC / charitable-giving compliance review for the markets we serve;
 *   4. moderation capacity (report queue) switched on before the first real
 *      contribution.
 * Until all four exist, `PAYMENT_MODE` stays "demo" and the UI keeps saying so.
 */

export const PAYMENT_MODE = "demo";

export const PAYMENT_DISCLOSURE =
  "Demo payments: no card is charged and no money is transferred. WishDrop only marks a wish as funded after a payment provider confirms the transaction.";

export interface PaymentResult {
  reference: string;
  status: "confirmed";
  amount: number;
  currency: Currency;
  provider: "demo";
  isDemo: true;
  confirmedAt: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function processDemoPayment(input: {
  wishId: string;
  amount: number;
  currency: Currency;
}): Promise<PaymentResult> {
  await wait(1100);
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Enter an amount greater than zero.");
  }
  const reference = `DEMO-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
  return {
    reference,
    status: "confirmed",
    amount: input.amount,
    currency: input.currency,
    provider: "demo",
    isDemo: true,
    confirmedAt: new Date().toISOString(),
  };
}

export interface GiftOrder {
  reference: string;
  status: "confirmed";
  isDemo: true;
  note: string;
}

/**
 * "Gift an item" flow: the supporter buys through a verified retailer rather
 * than sending money. In demo mode we record the intent so the wish shows a
 * pending gift; the real workflow hands off to the retailer's checkout.
 */
export async function createGiftOrder(input: {
  wishId: string;
  itemUrl: string | null;
}): Promise<GiftOrder> {
  await wait(900);
  return {
    reference: `GIFT-${Date.now().toString(36).toUpperCase()}`,
    status: "confirmed",
    isDemo: true,
    note: input.itemUrl
      ? "Demo order recorded. In live mode this opens the verified retailer listing and the item ships through WishDrop's private delivery arrangement."
      : "Demo order recorded. In live mode this opens WishDrop's approved purchasing workflow for this item.",
  };
}
