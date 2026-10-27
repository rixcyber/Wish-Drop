# WishDrop

A working community platform where people post something they genuinely wish for, and
generous people can fulfil it — anonymously if they prefer.

**Emotional core:** “You never know who might be in a position to make your day.”

![dark, minimal wish feed](https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=60)

## What is built

- **Home** — hero, live community stats, a subtle “just fulfilled” panel, how-it-works,
  the full wish feed with real filtering, and a recently-fulfilled wall.
- **Explore** — every wish with keyword search, category pills, budget filter and sorting
  by newest, nearly fulfilled or most supported, with incremental “show more”.
- **Wish detail** — full story, funding progress, retailer link, thank-yous, bookmarking,
  sharing, reporting, and a sticky support panel.
- **Support flows** — contribute money or gift an item, anonymity toggle, optional note,
  demo payment references, and honest status labels (`Open`, `Partially fulfilled`,
  `Fulfilled`). Amounts cannot exceed the remaining need, and nobody can fund their own wish.
- **Post / edit a wish** — validation, image upload with browser-side resizing, amount limits,
  duplicate-title blocking, prohibited-request detection (gift cards, crypto, off-platform
  cash, phone numbers), retailer link, fulfilment preference, anonymity, and a live card preview.
- **Accounts** — sign up / sign in, anonymous profiles, saved wishes, own wish history with
  edit/delete, contribution history, notifications, profile settings with avatar upload.
- **Moderation** — admin-only queue of reports, one-click removal with a reason the author
  receives, dismissals with resolution notes, wish restore/highlight, and user suspension.
- **Legal** — platform rules, privacy policy and payment disclosure written as real copy,
  including what is and is not enabled in this build.

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 3 · shadcn-style primitives on Radix ·
React Router 7 · sonner · lucide-react · Supabase (Auth + Postgres + Storage, optional).

## Run it

```bash
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # typecheck + production build
npm run preview    # serve the build
```

No configuration needed: without Supabase env vars the app runs on a **local demo backend**
(browser `localStorage`) seeded with 16 profiles, 17 wishes, contributions, saved wishes,
notifications, reports and thank-yous.

### Demo accounts

Password for all of them: `demo1234`

| Email | What it shows |
| --- | --- |
| `ada@wishdrop.demo` | Supporter with saved wishes and contribution history |
| `marcus@wishdrop.demo` | Has an open, popular wish (own edit/delete controls) |
| `admin@wishdrop.demo` | Moderation dashboard with an open report queue |

You can also create a new account — it lives in this browser's local storage.
“Reset demo data” in Settings restores the seed.

## Payments are demo-only

`src/lib/payments.ts` hard-codes `PAYMENT_MODE = "demo"`.

- No card details are ever requested, collected or stored.
- `processDemoPayment` simulates a provider round-trip and returns a `DEMO-…` reference.
- Wishes only show progress from recorded contributions; a live build must only mark a
  contribution `confirmed` from a verified provider webhook.
- The UI says “demo” at every step: feed banner, support dialog, footer, payment disclosure.

Do not switch this to real payments until a provider, server-side secrets, webhook
confirmation, refund policy, compliance review and moderation capacity are all in place.

`src/lib/config.ts` exposes `paymentsOpen`, which is true only on the local demo backend.
Once Supabase is configured it is false: the support button is disabled, the footer says
donations are closed, and the database refuses client-initiated contributions.

## Going live for real people

There are three distinct stages. Nothing below happens automatically.

### Stage 1 — real accounts and wishes (free)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env`, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`,
   then restart `npm run dev`.
4. Sign up through the UI with a real email address and post a wish.

When Supabase is active the app automatically:

- stops seeding demo profiles, wishes, notifications and reports;
- hides the demo-account shortcuts on the sign-in page;
- **closes donations** — `src/lib/config.ts` only opens the simulated support flow on the
  local demo backend, and the database revokes `support_wish()` from signed-in clients;
- keeps profile emails unreadable by other visitors (column-level privileges).

The Supabase adapter and SQL have not yet been executed against a live project in this
checkout — treat the first connection as a verification pass, not a finished deployment.

### Stage 2 — real donations (needs a payment account)

This is the part that must be built before any card is charged:

1. A payment provider account approved for your use case, in the country where your bank
   account sits (international cards are usually fine; the *account* is not global).
2. A Supabase Edge Function that creates a pending contribution plus a provider checkout
   session, storing the provider's session ID.
3. A second Edge Function for the provider webhook: verify the signature with the secret
   key, then mark that contribution `confirmed` using the service role.
4. Refund handling and a written refund policy before launch.
5. Only then remove the `paymentsOpen` gate and delete the demo payment simulator.

Keep secret keys in Supabase Edge Function secrets. Never in `.env` for the Vite bundle,
and never in chat.

### Stage 3 — public launch checklist

- Domain, HTTPS hosting with SPA rewrites, and Supabase auth email templates branded.
- Real operator identity, terms, refund policy and a contact address on the legal pages.
- Moderation rota: reports must be answered, removals explained, appeals read.
- Provider approval for fundraising/gifting for individuals — most treat it as restricted.
- Tax and record-keeping advice for your jurisdiction; these are gifts, not charity receipts.
- Backups, rate limits, and a plan for chargebacks.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates
   `profiles`, `wishes`, `contributions`, `saved_wishes`, `notifications`, `reports`,
   `thank_yous`, helper functions/triggers, a public `wish-images` storage bucket, and
   row-level security policies (public read for wishes, owner-only writes, admin-only
   report handling, and inserts into `contributions` denied to clients).
3. Copy `.env.example` to `.env` and fill in:

   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Restart `npm run dev`. `src/lib/api.ts` selects the Supabase backend automatically.

Only the **anon** key belongs in the client. Payment provider secrets, service-role keys
and webhook signing secrets must live on a server, never in this bundle.

Because this is a single-page app, configure your host to rewrite unknown paths to
`index.html` (Netlify `_redirects`, Vercel `rewrites`, Cloudflare Pages SPA fallback).

## Project structure

```
src/
  components/        UI primitives, wish card/feed, dialogs, header/footer
  context/           AuthContext (session, profile, saved, notifications)
  hooks/             community data + bookmark behaviour
  lib/
    api.ts           backend selector (Supabase or local demo)
    backend.ts       Backend interface, filtering, sorting, progress rules
    local.ts         local demo implementation
    store.ts         localStorage persistence, hashed demo credentials
    supabaseBackend.ts
    demo-data.ts     seed community
    payments.ts      demo payment + gift-order simulation
    validation.ts    wish validation and prohibited-request detection
  pages/             home, explore, wish, post, auth, account, admin, legal
supabase/schema.sql  tables, triggers, storage and RLS
```

## Safety behaviour implemented

- Row-level security policies for every table; contributions are not client-insertable.
- Public success stories require owner consent; thank-yous can be posted anonymously.
- No addresses, phone numbers or delivery details are shown publicly, and validation
  blocks phone-like strings in stories.
- Reports are confidential, reach a human queue, and removals notify the author with the reason.
- Supporters can be anonymous publicly; anonymity is explicitly described as protection
  from the public, not from moderation or legal obligations.

## Known limitations

- This is an MVP, not a payment launch: all transactions are simulated.
- The local demo backend is per-browser and not multi-user. Point it at Supabase for
  real shared data, real auth and storage uploads.
- Search is client-side over the loaded wish list; at scale it should move into Postgres
  full-text search or a dedicated index.
