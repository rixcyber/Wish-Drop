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
        "text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
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
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/50 transition duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-card/80 hover:shadow-[0_24px_60px_-40px_rgba(0,0,0,1)]",
        className,
      )}
    >
      {wish.imageUrl && (
        <Link
          to={`/wishes/${wish.id}`}
          className="relative block aspect-[16/10] overflow-hidden bg-secondary/60"
          aria-label={wish.title}
          tabIndex={-1}
        >
          <img
            src={wish.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/95 via-card/10 to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/80 backdrop-blur">
            {CATEGORY_LABELS[wish.category]}
          </span>
        </Link>
      )}

      <div className="flex flex-1 flex-col gap-3.5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar
              name={identity.name}
              seed={wish.authorId}
              anonymous={identity.anonymous}
              src={identity.avatarUrl}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground/90">{identity.name}</p>
              <p className="text-[11.5px] text-muted-foreground">{timeAgo(wish.createdAt)}</p>
            </div>
          </div>
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(wish.id)}
              aria-label={saved ? "Remove from saved wishes" : "Save this wish"}
              aria-pressed={Boolean(saved)}
              className={cn(
                "-mr-1 -mt-1 rounded-full p-2 transition-colors",
                saved
                  ? "text-foreground"
                  : "text-muted-foreground/70 hover:bg-accent hover:text-foreground",
              )}
            >
              <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} strokeWidth={1.7} />
            </button>
          )}
        </div>

        {!wish.imageUrl && <CategoryLabel category={wish.category} />}

        <Link to={`/wishes/${wish.id}`} className="block">
          <h3 className="text-balance text-[17px] font-semibold leading-snug tracking-[-0.01em] text-foreground transition-colors group-hover:text-foreground">
            {wish.title}
          </h3>
        </Link>

        <p className="line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">{wish.story}</p>

        <div className="mt-auto space-y-3 pt-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] text-foreground/85">
              <span className="font-semibold">{formatMoney(wish.raisedAmount, wish.currency)}</span>
              <span className="text-muted-foreground"> of {formatMoney(wish.goalAmount, wish.currency)}</span>
            </p>
            <span className="text-[11.5px] tabular-nums text-muted-foreground">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} />

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <StatusBadge status={wish.status} />
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Users className="h-3.5 w-3.5" strokeWidth={1.7} />
              {wish.supporterCount} {wish.supporterCount === 1 ? "supporter" : "supporters"}
            </span>
          </div>

          <Link
            to={`/wishes/${wish.id}`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-transparent text-[13px] font-medium text-foreground/90 transition-colors hover:border-foreground/25 hover:bg-accent hover:text-foreground"
          >
            <HeartHandshake className="h-4 w-4" strokeWidth={1.7} />
            {wish.status === "fulfilled" ? "Read the story" : "Help fulfill this wish"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function WishCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/40">
      <div className="aspect-[16/10] animate-pulse bg-secondary/60" />
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-secondary/70" />
          </div>
        </div>
        <div className="h-4 w-4/5 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-full animate-pulse rounded bg-secondary/70" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-secondary/70" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-secondary/60" />
      </div>
    </div>
  );
}
