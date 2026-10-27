import type {
  AppNotification,
  Contribution,
  Profile,
  Report,
  SavedWish,
  ThankYou,
  Wish,
} from "./types";

const days = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

export const DEMO_PASSWORD = "demo1234";

export const demoProfiles: Profile[] = [
  {
    id: "p_admin",
    email: "admin@wishdrop.demo",
    displayName: "WishDrop Team",
    anonymous: false,
    avatarUrl: null,
    bio: "Moderation and community safety.",
    role: "admin",
    status: "active",
    createdAt: days(420),
  },
  {
    id: "p_ada",
    email: "ada@wishdrop.demo",
    displayName: "Ada M.",
    anonymous: false,
    avatarUrl: null,
    bio: "Product designer. I support one wish every month.",
    role: "user",
    status: "active",
    createdAt: days(210),
  },
  {
    id: "p_marcus",
    email: "marcus@wishdrop.demo",
    displayName: "Marcus O.",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(160),
  },
  {
    id: "p_leila",
    email: "leila@wishdrop.demo",
    displayName: "Leila",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(120),
  },
  {
    id: "p_noor",
    email: "noor@wishdrop.demo",
    displayName: "Noor",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(95),
  },
  {
    id: "p_diego",
    email: "diego@wishdrop.demo",
    displayName: "Diego R.",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(80),
  },
  {
    id: "p_priya",
    email: "priya@wishdrop.demo",
    displayName: "Priya S.",
    anonymous: true,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(70),
  },
  {
    id: "p_grace",
    email: "grace@wishdrop.demo",
    displayName: "Grace T.",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(64),
  },
  {
    id: "p_ivan",
    email: "ivan@wishdrop.demo",
    displayName: "Ivan K.",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(55),
  },
  {
    id: "p_yara",
    email: "yara@wishdrop.demo",
    displayName: "Yara",
    anonymous: true,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(44),
  },
  {
    id: "p_tom",
    email: "tom@wishdrop.demo",
    displayName: "Tom B.",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(38),
  },
  {
    id: "p_felix",
    email: "felix@wishdrop.demo",
    displayName: "Felix A.",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(30),
  },
  {
    id: "p_olive",
    email: "olive@wishdrop.demo",
    displayName: "Olive",
    anonymous: true,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(24),
  },
  {
    id: "p_sam",
    email: "sam@wishdrop.demo",
    displayName: "Sam W.",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(18),
  },
  {
    id: "p_hana",
    email: "hana@wishdrop.demo",
    displayName: "Hana L.",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "active",
    createdAt: days(11),
  },
  {
    id: "p_ridley",
    email: "ridley@wishdrop.demo",
    displayName: "Ridley",
    anonymous: false,
    avatarUrl: null,
    bio: null,
    role: "user",
    status: "banned",
    createdAt: days(9),
  },
];

type SeedWish = Omit<
  Wish,
  "status" | "raisedAmount" | "supporterCount" | "updatedAt" | "removed" | "removeReason" | "featured" | "thankYou"
> & { raisedAmount: number; supporterCount: number; featured?: boolean; thankYou?: string };

