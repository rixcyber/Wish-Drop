import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  Lock,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishFeed } from "@/components/WishFeed";
import { Avatar } from "@/components/Avatar";
import { WishFeedHeader } from "@/components/SectionHeading";
import { useCommunity, useWishSave } from "@/hooks/useCommunity";
import { useAuth } from "@/context/AuthContext";
import { backendMode } from "@/lib/api";
import { formatMoney, timeAgo } from "@/lib/format";
import { wishProgress } from "@/lib/backend";

export function HomePage() {
  const { wishes, profiles, loading } = useCommunity();
  const { savedIds } = useAuth();
  const onToggleSave = useWishSave();

  const visible = wishes.filter((wish) => !wish.removed);
  const fulfilled = visible.filter((wish) => wish.status === "fulfilled");
  const supporters = visible.reduce((total, wish) => total + wish.supporterCount, 0);
  const recent = [...visible]
    .filter((wish) => wish.thankYou)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="pointer-events-none absolute inset-0 grid-glow opacity-70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,246,230,0.07),transparent_65%)]"
          aria-hidden="true"
        />
        <div className="container relative grid gap-14 pb-20 pt-20 md:pb-28 md:pt-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="h-3 w-3" strokeWidth={1.8} />
              A community of quiet generosity
            </span>
            <h1 className="mt-7 text-balance text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-6xl">
              Someone out there might make your wish come true.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-[15.5px] leading-relaxed text-muted-foreground">
              Share something you wish for. Discover someone else's dream. Make kindness a little
              more tangible.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="group">
                <Link to="/explore">
                  Explore Wishes
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/post">Share Your Wish</Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" strokeWidth={1.8} />
                No addresses, no phone numbers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" strokeWidth={1.8} />
                Anonymous if you prefer
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                Every wish is reportable
              </span>
            </div>
          </div>

          {/* Subtle "wishes being fulfilled" panel */}
          <div className="relative animate-fade-up lg:justify-self-end">
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 shadow-[0_30px_80px_-50px_rgba(0,0,0,1)] backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Just fulfilled
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300/90">
                  <BadgeCheck className="h-3 w-3" strokeWidth={2} />
                  Confirmed
                </span>
              </div>
              <div className="mt-4 space-y-3.5">
                {recent.map((wish) => {
                  const author = profiles.find((profile) => profile.id === wish.authorId);
                  const identity = wish.anonymous || author?.anonymous ? "Anonymous" : author?.displayName ?? "A member";
                  return (
                    <Link
                      key={wish.id}
                      to={`/wishes/${wish.id}`}
                      className="flex items-start gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border/70 hover:bg-accent/40"
                    >
                      <Avatar
                        name={identity}
                        seed={wish.authorId}
                        anonymous={wish.anonymous || author?.anonymous}
                        src={author?.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-medium text-foreground/90">
                          {wish.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatMoney(wish.goalAmount, wish.currency)} · {wish.supporterCount} supporters
                        </p>
                      </div>
                      <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-400/70" strokeWidth={1.8} />
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-border/60 pt-3.5">
                <p className="flex items-start gap-2 text-[11.5px] italic leading-relaxed text-muted-foreground">
                  <MessageSquareHeart className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.7} />
                  “They arrived on Tuesday and my daughter picked the frames. We read three chapters
                  that night.”
                </p>
              </div>
            </div>
            <div
              className="absolute -bottom-5 -left-6 hidden rounded-xl border border-border/60 bg-background/90 px-3.5 py-2.5 text-[11px] text-muted-foreground shadow-xl backdrop-blur sm:block"
              aria-hidden="true"
            >
              <span className="text-foreground/85">{fulfilled.length} wishes</span> completed by
              strangers
            </div>
          </div>
        </div>

        <div className="container relative pb-12">
          <dl className="grid grid-cols-3 divide-x divide-border/60 rounded-2xl border border-border/60 bg-card/30 py-5 text-center backdrop-blur">
            {[
              { label: "open wishes", value: visible.length - fulfilled.length },
              { label: "supporters so far", value: supporters },
              { label: "wishes fulfilled", value: fulfilled.length },
            ].map((stat) => (
              <div key={stat.label} className="px-3">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-xl font-semibold tracking-tight text-foreground/90 sm:text-2xl">
                    {stat.value}
                  </span>
                  <span className="mt-1 block text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container scroll-mt-24 py-20">
        <WishFeedHeader
          eyebrow="How it works"
          title="Three quiet steps, no spectacle"
          description="WishDrop is not crowdfunding and not a shop. It is a place where a specific need can meet a specific person."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Ask for something real",
              body: "Describe the item or expense, why it matters, and what it costs. One wish at a time, with a clear price — honesty is the whole currency here.",
            },
            {
              icon: HeartHandshake,
              title: "Someone chooses to help",
              body: "Supporters can gift the item through a verified retailer or contribute toward the amount. They can stay completely anonymous.",
            },
            {
              icon: ShieldCheck,
              title: "Delivery stays private",
              body: "No public addresses or phone numbers. Fulfilment is arranged privately inside WishDrop, and only after both people consent.",
            },
          ].map((step, index) => (
            <div
              key={step.title}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/40 p-6 transition-colors hover:border-border hover:bg-card/70"
            >
              <span className="absolute right-5 top-5 text-[11px] tabular-nums text-muted-foreground/60">
                0{index + 1}
              </span>
              <div className="mb-5 inline-flex rounded-xl border border-border/70 bg-secondary/40 p-2.5 text-foreground/80">
                <step.icon className="h-4 w-4" strokeWidth={1.7} />
              </div>
              <h3 className="text-[15px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
          <span>WishDrop never handles gift cards, wire transfers or crypto.</span>
          <Link to="/rules" className="text-foreground/80 underline-offset-4 hover:underline">
            Read the full rules
          </Link>
        </div>
      </section>

      {/* Feed */}
      <section id="feed" className="container scroll-mt-24 border-t border-border/50 py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <WishFeedHeader
            eyebrow="Community wishes"
            title="Wishes waiting for someone like you"
            description="Small things, necessary things, and a few dreams. Read the story before the price."
          />
          <Button asChild variant="ghost" size="sm" className="self-start text-muted-foreground sm:self-auto">
            <Link to="/explore">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <WishFeed
          wishes={visible}
          profiles={profiles}
          loading={loading}
          backendMode={backendMode}
          savedIds={savedIds}
          onToggleSave={onToggleSave}
          limit={6}
        />
      </section>

      {/* Recently fulfilled */}
      <section id="fulfilled" className="border-y border-border/50 bg-card/20">
        <div className="container scroll-mt-24 py-20">
          <WishFeedHeader
            eyebrow="Recently fulfilled"
            title="Wishes that came true this season"
            description="Shared with each wish owner's consent. Names stay private unless the person chooses otherwise."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {recent.map((wish) => {
              const progress = wishProgress(wish);
              return (
                <Link
                  key={wish.id}
                  to={`/wishes/${wish.id}`}
                  className="group flex flex-col rounded-2xl border border-border/70 bg-card/50 p-5 transition-colors hover:border-border hover:bg-card/80"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] text-emerald-300/80">
                      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.9} />
                      Fulfilled
                    </span>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(wish.updatedAt)}</span>
                  </div>
                  <h3 className="mt-4 text-balance text-[15px] font-semibold leading-snug">
                    {wish.title}
                  </h3>
                  <p className="mt-3 line-clamp-4 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                    “{wish.thankYou}”
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3.5 text-[11.5px] text-muted-foreground">
                    <span>
                      {formatMoney(wish.raisedAmount, wish.currency)} · {progress.percent}%
                    </span>
                    <span className="inline-flex items-center gap-1 text-foreground/70">
                      Read the story
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card/80 to-background px-6 py-16 text-center sm:px-12">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,245,225,0.09),transparent_70%)]"
            aria-hidden="true"
          />
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            It starts with one wish
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            You never know who might be in a position to make your day.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
            Post something honest. Or read for a while and see what moves you. Both are useful
            contributions to a place like this.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/post">Post a wish</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/explore">Explore wishes</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
