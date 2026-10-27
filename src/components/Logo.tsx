import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="WishDrop home">
      <span className="relative grid h-8 w-8 place-items-center rounded-[10px] bg-foreground text-background shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] transition-transform duration-300 group-hover:-rotate-3">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M12 3.5l1.7 4.6 4.8 1.7-4.8 1.7L12 16.1l-1.7-4.6L5.5 9.8l4.8-1.7L12 3.5z"
            fill="currentColor"
          />
          <circle cx="18.2" cy="17.4" r="1.6" fill="currentColor" opacity="0.55" />
        </svg>
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">WishDrop</span>
      )}
    </Link>
  );
}