const seedWishes: SeedWish[] = [
  {
    id: "w_laptop",
    authorId: "p_marcus",
    title: "A refurbished laptop to finish my computer science degree",
    story:
      "I'm two semesters away from graduating and my laptop died mid-assignments. The department lab closes at 6pm and I work a morning shift, so I've been writing code on my phone. A refurbished machine would let me finish my final project, publish my portfolio and sit my online exams without borrowing every week. I've priced a refurbished ThinkPad from a verified retailer — happy to share the listing with anyone who wants to check it first.",
    category: "education",
    goalAmount: 850,
    currency: "USD",
    imageUrl: img("1517336714731-489689fd1ca8"),
    itemUrl: "https://www.amazon.com/s?k=refurbished+thinkpad",
    fulfillmentMethod: "either",
    anonymous: false,
    createdAt: days(12),
    raisedAmount: 610,
    supporterCount: 9,
    featured: true,
  },
  {
    id: "w_glasses",
    authorId: "p_noor",
    title: "Prescription glasses so I can read with my daughter again",
    story:
      "My prescription changed eighteen months ago and I put off replacing my glasses because rent came first. Reading bedtime stories has become blurry and embarrassing. Nothing fancy — a single pair of single-vision glasses from a shop that can verify the prescription. That's the whole wish.",
    category: "essentials",
    goalAmount: 220,
    currency: "USD",
    imageUrl: img("1574258495973-f010dfbb5371"),
    itemUrl: null,
    fulfillmentMethod: "either",
    anonymous: false,
    createdAt: days(46),
    raisedAmount: 220,
    supporterCount: 6,
    thankYou:
      "They arrived on Tuesday and my daughter picked the frames. We read three chapters that night. Thank you to everyone who contributed — I don't know who you are, and I think that's exactly the point. I'll pay it forward when I'm able.",
  },
  {
    id: "w_camera",
    authorId: "p_diego",
    title: "A used camera to document my neighbourhood",
    story:
      "My block is being rezoned and nobody has photographed what's actually there — the barbershop that's been open 40 years, the murals, the families. I've been borrowing a friend's camera for two years and it's time to return it. A used mirrorless body would let me start a proper archive and print a small zine for residents. I've listed a specific used model from a retailer with a return window.",
    category: "other",
    goalAmount: 640,
    currency: "USD",
    imageUrl: img("1502920917128-1aa500764cbd"),
    itemUrl: "https://www.bhphotovideo.com/c/search?q=used%20mirrorless",
    fulfillmentMethod: "gift",
    anonymous: false,
    createdAt: days(20),
    raisedAmount: 275,
    supporterCount: 5,
  },
  {
    id: "w_cert",
    authorId: "p_priya",
    title: "Course fee for a data analytics certificate",
    story:
      "I've been doing marketing reports by hand for four years. This certificate is the bridge to a role that actually uses my experience. The fee covers twelve weeks, including the proctored exam, and the provider has a published refund policy I can share. I've already saved half of it from weekend work — I'm asking for the rest.",
    category: "education",
    goalAmount: 900,
    currency: "USD",
    imageUrl: img("1516321318423-f06f85e504b3"),
    itemUrl: null,
    fulfillmentMethod: "contribute",
    anonymous: true,
    createdAt: days(9),
    raisedAmount: 340,
    supporterCount: 7,
  },
  {
    id: "w_coat",
    authorId: "p_grace",
    title: "A warm winter coat for my daughter",
    story:
      "She outgrew hers in October and the school run is getting colder. One proper waterproof coat, her size, from a shop I can return to if the fit is wrong. I'm not asking for anything else — just one coat that lasts the winter.",
    category: "essentials",
    goalAmount: 95,
    currency: "USD",
    imageUrl: img("1544022613-e87ca75a784a"),
    itemUrl: null,
    fulfillmentMethod: "either",
    anonymous: false,
    createdAt: days(58),
    raisedAmount: 95,
    supporterCount: 4,
    thankYou:
      "The coat fits perfectly and the hood actually keeps the rain out. She's been wearing it every day. Thank you — quietly, kindly, from all of us.",
  },
  {
    id: "w_flight",
    authorId: "p_ivan",
    title: "A ticket home to sit with my mother after her surgery",
    story:
      "My mother is having heart surgery in March and I haven't been home in three years. I've priced the cheapest flexible fare so I can move the date if her surgery shifts. I can share the booking link with whoever helps — no addresses, just the itinerary. Everything else, I've covered myself.",
    category: "experiences",
    goalAmount: 480,
    currency: "EUR",
    imageUrl: img("1488646953014-85cb44e25828"),
    itemUrl: null,
    fulfillmentMethod: "contribute",
    anonymous: false,
    createdAt: days(7),
    raisedAmount: 190,
    supporterCount: 6,
  },
  {
    id: "w_kitchen",
    authorId: "p_yara",
    title: "A kettle and a first proper kitchen set",
    story:
      "I moved into my own place last month after a long wait on the housing list. It came with nothing. A kettle, two pans and a knife would mean I can cook instead of buying takeaway I can't afford. I've put together a basket at a home store — the whole thing is under seventy pounds.",
    category: "essentials",
    goalAmount: 70,
    currency: "GBP",
    imageUrl: img("1556909114-f6e7ad7d3136"),
    itemUrl: null,
    fulfillmentMethod: "either",
    anonymous: true,
    createdAt: days(15),
    raisedAmount: 25,
    supporterCount: 2,
  },
  {
    id: "w_bike",
    authorId: "p_tom",
    title: "A bicycle to get to my night shifts",
    story:
      "The last bus leaves before my shift starts and taxis eat the whole paycheque. A used hybrid bike with lights and a lock would cut a 50-minute walk to 15 minutes, five nights a week. I can collect it, and I'll send a photo once it's on the road.",
    category: "essentials",
    goalAmount: 210,
    currency: "GBP",
    imageUrl: img("1485965120184-e220f721d03e"),
    itemUrl: null,
    fulfillmentMethod: "either",
    anonymous: false,
    createdAt: days(26),
    raisedAmount: 130,
    supporterCount: 8,
  },
  {
    id: "w_headphones",
    authorId: "p_felix",
    title: "Closed-back headphones for my music production course",
    story:
      "I mix on cheap earbuds and my tutor says it's holding me back — I can't hear the low end my classmates are hearing. A pair of standard studio headphones is the one piece of gear the course assumes we already own. Retail listing linked, sealed, with a two-year warranty.",
    category: "technology",
    goalAmount: 300,
    currency: "USD",
    imageUrl: img("1505740420928-5e560c06d30e"),
    itemUrl: "https://www.sweetwater.com/c655--Studio_Headphones",
    fulfillmentMethod: "gift",
    anonymous: false,
    createdAt: days(5),
    raisedAmount: 0,
    supporterCount: 0,
  },
  {
    id: "w_paint",
    authorId: "p_olive",
    title: "Replacement paints and brushes after the studio flood",
    story:
      "A pipe went above our shared studio and took out half my materials. I don't need a new studio — just oils, three brushes and boards to keep the commission I already signed. My insurer covered the walls but not personal supplies.",
    category: "other",
    goalAmount: 160,
    currency: "USD",
    imageUrl: img("1579783902614-a3fb3927b6a5"),
    itemUrl: null,
    fulfillmentMethod: "contribute",
    anonymous: true,
    createdAt: days(61),
    raisedAmount: 160,
    supporterCount: 5,
    thankYou:
      "The commission is finished and it's hanging where it belongs. Thank you for helping a stranger finish something beautiful. I've set aside a little each month to do the same for someone else here.",
  },
  {
    id: "w_tablet",
    authorId: "p_leila",
    title: "A tablet so I stop sharing one screen with my brother",
    story:
      "We're both in our final school year and we share a single phone for classes. Splitting the day means one of us misses live sessions most weeks. A modest tablet with stylus support would let us both follow lectures at the same time. I've linked a mid-range model with a student return policy.",
    category: "technology",
    goalAmount: 380,
    currency: "USD",
    imageUrl: img("1544244015-0df4b3ffc6b0"),
    itemUrl: "https://www.amazon.com/s?k=tablet+with+stylus",
    fulfillmentMethod: "either",
    anonymous: false,
    createdAt: days(3),
    raisedAmount: 145,
    supporterCount: 4,
    featured: true,
  },
  {
    id: "w_wheelchair",
    authorId: "p_sam",
    title: "A repair for my father's wheelchair",
    story:
      "The caster forks bent and the seat upholstery split. He refuses to go out until it's fixed because it's embarrassing to him. Two parts and an afternoon at the mobility shop — I've had the quote in writing and can send it to anyone who wants to see it before helping.",
    category: "essentials",
    goalAmount: 130,
    currency: "USD",
    imageUrl: img("1581591524425-c7e0978865fc"),
    itemUrl: null,
    fulfillmentMethod: "contribute",
    anonymous: false,
    createdAt: days(2),
    raisedAmount: 65,
    supporterCount: 3,
  },
  {
    id: "w_garden",
    authorId: "p_hana",
    title: "Seeds and soil for the community garden beds",
    story:
      "Our garden has four empty beds and a waiting list of eleven families. Soil, seeds and a shared watering can would get them planted before the season closes. Receipts go to the whole group — we post them on the garden noticeboard.",
    category: "other",
    goalAmount: 140,
    currency: "USD",
    imageUrl: img("1416879595882-3373a0480b5b"),
    itemUrl: null,
    fulfillmentMethod: "either",
    anonymous: false,
    createdAt: days(6),
    raisedAmount: 95,
    supporterCount: 6,
  },
  {
    id: "w_weekend",
    authorId: "p_hana",
    title: "One quiet weekend after fourteen months of caregiving",
    story:
      "I've been caring for my father full-time since last year. A two-night stay somewhere with a window and no alarms would be the first rest in a long time. I've picked a place with free cancellation, and I'll gladly share the booking confirmation rather than an address.",
    category: "experiences",
    goalAmount: 320,
    currency: "GBP",
    imageUrl: img("1470229722913-7ea0d2ea3d99"),
    itemUrl: null,
    fulfillmentMethod: "contribute",
    anonymous: false,
    createdAt: days(29),
    raisedAmount: 80,
    supporterCount: 3,
  },
  {
    id: "w_keyboard",
    authorId: "p_ridley",
    title: "Mechanical keyboard for accessible typing",
    story:
      "I have limited hand mobility after an injury and my therapist recommended a light-touch keyboard with larger key spacing. I've attached the model my occupational therapist suggested.",
    category: "technology",
    goalAmount: 150,
    currency: "USD",
    imageUrl: img("1587829741301-dc798b83add3"),
    itemUrl: null,
    fulfillmentMethod: "contribute",
    anonymous: false,
    createdAt: days(4),
    raisedAmount: 40,
    supporterCount: 2,
  },
  {
    id: "w_cash",
    authorId: "p_ridley",
    title: "URGENT cash needed today, will repay 5x",
    story:
      "Message me directly for my payment details. Guaranteed return within 24 hours, no questions asked.",
    category: "other",
    goalAmount: 2000,
    currency: "USD",
    imageUrl: null,
    itemUrl: null,
    fulfillmentMethod: "contribute",
    anonymous: false,
    createdAt: days(1),
    raisedAmount: 0,
    supporterCount: 0,
  },
];

