import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, HeartHandshake, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { GOAL_LIMITS } from "@/lib/types";

export function HowItWorksSection({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      num: "01",
      title: "Make a wish",
      eyebrow: "Personal & Specific",
      badge: `Up to ${GOAL_LIMITS.max.toLocaleString("en-US")} in currency`,
      body: "Describe a specific item or verifiable expense, explain why it matters to your life, and state a transparent amount. One open wish at a time keeps every story clear and dignified.",
      icon: Sparkles,
      iconBg: "bg-sage/40 text-forest",
      cardBg: "bg-white border-olive/20 hover:border-forest/30",
      accentDot: "bg-coral",
      tag: "Single wish rule",
    },
    {
      num: "02",
      title: "Someone steps in",
      eyebrow: "Thoughtful Gifting",
      badge: "No algorithms or urgency",
      body: "Supporters browse openly without aggressive countdowns. If a wish resonates, they choose to contribute towards the total or gift the item directly. Supporters may remain completely anonymous.",
      icon: HeartHandshake,
      iconBg: "bg-butter/50 text-forest",
      cardBg: "bg-white border-olive/20 hover:border-forest/30",
      accentDot: "bg-butter",
      tag: "Anonymous giving",
    },
    {
      num: "03",
      title: "Keep it personal",
      eyebrow: "Private Fulfilment",
      badge: "Zero public phone numbers",
      body: "WishDrop never publishes your home address or contact details. Once funded, both sides arrange delivery privately inside WishDrop with mutual consent. No tracking or unwanted contact.",
      icon: Lock,
      iconBg: "bg-coral/20 text-coral",
      cardBg: "bg-forest text-ivory border-forest-light shadow-xl shadow-forest/10 hover:shadow-2xl hover:border-forest/40",
      accentDot: "bg-sage",
      tag: "Mutual consent",
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className={cn("scroll-mt-24 py-24 sm:py-32 relative overflow-hidden", className)}
    >
      {/* Subtle organic ambient radial wash */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-sage/25 via-butter/10 to-transparent blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="container relative">
        {/* Editorial Section Introduction */}
        <div
          className={cn(
            "max-w-3xl space-y-4 transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-sage/40 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse" />
            HOW IT WORKS / 01—03
          </div>

          <h2 className="font-serif text-[38px] sm:text-[52px] lg:text-[60px] font-normal leading-[1.06] tracking-tight text-forest text-balance">
            Good things begin with a{" "}
            <span className="italic font-medium text-coral underline decoration-sage decoration-wavy decoration-1 underline-offset-8">
              simple wish.
            </span>
          </h2>

          <p className="text-[16px] sm:text-[18px] leading-relaxed text-olive max-w-2xl font-sans">
            WishDrop brings a specific need together with someone who wants to help. No noise. Just a
            little thoughtfulness, passed along.
          </p>
        </div>

        {/* The Three Steps — Editorial Staggered Layout */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-6 relative">
          {/* Subtle connecting track on large displays */}
          <div
            className="hidden lg:block absolute top-[110px] left-[15%] right-[15%] h-px border-t border-dashed border-olive/30 -z-10"
            aria-hidden="true"
          />

          {steps.map((step, index) => {
            const isDark = index === 2;
            const staggerClasses = ["lg:translate-y-0", "lg:translate-y-6", "lg:translate-y-12"][index];
            const delayClasses = ["delay-100", "delay-200", "delay-300"][index];

            return (
              <div
                key={step.num}
                className={cn(
                  "group relative flex flex-col justify-between rounded-3xl border p-8 transition-all duration-500 ease-out hover:-translate-y-2",
                  step.cardBg,
                  staggerClasses,
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                  delayClasses,
                )}
              >
                {/* Header row: Step Number & Icon */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={cn(
                        "font-serif text-[48px] sm:text-[56px] font-light leading-none transition-colors duration-300",
                        isDark ? "text-ivory/30 group-hover:text-coral" : "text-forest/20 group-hover:text-coral",
                      )}
                    >
                      {step.num}
                    </span>
                    <div
                      className={cn(
                        "grid h-12 w-12 place-items-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110",
                        step.iconBg,
                      )}
                    >
                      <step.icon className="h-5 w-5" strokeWidth={1.9} />
                    </div>
                  </div>

                  {/* Eyebrow & Headline */}
                  <div className="mt-6 space-y-1.5">
                    <span
                      className={cn(
                        "font-sans text-[11px] font-semibold uppercase tracking-[0.16em]",
                        isDark ? "text-butter" : "text-coral",
                      )}
                    >
                      {step.eyebrow}
                    </span>
                    <h3
                      className={cn(
                        "font-serif text-[24px] sm:text-[27px] font-semibold leading-tight",
                        isDark ? "text-ivory" : "text-forest",
                      )}
                    >
                      {step.title}
                    </h3>
                  </div>

                  {/* Body copy */}
                  <p
                    className={cn(
                      "mt-4 text-[14.5px] leading-relaxed",
                      isDark ? "text-ivory/80" : "text-olive",
                    )}
                  >
                    {step.body}
                  </p>
                </div>

                {/* Footer badge with visual detail */}
                <div
                  className={cn(
                    "mt-8 flex items-center justify-between border-t pt-4 text-[12px]",
                    isDark ? "border-forest-surface text-ivory/70" : "border-olive/15 text-olive",
                  )}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className={cn("h-1.5 w-1.5 rounded-full", step.accentDot)} />
                    {step.badge}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider",
                      isDark ? "bg-forest-surface text-butter" : "bg-sage/35 text-forest",
                    )}
                  >
                    {step.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Editorial Section Closing Note & Rules Link */}
        <div
          className={cn(
            "mt-24 rounded-2xl border border-olive/20 bg-white/70 p-6 sm:p-8 backdrop-blur-sm shadow-sm transition-all duration-700 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage/40 text-forest">
                <CheckCircle2 className="h-5 w-5 text-forest" strokeWidth={2} />
              </span>
              <div>
                <p className="font-serif text-[18px] sm:text-[20px] font-semibold text-forest">
                  Thoughtful giving. Clear boundaries. No pressure.
                </p>
                <p className="mt-1 text-[13.5px] text-olive">
                  WishDrop never handles cash gifts, loans, wire transfers or crypto. Everything stays
                  verifiable and kind.
                </p>
              </div>
            </div>

            <Link
              to="/rules"
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-forest/20 bg-forest px-5 py-2.5 text-[13.5px] font-semibold text-ivory shadow-sm transition-all duration-200 hover:bg-forest-surface hover:shadow hover:-translate-y-0.5"
            >
              Read the full rules
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 text-coral" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
