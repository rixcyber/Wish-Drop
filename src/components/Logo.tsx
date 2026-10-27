import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="WishDrop home">
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-forest text-ivory shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M12 3.5l1.7 4.6 4.8 1.7-4.8 1.7L12 16.1l-1.7-4.6L5.5 9.8l4.8-1.7L12 3.5z"
            fill="#F8F5EE"
          />
          <circle cx="18.2" cy="17.4" r="2" fill="#FF725E" />
        </svg>
      </span>
      {!compact && (
        <span className="font-serif text-[23px] font-bold tracking-tight text-forest transition-colors">
          WishDrop
        </span>
      )}
    </Link>
  );
}
