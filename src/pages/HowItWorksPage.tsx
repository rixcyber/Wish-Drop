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

const STEPS = [
  {
    icon: Sparkles,
    title: "Post one honest wish",
    body: "Describe the thing you need or dream about, why it matters, and what it costs. Add a link to a real retailer or a quote if you have one. One wish at a time keeps this place readable.",
    detail: "Amounts between the platform minimum and 2,000 in your currency.",
  },
  {
    icon: HeartHandshake,
    title: "Someone reads it and chooses",
    body: "Supporters browse freely. There is no algorithm pushing urgency at them and no countdown. If a wish resonates, they can gift the item or contribute toward it.",
    detail: "Supporters can remain anonymous to the recipient and to everyone else.",
  },
  {
    icon: Lock,
    title: "Fulfilment happens privately",
    body: "WishDrop never publishes addresses, phone numbers or delivery details. Once a wish is funded, the two people arrange delivery inside the platform, with consent from both sides.",
    detail: "Nothing is marked fulfilled until the payment provider or retailer confirms it.",
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
    <div className="container py-12 sm:py-16">
      <PageHeader
        eyebrow="How it works"
        title="A quiet exchange, with guardrails."
        description="WishDrop exists so that a specific need can meet a specific person without turning either of them into content. Here is exactly how it works — and what we will not allow."
        actions={
          <Button asChild>
            <Link to="/post">Post a wish</Link>
          </Button>
        }
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-border/70 bg-card/40 p-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex rounded-xl border border-border/70 bg-secondary/40 p-2.5 text-foreground/80">
                <step.icon className="h-4 w-4" strokeWidth={1.7} />
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground/60">0{index + 1}</span>
            </div>
            <h2 className="mt-5 text-[15px] font-semibold">{step.title}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>
            <p className="mt-4 border-t border-border/60 pt-3 text-[11.5px] leading-relaxed text-muted-foreground/90">
              {step.detail}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.015em]">What supporters can do</h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            Two fulfilling methods, both optional, neither one public unless you want it to be.
          </p>
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-border/70 bg-card/40 p-5">
              <div className="flex items-center gap-2 text-[13.5px] font-medium">
                <Gift className="h-4 w-4" strokeWidth={1.7} />
                Gift an item
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Buy the exact item through a verified retailer. WishDrop records the order value so
                the wish's progress stays accurate, and delivery is arranged privately.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/40 p-5">
              <div className="flex items-center gap-2 text-[13.5px] font-medium">
                <Wallet className="h-4 w-4" strokeWidth={1.7} />
                Contribute toward it
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Several people can cover part of a wish. Contributions are only counted once a
                payment provider confirms them, and refunds follow the published policy.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-[12px] leading-relaxed text-amber-100/80">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/70" strokeWidth={1.8} />
            <span>
              This build runs payments in demo mode. Nothing is charged, no order is placed, and the
              interface says so at every step.
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.015em]">What gets a wish removed</h2>
          <div className="mt-6 space-y-3">
            {RULES.map((rule) => (
              <div key={rule.title} className="flex gap-4 rounded-xl border border-border/70 bg-card/30 p-4">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted-foreground">
                  <rule.icon className="h-4 w-4" strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="text-[13.5px] font-medium">{rule.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{rule.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-border/70 bg-card/30 p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="flex items-center gap-2 text-[18px] font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-300/80" strokeWidth={1.8} />
              Trust is the product
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
              Every wish has a report control, every report reaches a human queue, and every removal
              is explained to the person who posted it. If something feels wrong, say so — that is
              part of participating here.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link to="/rules">Platform rules</Link>
            </Button>
            <Button asChild>
              <Link to="/explore">Start reading</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
