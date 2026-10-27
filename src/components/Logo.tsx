import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="WishDrop home">
      <span className="relative grid h-8 w-8 place-items-center border-2 border-border bg-primary text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] transition-transform duration-200 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M12 3.5l1.7 4.6 4.8 1.7-4.8 1.7L12 16.1l-1.7-4.6L5.5 9.8l4.8-1.7L12 3.5z"
            fill="currentColor"
          />
          <circle cx="18.2" cy="17.4" r="1.6" fill="currentColor" opacity="0.55" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-[22px] leading-none text-foreground">WishDrop</span>
      )}
    </Link>
  );
}
