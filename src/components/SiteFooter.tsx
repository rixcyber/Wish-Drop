import { Link } from "react-router-dom";
import { PAYMENT_DISCLOSURE } from "@/lib/payments";
import { backendMode } from "@/lib/api";
import { DONATIONS_CLOSED_COPY } from "@/lib/config";

const COLUMNS = [
  {
    title: "Community",
    links: [
      { label: "Explore wishes", to: "/explore" },
      { label: "Post a wish", to: "/post" },
      { label: "Recently fulfilled", to: "/#fulfilled" },
      { label: "How it works", to: "/how-it-works" },
    ],
  },
  {
    title: "Trust & safety",
    links: [
      { label: "Platform rules", to: "/rules" },
      { label: "Report a wish", to: "/rules#reporting" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Payment disclosure", to: "/payments" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Sign in", to: "/signin" },
      { label: "My dashboard", to: "/account" },
      { label: "Saved wishes", to: "/account?tab=saved" },
      { label: "Notifications", to: "/account?tab=notifications" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t border-forest-deep bg-forest text-ivory">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs space-y-4">
            <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="WishDrop home">
              <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-ivory text-forest shadow-sm transition-transform duration-300 group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path
                    d="M12 3.5l1.7 4.6 4.8 1.7-4.8 1.7L12 16.1l-1.7-4.6L5.5 9.8l4.8-1.7L12 3.5z"
                    fill="#173D35"
                  />
                  <circle cx="18.2" cy="17.4" r="2" fill="#FF725E" />
                </svg>
              </span>
              <span className="font-serif text-[23px] font-bold tracking-tight text-ivory">
                WishDrop
              </span>
            </Link>
            <p className="text-[14px] leading-relaxed text-ivory/70">
              A quiet place to ask for what you genuinely need, and to give without needing an audience.
            </p>
            <p className="font-serif text-[13.5px] italic leading-relaxed text-butter/85">
              “You never know who might be in a position to make your day.”
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title} className="space-y-4">
              <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-butter">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13.5px] text-ivory/70 transition-colors hover:text-coral"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {backendMode === "local-demo" ? (
          <div className="mt-14 rounded-2xl border border-forest-light bg-forest-surface/60 px-5 py-4">
            <p className="text-[12.5px] leading-relaxed text-ivory/70">
              <span className="font-semibold text-butter">Demo build. </span>
              {PAYMENT_DISCLOSURE} Wishes, supporters, notifications and moderation items on this
              site are sample data.
            </p>
          </div>
        ) : (
          <div className="mt-14 rounded-2xl border border-forest-light bg-forest-surface/60 px-5 py-4">
            <p className="text-[12.5px] leading-relaxed text-ivory/70">
              <span className="font-semibold text-butter">Live site, donations closed. </span>
              {DONATIONS_CLOSED_COPY} Accounts, wishes and moderation are real.
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 border-t border-forest-surface pt-8 text-[12px] text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} WishDrop. A community project, not a charity or a lender.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/rules" className="transition-colors hover:text-coral">
              Rules
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-coral">
              Privacy
            </Link>
            <Link to="/payments" className="transition-colors hover:text-coral">
              Payments
            </Link>
            <a href="mailto:moderation@wishdrop.demo" className="transition-colors hover:text-coral">
              Contact moderation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
