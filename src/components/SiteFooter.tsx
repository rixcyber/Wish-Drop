import { Link } from "react-router-dom";
import { Logo } from "./Logo";
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
    <footer className="mt-24 border-t-2 border-border bg-secondary/50">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs space-y-4">
            <Logo />
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              A quiet place to ask for what you actually need, and to give without needing to be
              seen doing it.
            </p>
            <p className="text-[12px] italic leading-relaxed text-muted-foreground/80">
              “You never know who might be in a position to make your day.”
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title} className="space-y-3">
              <h3 className="font-meta text-[10px] font-bold uppercase text-muted-foreground">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-primary"
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
          <div className="mt-12 border-2 border-border bg-card px-4 py-3.5 shadow-[3px_3px_0_hsl(var(--foreground))]">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/80">Demo build. </span>
              {PAYMENT_DISCLOSURE} Wishes, supporters, notifications and moderation items on this
              site are sample data.
            </p>
          </div>
        ) : (
          <div className="mt-12 border-2 border-border bg-card px-4 py-3.5 shadow-[3px_3px_0_hsl(var(--foreground))]">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/80">Live site, donations closed. </span>
              {DONATIONS_CLOSED_COPY} Accounts, wishes and moderation are real.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t-2 border-border pt-6 font-meta text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} WishDrop. A community project, not a charity or a lender.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/rules" className="transition-colors hover:text-foreground">
              Rules
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link to="/payments" className="transition-colors hover:text-foreground">
              Payments
            </Link>
            <a href="mailto:moderation@wishdrop.demo" className="transition-colors hover:text-foreground">
              Contact moderation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
