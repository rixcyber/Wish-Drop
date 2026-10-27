import { Link } from "react-router-dom";
import { Bookmark, HeartHandshake, Users } from "lucide-react";
import { Avatar, publicIdentity } from "./Avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/field";
import { cn } from "@/lib/utils";
import { formatMoney, timeAgo } from "@/lib/format";
import { CATEGORY_LABELS, wishProgress } from "@/lib/backend";
import type { Profile, Wish } from "@/lib/types";

export function StatusBadge({ status, className }: { status: Wish["status"]; className?: string }) {
  if (status === "fulfilled") {
    return (
      <Badge variant="success" className={className}>
        Fulfilled
      </Badge>
    );
  }
  if (status === "partially_fulfilled") {
    return (
      <Badge variant="warning" className={className}>
        Partially fulfilled
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={className}>
      Open
    </Badge>
  );
}

export function CategoryLabel({ category, className }: { category: Wish["category"]; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-forest/15 bg-sage/35 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-forest",
        className,
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

interface WishCardProps {
  wish: Wish;
  author?: Profile | null;
  saved?: boolean;
  onToggleSave?: (wishId: string) => void;
  className?: string;
}

export function WishCard({ wish, author, saved, onToggleSave, className }: WishCardProps) {
  const identity = publicIdentity(author, wish.authorId, wish.anonymous);
  const progress = wishProgress(wish);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-olive/20 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-forest/30 hover:shadow-xl hover:shadow-forest/5",
        className,
      )}
    >
      {wish.imageUrl && (
        <Link
          to={`/wishes/${wish.id}`}
          className="relative block aspect-[16/10] overflow-hidden border-b border-olive/10 bg-sage/20"
          aria-label={wish.title}
          tabIndex={-1}
        >
          <img
            src={wish.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent" />
          <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-forest backdrop-blur-sm shadow-sm">
            {CATEGORY_LABELS[wish.category]}
          </span>
        </Link>
      )}

      <div className="flex flex-1 flex-col gap-3.5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              name={identity.name}
              seed={wish.authorId}
              anonymous={identity.anonymous}
              src={identity.avatarUrl}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-ink">{identity.name}</p>
              <p className="text-[11px] text-olive">{timeAgo(wish.createdAt)}</p>
            </div>
          </div>
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(wish.id)}
              aria-label={saved ? "Remove from saved wishes" : "Save this wish"}
              aria-pressed={Boolean(saved)}
              className={cn(
                "-mr-1 -mt-1 rounded-xl border border-transparent p-2 transition-all",
                saved
                  ? "bg-sage/40 text-forest"
                  : "text-olive/70 hover:border-olive/20 hover:bg-sage/20 hover:text-forest",
              )}
            >
              <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {!wish.imageUrl && (
          <div>
            <CategoryLabel category={wish.category} />
          </div>
        )}

        <Link to={`/wishes/${wish.id}`} className="block">
          <h3 className="text-balance font-serif text-[21px] font-semibold leading-[1.25] text-forest transition-colors group-hover:text-coral">
            {wish.title}
          </h3>
        </Link>

        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-olive">{wish.story}</p>

        <div className="mt-auto space-y-3.5 pt-2">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <p className="text-forest">
              <span className="font-bold text-[15px]">{formatMoney(wish.raisedAmount, wish.currency)}</span>
              <span className="text-olive text-[12.5px]"> of {formatMoney(wish.goalAmount, wish.currency)}</span>
            </p>
            <span className="text-coral font-bold text-[12.5px] tabular-nums">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} />

          <div className="flex items-center justify-between gap-3 pt-1">
            <StatusBadge status={wish.status} />
            <span className="inline-flex items-center gap-1.5 text-[12px] text-olive">
              <Users className="h-3.5 w-3.5 text-olive/80" strokeWidth={1.8} />
              {wish.supporterCount} {wish.supporterCount === 1 ? "supporter" : "supporters"}
            </span>
          </div>

          <Link
            to={`/wishes/${wish.id}`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-forest/15 bg-ivory text-[13px] font-semibold text-forest shadow-sm transition-all duration-200 hover:border-forest hover:bg-forest hover:text-ivory"
          >
            <HeartHandshake className="h-4 w-4 text-coral" strokeWidth={1.8} />
            {wish.status === "fulfilled" ? "Read the story" : "Help fulfill this wish"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function WishCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-olive/15 bg-white shadow-sm">
      <div className="aspect-[16/10] animate-pulse bg-sage/25" />
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-sage/35" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-sage/35" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-sage/25" />
          </div>
        </div>
        <div className="h-5 w-4/5 animate-pulse rounded bg-sage/35" />
        <div className="h-3.5 w-full animate-pulse rounded bg-sage/25" />
        <div className="h-3.5 w-11/12 animate-pulse rounded bg-sage/25" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-sage/35" />
      </div>
    </div>
  );
}