/** Deterministic supporter split so every wish's progress matches its contributions. */
function buildContributions(wishes: SeedWish[]): Contribution[] {
  const pool = demoProfiles.filter(
    (p) => p.role === "user" && p.status === "active" && p.id !== "p_ada",
  );
  const contributions: Contribution[] = [];
  let tick = 0;

  for (const wish of wishes) {
    const count = wish.supporterCount;
    if (!count || wish.raisedAmount <= 0) continue;
    const base = Math.floor(wish.raisedAmount / count);
    let remaining = wish.raisedAmount;
    for (let i = 0; i < count; i++) {
      const last = i === count - 1;
      const amount = last ? remaining : base + (i % 2 === 0 ? 0 : 1);
      remaining -= amount;
      const supporter =
        i === 0 && (wish.id === "w_glasses" || wish.id === "w_paint")
          ? "p_ada"
          : pool[(tick + i) % pool.length].id;
      contributions.push({
        id: `c_${wish.id}_${i}`,
        wishId: wish.id,
        supporterId: supporter,
        amount,
        currency: wish.currency,
        anonymous: (i + tick) % 3 === 0,
        method: i % 5 === 4 ? "gift_item" : "money",
        status: "confirmed",
        isDemo: true,
        reference: `DEMO-${wish.id.toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
        message: i % 4 === 0 ? "Rooting for you." : null,
        createdAt: new Date(
          new Date(wish.createdAt).getTime() + (i + 1) * 18 * 60 * 60 * 1000,
        ).toISOString(),
      });
    }
    tick += 3;
  }
  return contributions;
}

export function buildSeedStore() {
  const wishes: Wish[] = seedWishes.map((seed) => ({
    ...seed,
    thankYou: seed.thankYou ?? null,
    featured: seed.featured ?? false,
    status:
      seed.raisedAmount >= seed.goalAmount
        ? "fulfilled"
        : seed.raisedAmount > 0
          ? "partially_fulfilled"
          : "open",
    updatedAt: seed.createdAt,
    // The seeded scam wish stays out of the public feed but is visible in the
    // moderation queue so the report → remove → restore flow can be explored.
    removed: seed.id === "w_cash",
    removeReason:
      seed.id === "w_cash"
        ? "Removed pending moderation review: asks for off-platform payment and promises repayment."
        : null,
  }));

  const contributions = buildContributions(seedWishes);

  const saved: SavedWish[] = [
    { profileId: "p_ada", wishId: "w_laptop", createdAt: days(6) },
    { profileId: "p_ada", wishId: "w_bike", createdAt: days(4) },
    { profileId: "p_ada", wishId: "w_tablet", createdAt: days(1) },
  ];

  const notifications: AppNotification[] = [
    {
      id: "n_1",
      profileId: "p_ada",
      kind: "thank_you",
      title: "Noor sent a thank-you",
      body: "“Reading bedtime stories has become blurry…” — your support for the glasses wish was confirmed.",
      href: "/wishes/w_glasses",
      read: false,
      createdAt: days(40),
    },
    {
      id: "n_2",
      profileId: "p_ada",
      kind: "fulfilled",
      title: "A wish you supported is now fulfilled",
      body: "Art supplies after my studio flood reached its goal.",
      href: "/wishes/w_paint",
      read: false,
      createdAt: days(31),
    },
    {
      id: "n_3",
      profileId: "p_ada",
      kind: "welcome",
      title: "Welcome to WishDrop",
      body: "Browse without an account. Post, save and support when you're ready.",
      href: "/how-it-works",
      read: true,
      createdAt: days(210),
    },
  ];

  const reports: Report[] = [
    {
      id: "r_1",
      wishId: "w_cash",
      reporterId: "p_ada",
      reason: "scam",
      details:
        "Asks people to message payment details off-platform and promises a 5x return. Classic advance-payment pattern.",
      status: "open",
      createdAt: days(1),
      resolution: null,
    },
    {
      id: "r_2",
      wishId: "w_cash",
      reporterId: "p_marcus",
      reason: "misleading",
      details: "No actual item, no verifiable provider, and a suspicious repayment promise.",
      status: "open",
      createdAt: days(1),
      resolution: null,
    },
    {
      id: "r_3",
      wishId: "w_weekend",
      reporterId: "p_tom",
      reason: "other",
      details: "Was unsure whether a weekend away counts as an essential wish.",
      status: "dismissed",
      createdAt: days(20),
      resolution:
        "Reviewed: personal rest wishes are allowed under the platform rules as long as the amount is reasonable and verifiable. No action taken.",
    },
  ];

  const thankYous: ThankYou[] = [
    {
      id: "t_1",
      wishId: "w_glasses",
      fromProfileId: "p_noor",
      toProfileId: "p_ada",
      anonymous: false,
      message:
        "Thank you. We read three chapters that night — the first full story in a year and a half.",
      createdAt: days(40),
    },
    {
      id: "t_2",
      wishId: "w_paint",
      fromProfileId: "p_olive",
      toProfileId: "p_ada",
      anonymous: true,
      message: "The commission is finished. I've started saving to do the same for someone else.",
      createdAt: days(31),
    },
  ];

  return {
    version: 1,
    profiles: demoProfiles,
    wishes,
    contributions,
    saved,
    notifications,
    reports,
    thankYous,
  };
}
