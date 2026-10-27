import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishFeed } from "@/components/WishFeed";
import { Avatar } from "@/components/Avatar";
import { WishFeedHeader } from "@/components/SectionHeading";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { useCommunity, useWishSave } from "@/hooks/useCommunity";
import { useAuth } from "@/context/AuthContext";
import { backendMode } from "@/lib/api";
import { formatMoney, timeAgo } from "@/lib/format";

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
    <div className="bg-[#F8F5EE]">
      {/* Cinematic Hero */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient atmospheric glows */}
        <div
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-sage/35 via-butter/20 to-transparent blur-3xl -z-10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-48 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr from-coral/15 via-sage/15 to-transparent blur-3xl -z-10"
          aria-hidden="true"
        />

        <div className="container relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="animate-fade-up max-w-2xl">
            {/* Editorial Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-sage/40 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest">
              <Sparkles className="h-3.5 w-3.5 text-coral" strokeWidth={2} />
              A community of quiet generosity
            </div>

            {/* Expressive Cinematic Headline */}
            <h1 className="mt-6 font-serif text-[44px] sm:text-[62px] lg:text-[72px] font-normal leading-[1.04] tracking-tight text-forest text-balance">
              Where honest wishes meet{" "}
              <span className="italic font-medium text-coral">generous hands.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-6 max-w-xl text-[16px] sm:text-[18px] leading-relaxed text-olive font-sans">
              Big feelings, practical needs, real people. Share your situation with a clear,
              verifiable request — someone out there might be waiting to help.
            </p>

            {/* Action Buttons */}
            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
              <Button asChild size="lg" variant="coral" className="group shadow-md shadow-coral/20">
                <Link to="/post">
                  Make a Wish
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/explore">Explore Wishes</Link>
              </Button>
            </div>

            {/* Trust Anchors */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-olive font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-forest" strokeWidth={2} />
                No public phone numbers or addresses
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-forest" strokeWidth={2} />
                Anonymous if you prefer
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-forest" strokeWidth={2} />
                Every wish is moderated
              </span>
            </div>
          </div>

          {/* Right Side: Editorial Live Showcase Stack */}
          <div className="relative animate-fade-up lg:justify-self-end w-full max-w-md">
            <div className="relative rounded-3xl border border-olive/20 bg-white p-6 shadow-xl shadow-forest/5 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 border-b border-olive/15">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-coral animate-pulse" />
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-forest">
                    Fresh from the feed
                  </p>
                </div>
                <span className="rounded-full bg-sage/35 px-2.5 py-0.5 text-[10px] font-semibold text-forest uppercase tracking-wider">
                  Live wishes
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {visible.slice(0, 3).map((wish, index) => {
                  const author = profiles.find((profile) => profile.id === wish.authorId);
                  const identity = wish.anonymous || author?.anonymous ? "Anonymous" : author?.displayName ?? "A member";
                  return (
                    <Link
                      key={wish.id}
                      to={`/wishes/${wish.id}`}
                      className="group flex items-start gap-3.5 rounded-2xl border border-transparent p-2.5 transition-all duration-200 hover:border-olive/20 hover:bg-sage/15"
                    >
                      <Avatar
                        name={identity}
                        seed={wish.authorId}
                        anonymous={wish.anonymous || author?.anonymous}
                        src={author?.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-forest group-hover:text-coral transition-colors">
                          {wish.title}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-olive font-medium">
                          {formatMoney(wish.goalAmount, wish.currency)} · {wish.supporterCount} {wish.supporterCount === 1 ? "supporter" : "supporters"}
                        </p>
                      </div>
                      <span className="font-serif text-[12px] font-light text-olive/60 mt-1">
                        0{index + 1}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {visible.length === 0 && (
                <p className="mt-5 text-sm text-olive">The first wish is quietly waiting.</p>
              )}
            </div>

            {/* Overlapping Floating Pill */}
            <div
              className="absolute -bottom-4 -left-4 rounded-2xl border border-forest/15 bg-butter px-4 py-2 font-sans text-[11px] font-semibold text-forest shadow-md shadow-forest/5 hidden sm:flex items-center gap-2"
              aria-hidden="true"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-forest" />
              <span>{visible.length} wishes in the community</span>
            </div>
          </div>
        </div>

        {/* Live Community Impact Metrics */}
        <div className="container relative mt-16">
          <dl className="grid grid-cols-3 divide-x divide-olive/15 rounded-2xl border border-olive/20 bg-white/80 py-6 text-center shadow-sm backdrop-blur-sm">
            {[
              { label: "Open Wishes", value: visible.length - fulfilled.length },
              { label: "Supporters so far", value: supporters },
              { label: "Wishes Fulfilled", value: fulfilled.length },
            ].map((stat) => (
              <div key={stat.label} className="px-4">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-forest">
                    {stat.value}
                  </span>
                  <span className="mt-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-olive">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Redesigned "How It Works" Section */}
      <HowItWorksSection />

      {/* Community Wishes Feed */}
      <section id="feed" className="container scroll-mt-24 py-20 border-t border-olive/15">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <WishFeedHeader
            eyebrow="Community Wishes"
            title="Wishes waiting for someone like you"
            description="Small things, necessary things, and a few quiet dreams. Read the story before the amount."
          />
          <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
            <Link to="/explore">
              View all wishes
              <ArrowRight className="h-3.5 w-3.5 ml-1 text-coral" />
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

      {/* Recently Fulfilled — Deep Forest Cinematic Rhythm */}
      <section id="fulfilled" className="border-y border-forest-deep bg-forest text-ivory py-24">
        <div className="container scroll-mt-24">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-light bg-forest-surface px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-butter">
              Recently Fulfilled
            </span>
            <h2 className="text-balance font-serif text-[34px] sm:text-[44px] font-normal leading-[1.08] tracking-tight text-ivory">
              Wishes that came true this season
            </h2>
            <p className="text-pretty text-[15px] leading-relaxed text-ivory/70">
              Shared with each recipient's consent. Names stay private unless the person chooses otherwise.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {recent.map((wish) => (
              <Link
                  key={wish.id}
                  to={`/wishes/${wish.id}`}
                  className="group flex flex-col justify-between rounded-3xl border border-forest-light bg-forest-surface/75 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-forest/50 hover:shadow-xl hover:shadow-black/20"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-butter">
                        <BadgeCheck className="h-3.5 w-3.5 text-butter" strokeWidth={2} />
                        Fulfilled
                      </span>
                      <span className="text-[11px] text-ivory/55">{timeAgo(wish.updatedAt)}</span>
                    </div>
                    <h3 className="mt-4 font-serif text-[20px] font-semibold leading-snug text-ivory group-hover:text-coral transition-colors">
                      {wish.title}
                    </h3>
                    <p className="mt-3 font-serif italic line-clamp-3 text-[14px] leading-relaxed text-ivory/80">
                      “{wish.thankYou}”
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-forest-light/60 pt-4 text-[12px] text-ivory/60">
                    <span>
                      {formatMoney(wish.raisedAmount, wish.currency)} · 100% funded
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-coral group-hover:underline">
                      Read story
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Closing Section */}
      <section className="container py-24 sm:py-32">
        <div className="relative overflow-hidden rounded-3xl border border-olive/20 bg-white p-8 sm:p-16 text-center shadow-sm">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sage/20 via-butter/10 to-transparent blur-2xl -z-10"
            aria-hidden="true"
          />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-sage/35 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-forest">
            It starts with one wish
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-balance font-serif text-[32px] sm:text-[46px] font-normal leading-[1.1] tracking-tight text-forest">
            You never know who might be in a position to make your day.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] sm:text-[16px] leading-relaxed text-olive font-sans">
            Post something honest. Or read quietly for a while and see what moves you. Both are
            meaningful contributions to a place like this.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
            <Button asChild size="lg" variant="coral" className="shadow-md shadow-coral/20">
              <Link to="/post">Make a wish</Link>
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
