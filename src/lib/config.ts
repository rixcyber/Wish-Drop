import { backendMode } from "./api";

/**
 * Donations are only "open" on the local demo backend, where every payment is
 * simulated on the visitor's own device.
 *
 * The moment WishDrop runs against Supabase (real accounts, real wishes) this
 * becomes false: the simulated support flow must never be reachable on a site
 * real people use, because it would let anyone mark a wish funded without
 * paying. Opening donations again requires a server-side checkout + webhook
 * flow (Supabase Edge Function + payment provider) that records a contribution
 * only after the provider confirms the charge.
 */
export const paymentsOpen = backendMode === "local-demo";

export const DONATIONS_CLOSED_COPY =
  "Donations are closed while card payments are being connected. Nobody can be charged and no wish can be marked funded on this deployment yet.";
