import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Flag,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/SectionHeading";
import { Avatar } from "@/components/Avatar";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/useQuery";
import { formatMoney, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Profile, Report, Wish } from "@/lib/types";

const REASON_LABELS: Record<Report["reason"], string> = {
  scam: "Scam",
  misleading: "Misleading",
  harassment: "Harassment",
  prohibited: "Prohibited",
  duplicate: "Duplicate",
  privacy: "Privacy",
  other: "Other",
};

type Panel = "reports" | "wishes" | "users";

export function AdminPage() {
  const [panel, setPanel] = useState<Panel>("reports");
  const { data, loading, error, reload } = useQuery(async () => {
    const [reports, wishes, profiles] = await Promise.all([
      api.listReports(),
      api.listWishes({ includeRemoved: true }),
      api.listProfiles(),
    ]);
    return { reports, wishes, profiles };
  }, []);

  const [removal, setRemoval] = useState<{ wish: Wish; report?: Report } | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const reports = data?.reports ?? [];
  const wishes = data?.wishes ?? [];
  const profiles = data?.profiles ?? [];
  const wishMap = useMemo(() => new Map(wishes.map((wish) => [wish.id, wish])), [wishes]);
  const profileMap = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const openReports = reports.filter((report) => report.status === "open").length;

  async function removeWish() {
    if (!removal) return;
    if (reason.trim().length < 8) {
      toast.error("Add a short reason — the author receives it.");
      return;
    }
    setBusyId(removal.wish.id);
    try {
      await api.moderateWish(removal.wish.id, { remove: true, reason: reason.trim() });
      if (removal.report) {
        await api.updateReport(removal.report.id, {
          status: "resolved",
          resolution: `Wish removed: ${reason.trim()}`,
        });
      }
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

  async function dismissReport(report: Report) {
    setBusyId(report.id);
    try {
      await api.updateReport(report.id, {
        status: "dismissed",
        resolution: "Reviewed by moderation. No rule violation found.",
      });
      toast.success("Report dismissed");
      reload();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update that report.");
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

  async function setStatus(profile: Profile, status: Profile["status"]) {
    setBusyId(profile.id);
    try {
      await api.setProfileStatus(profile.id, status);
      toast.success(status === "banned" ? "Account suspended" : "Account reinstated");
      reload();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update that account.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="container py-12 sm:py-16">
      <PageHeader
        eyebrow="Moderation"
        title="Trust & safety desk"
        description="Reports, removals and account suspensions. Every action here notifies the person affected with a reason — no silent deletions."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Open reports", value: openReports, icon: Flag },
          { label: "Removed wishes", value: wishes.filter((wish) => wish.removed).length, icon: Trash2 },
          { label: "Suspended accounts", value: profiles.filter((profile) => profile.status === "banned").length, icon: Ban },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/40 px-4 py-3.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-muted-foreground">
              <stat.icon className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-lg font-semibold leading-none">{stat.value}</p>
              <p className="mt-1 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="-mx-1 mt-8 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(
          [
            { value: "reports", label: "Report queue", count: openReports },
            { value: "wishes", label: "Wishes", count: wishes.filter((wish) => wish.removed).length },
            { value: "users", label: "People", count: null },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setPanel(item.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              panel === item.value
                ? "border-foreground/20 bg-foreground text-background"
                : "border-border/80 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {item.label}
            {item.count ? <span className="ml-1.5 text-[10px] opacity-70">{item.count}</span> : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading the queue…
        </div>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-200/90">
          {error}
        </p>
      ) : panel === "reports" ? (
        <div className="mt-6 space-y-3">
          {reports.length === 0 && (
            <p className="rounded-xl border border-dashed border-border/80 px-4 py-12 text-center text-[13px] text-muted-foreground">
              The queue is empty. Nothing needs review right now.
            </p>
          )}
          {reports.map((report) => {
            const wish = wishMap.get(report.wishId);
            const reporter = profileMap.get(report.reporterId);
            const handled = report.status === "resolved" || report.status === "dismissed";
            return (
              <div
                key={report.id}
                className={cn(
                  "rounded-xl border bg-card/40 p-4",
                  report.status === "open" ? "border-amber-500/25" : "border-border/70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
                          report.status === "open"
                            ? "border-amber-500/25 bg-amber-500/10 text-amber-200/90"
                            : report.status === "dismissed"
                              ? "border-border bg-secondary/50 text-muted-foreground"
                              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/80",
                        )}
                      >
                        {report.status}
                      </span>
                      <span className="rounded-full border border-border/70 px-2 py-0.5 text-[10.5px] text-muted-foreground">
                        {REASON_LABELS[report.reason]}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{timeAgo(report.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-[13.5px] font-medium">
                      {wish ? (
                        <Link to={`/wishes/${wish.id}`} className="hover:underline">
                          {wish.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Wish deleted by its author</span>
                      )}
                    </p>
                    <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
                      “{report.details}”
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Reported by {reporter?.displayName ?? "a member"}
                      {wish ? ` · ${formatMoney(wish.raisedAmount, wish.currency)} raised of ${formatMoney(wish.goalAmount, wish.currency)}` : ""}
                      {wish?.removed ? " · already removed" : ""}
                    </p>
                    {report.resolution && (
                      <p className="mt-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-[11.5px] text-muted-foreground">
                        Resolution: {report.resolution}
                      </p>
                    )}
                  </div>

                  {!handled && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {wish && !wish.removed && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setRemoval({ wish, report });
                            setReason("Request asks for off-platform payment, which is prohibited.");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove wish
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === report.id}
                        onClick={() => void dismissReport(report)}
                      >
                        {busyId === report.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : panel === "wishes" ? (
        <WishTable
          wishes={wishes}
          profileMap={profileMap}
          busyId={busyId}
          onRemove={(wish) => {
            setRemoval({ wish });
            setReason("");
          }}
          onRestore={(wish) => void restoreWish(wish)}
          onFeature={(wish) => void toggleFeature(wish)}
        />
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border/70">
          <ul className="divide-y divide-border/60">
            {profiles.map((profile) => {
              const wishCount = wishes.filter((wish) => wish.authorId === profile.id).length;
              return (
                <li key={profile.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                  <Avatar
                    name={profile.displayName}
                    seed={profile.id}
                    anonymous={profile.anonymous}
                    src={profile.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">
                      {profile.displayName}
                      {profile.role === "admin" && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-border/70 px-1.5 py-0.5 text-[9.5px] uppercase tracking-wide text-muted-foreground">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          mod
                        </span>
                      )}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {profile.email ? `${profile.email} · ` : ""}
                      {wishCount} wishes · joined {timeAgo(profile.createdAt)}
                      {profile.status === "banned" ? " · suspended" : ""}
                    </p>
                  </div>
                  {profile.role !== "admin" && (
                    <Button
                      size="sm"
                      variant={profile.status === "banned" ? "outline" : "ghost"}
                      className={profile.status === "banned" ? "" : "text-muted-foreground hover:bg-red-500/10 hover:text-red-200/90"}
                      disabled={busyId === profile.id}
                      onClick={() => void setStatus(profile, profile.status === "banned" ? "active" : "banned")}
                    >
                      {busyId === profile.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : profile.status === "banned" ? (
                        <RotateCcw className="h-3.5 w-3.5" />
                      ) : (
                        <Ban className="h-3.5 w-3.5" />
                      )}
                      {profile.status === "banned" ? "Reinstate" : "Suspend"}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-10 flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/30 p-4 text-[11.5px] leading-relaxed text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
        <span>
          Demo moderation: actions are stored locally in this browser. In a live deployment each
          action is written to the reports/audit tables under row-level security, and removals always
          notify the author with the stated reason.
        </span>
      </div>

      <Modal
        open={Boolean(removal)}
        onClose={() => setRemoval(null)}
        title="Remove this wish?"
        description={removal ? `“${removal.wish.title}” will be hidden from the feed and cannot receive support.` : undefined}
      >
        <div className="space-y-4">
          <Field
            label="Reason shown to the author"
            htmlFor="removal-reason"
            hint="Be specific. The author receives this message and can appeal it."
          >
            <Textarea
              id="removal-reason"
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

function WishTable({
  wishes,
  profileMap,
  busyId,
  onRemove,
  onRestore,
  onFeature,
}: {
  wishes: Wish[];
  profileMap: Map<string, Profile>;
  busyId: string | null;
  onRemove: (wish: Wish) => void;
  onRestore: (wish: Wish) => void;
  onFeature: (wish: Wish) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "removed" | "featured">("all");

  const filtered = wishes.filter((wish) => {
    if (filter === "removed" && !wish.removed) return false;
    if (filter === "featured" && !wish.featured) return false;
    if (!query.trim()) return true;
    return `${wish.title} ${wish.story}`.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
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

      <div className="overflow-hidden rounded-xl border border-border/70">
        <ul className="divide-y divide-border/60">
          {filtered.map((wish) => {
            const author = profileMap.get(wish.authorId);
            return (
              <li key={wish.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/wishes/${wish.id}`} className="truncate text-[13px] font-medium hover:underline">
                      {wish.title}
                    </Link>
                    {wish.removed && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-200/80">
                        removed
                      </span>
                    )}
                    {wish.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200/80">
                        <Star className="h-2.5 w-2.5" fill="currentColor" />
                        highlighted
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {author?.displayName ?? "Unknown"} · {formatMoney(wish.goalAmount, wish.currency)} ·{" "}
                    {wish.supporterCount} supporters · {timeAgo(wish.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button variant="ghost" size="sm" disabled={busyId === wish.id} onClick={() => onFeature(wish)}>
                    <Star className="h-3.5 w-3.5" fill={wish.featured ? "currentColor" : "none"} />
                    {wish.featured ? "Unhighlight" : "Highlight"}
                  </Button>
                  {wish.removed ? (
                    <Button variant="outline" size="sm" disabled={busyId === wish.id} onClick={() => onRestore(wish)}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:bg-red-500/10 hover:text-red-200/90"
                      disabled={busyId === wish.id}
                      onClick={() => onRemove(wish)}
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
          <p className="px-4 py-10 text-center text-[12.5px] text-muted-foreground">No wishes match that filter.</p>
        )}
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Users className="h-3 w-3" />
        {filtered.length} of {wishes.length} wishes
      </p>
    </div>
  );
}
