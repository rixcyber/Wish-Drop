import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Loader2,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/useQuery";
import { formatMoney, timeAgo } from "@/lib/format";
import type { Wish } from "@/lib/types";

/**
 * Admin wish management — search, filter, remove, restore, highlight.
 * Extracted from the original AdminPage wish panel.
 */
export function AdminWishes() {
  const { data, loading, error, reload } = useQuery(async () => {
    const [wishes, profiles] = await Promise.all([
      api.listWishes({ includeRemoved: true }),
      api.listProfiles(),
    ]);
    return { wishes, profiles };
  }, []);

  const [removal, setRemoval] = useState<{ wish: Wish } | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "removed" | "featured">("all");

  const wishes = data?.wishes ?? [];
  const profiles = data?.profiles ?? [];
  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const filtered = wishes.filter((wish) => {
    if (filter === "removed" && !wish.removed) return false;
    if (filter === "featured" && !wish.featured) return false;
    if (!query.trim()) return true;
    return `${wish.title} ${wish.story}`.toLowerCase().includes(query.trim().toLowerCase());
  });

  async function removeWish() {
    if (!removal) return;
    if (reason.trim().length < 8) {
      toast.error("Add a short reason — the author receives it.");
      return;
    }
    setBusyId(removal.wish.id);
    try {
      await api.moderateWish(removal.wish.id, { remove: true, reason: reason.trim() });
      toast.success("Wish removed", { description: "The author was notified with your reason." });
      setRemoval(null);
      setReason("");
      reload();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not remove that wish.");
    } finally {
      setBusyId(null);
    }
  }

  async function restoreWish(wish: Wish) {
    setBusyId(wish.id);
    try {
      await api.moderateWish(wish.id, { remove: false });
      toast.success("Wish restored");
      reload();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not restore that wish.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleFeature(wish: Wish) {
    setBusyId(wish.id);
    try {
      await api.moderateWish(wish.id, { remove: wish.removed, feature: !wish.featured });
      toast.success(wish.featured ? "Highlight removed" : "Wish highlighted");
      reload();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update that wish.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Wishes</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Manage wishes — search, remove, restore, and highlight.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading wishes…
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-300/90">
          {error}
        </p>
      ) : (
        <>
          {/* Search and filter */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search wishes by title or story"
                className="pl-10"
                aria-label="Search wishes"
              />
            </div>
            <Select
              aria-label="Filter wishes"
              value={filter}
              onChange={(event) => setFilter(event.target.value as typeof filter)}
              className="sm:w-[180px]"
            >
              <option value="all">All wishes</option>
              <option value="removed">Removed only</option>
              <option value="featured">Highlighted</option>
            </Select>
          </div>

          {/* Wish list */}
          <div className="overflow-hidden rounded-xl border border-border">
            <ul className="divide-y divide-border/60">
              {filtered.map((wish) => {
                const author = profileMap.get(wish.authorId);
                return (
                  <li key={wish.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/wishes/${wish.id}`}
                          className="truncate text-[13px] font-medium text-foreground hover:underline"
                          target="_blank"
                        >
                          {wish.title}
                        </Link>
                        {wish.removed && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">
                            removed
                          </span>
                        )}
                        {wish.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                            <Star className="h-2.5 w-2.5" fill="currentColor" />
                            highlighted
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {author?.displayName ?? "Unknown"} ·{" "}
                        {formatMoney(wish.goalAmount, wish.currency)} ·{" "}
                        {wish.supporterCount} supporters · {timeAgo(wish.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === wish.id}
                        onClick={() => void toggleFeature(wish)}
                      >
                        <Star
                          className="h-3.5 w-3.5"
                          fill={wish.featured ? "currentColor" : "none"}
                        />
                        {wish.featured ? "Unhighlight" : "Highlight"}
                      </Button>
                      {wish.removed ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === wish.id}
                          onClick={() => void restoreWish(wish)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:bg-red-500/10 hover:text-red-300"
                          disabled={busyId === wish.id}
                          onClick={() => {
                            setRemoval({ wish });
                            setReason("");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {filtered.length === 0 && (
              <p className="px-4 py-10 text-center text-[12.5px] text-muted-foreground">
                No wishes match that filter.
              </p>
            )}
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Gift className="h-3 w-3" />
            {filtered.length} of {wishes.length} wishes
          </p>
        </>
      )}

      {/* Removal modal */}
      <Modal
        open={Boolean(removal)}
        onClose={() => setRemoval(null)}
        title="Remove this wish?"
        description={
          removal
            ? `"${removal.wish.title}" will be hidden from the feed and cannot receive support.`
            : undefined
        }
      >
        <div className="space-y-4">
          <Field
            label="Reason shown to the author"
            htmlFor="wish-removal-reason"
            hint="Be specific. The author receives this message and can appeal it."
          >
            <Textarea
              id="wish-removal-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={300}
              placeholder="e.g. Requests payment through an external app, which the platform rules prohibit."
            />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setRemoval(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(removal && busyId === removal.wish.id)}
              onClick={() => void removeWish()}
            >
              <Trash2 className="h-4 w-4" />
              Remove wish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
