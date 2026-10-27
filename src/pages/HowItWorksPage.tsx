import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Ban,
  EyeOff,
  Gift,
  HeartHandshake,
  Lock,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/SectionHeading";
import { GOAL_LIMITS } from "@/lib/types";

const STEPS = [
  {
    num: "01",
    icon: Sparkles,
    title: "Post one honest wish",
    body: "Describe the thing you need or dream about, why it matters, and what it costs. Add a link to a real retailer or a quote if you have one. One wish at a time keeps this place readable.",
    detail: `Amounts between the platform minimum and ${GOAL_LIMITS.max.toLocaleString("en-US")} in your currency.`,
    cardClass: "bg-white border-olive/20",
    iconBg: "bg-sage/40 text-forest",
  },
  {
    num: "02",
    icon: HeartHandshake,
    title: "Someone reads it and chooses",
    body: "Supporters browse freely. There is no algorithm pushing urgency at them and no countdown. If a wish resonates, they can gift the item or contribute toward it.",
    detail: "Supporters can remain anonymous to the recipient and to everyone else.",
    cardClass: "bg-white border-olive/20",
    iconBg: "bg-butter/50 text-forest",
  },
  {
    num: "03",
    icon: Lock,
    title: "Fulfilment happens privately",
    body: "WishDrop never publishes addresses, phone numbers or delivery details. Once a wish is funded, the two people arrange delivery inside the platform, with consent from both sides.",
    detail: "Nothing is marked fulfilled until the payment provider or retailer confirms it.",
    cardClass: "bg-forest text-ivory border-forest-light shadow-xl shadow-forest/10",
    iconBg: "bg-coral/20 text-coral",
  },
];

const RULES = [
  {
    icon: Ban,
    title: "Never off-platform payment",
    body: "Gift cards, crypto, wire transfers, cash apps and “message me for details” are removed on sight.",
  },
  {
    icon: EyeOff,
    title: "No personal data in stories",
    body: "No addresses, phone numbers, ID numbers, school names or children's full names. Share only what a stranger needs to trust the wish.",
  },
  {
    icon: Wallet,
    title: "One clear price",
    body: "Wishes state a specific item or verifiable expense. Loans, investment promises and “repay 5x” requests are prohibited.",
  },
  {
    icon: MessagesSquare,
    title: "Kindness only",
    body: "Harassment, pressure and public shaming of people who ask for help are grounds for removal and suspension.",
  },
];

export function HowItWorksPage() {
  return (
    <div className="container py-14 sm:py-20">
      <PageHeader
        eyebrow="How it works"
        title="A quiet exchange, with clear guardrails."
        description="WishDrop exists so that a specific need can meet a specific person without turning either of them into content. Here is exactly how it works — and what we will not allow."
        actions={
          <Button asChild variant="coral">
            <Link to="/post">Post a wish</Link>
          </Button>
        }
      />

      {/* The 3 Steps */}
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {STEPS.map((step, index) => {
          const isDark = index === 2;
          return (
            <div
              key={step.title}
              className={`rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${step.cardClass}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex rounded-2xl p-3 shadow-sm ${step.iconBg}`}>
                    <step.icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className={`font-serif text-[38px] font-light ${isDark ? "text-ivory/30" : "text-forest/20"}`}>
                    {step.num}
                  </span>
                </div>
                <h2 className={`mt-6 font-serif text-[22px] font-semibold ${isDark ? "text-ivory" : "text-forest"}`}>
                  {step.title}
                </h2>
                <p className={`mt-3 text-[14px] leading-relaxed ${isDark ? "text-ivory/80" : "text-olive"}`}>
                  {step.body}
                </p>
              </div>
              <p
                className={`mt-6 border-t pt-4 text-[12px] font-medium leading-relaxed ${
                  isDark ? "border-forest-surface text-butter" : "border-olive/15 text-forest"
                }`}
              >
                {step.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* What supporters can do & What gets removed */}
      <section className="mt-20 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-coral">
              Participation
            </span>
            <h2 className="mt-2 font-serif text-[30px] font-semibold text-forest">
              What supporters can do
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-olive">
              Two fulfilling methods, both optional, neither one public unless you want it to be.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-olive/20 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-forest">
                <span className="p-2 rounded-xl bg-sage/35 text-forest">
                  <Gift className="h-4 w-4" strokeWidth={2} />
                </span>
                Gift an item
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-olive">
                Buy the exact item through a verified retailer. WishDrop records the order value so
                the wish's progress stays accurate, and delivery is arranged privately.
              </p>
            </div>

            <div className="rounded-2xl border border-olive/20 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-forest">
                <span className="p-2 rounded-xl bg-butter/50 text-forest">
                  <Wallet className="h-4 w-4" strokeWidth={2} />
                </span>
                Contribute toward it
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-olive">
                Several people can cover part of a wish. Contributions are only counted once a
                payment provider confirms them, and refunds follow the published policy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-butter/80 bg-butter/25 p-5 text-[13px] leading-relaxed text-forest">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-coral" strokeWidth={2} />
            <span>
              This build runs in demo mode. No cards are charged, no money moves, and the interface
              states this clearly at every step.
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-coral">
              Community Boundaries
            </span>
            <h2 className="mt-2 font-serif text-[30px] font-semibold text-forest">
              What gets a wish removed
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-olive">
              Strict rules to keep WishDrop authentic, dignified, and safe for everyone.
            </p>
          </div>

          <div className="space-y-3.5">
            {RULES.map((rule) => (
              <div key={rule.title} className="flex gap-4 rounded-2xl border border-olive/20 bg-white p-5 shadow-sm">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral">
                  <rule.icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-[14.5px] font-semibold text-forest">{rule.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-olive">{rule.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust banner */}
      <section className="mt-20 rounded-3xl border border-forest-light bg-forest p-8 sm:p-12 text-ivory shadow-xl shadow-forest/10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-butter">
              <ShieldCheck className="h-4 w-4 text-butter" strokeWidth={2} />
              Trust is the product
            </div>
            <h2 className="font-serif text-[28px] sm:text-[34px] font-semibold text-ivory">
              Every wish is reviewed. Every report is answered.
            </h2>
            <p className="text-[14.5px] leading-relaxed text-ivory/75">
              Every wish has a report button, every report reaches human moderation, and every removal
              is explained directly to the creator. If something feels off, flag it.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="border-ivory/20 text-ivory bg-transparent hover:bg-forest-surface hover:text-ivory">
              <Link to="/rules">Platform rules</Link>
            </Button>
            <Button asChild variant="coral">
              <Link to="/explore">Explore wishes</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
