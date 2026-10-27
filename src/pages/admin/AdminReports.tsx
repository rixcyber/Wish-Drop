import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/useQuery";
import { formatMoney, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Report, Wish } from "@/lib/types";

const REASON_LABELS: Record<Report["reason"], string> = {
  scam: "Scam",
  misleading: "Misleading",
  harassment: "Harassment",
  prohibited: "Prohibited",
  duplicate: "Duplicate",
  privacy: "Privacy",
  other: "Other",
};

type StatusFilter = "all" | "open" | "resolved" | "dismissed";

/**
 * Admin reports queue — list, review, dismiss, and resolve reports.
 * Extracted from the original AdminPage report panel.
 */
export function AdminReports() {
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const reports = data?.reports ?? [];
  const wishes = data?.wishes ?? [];
  const profiles = data?.profiles ?? [];
  const wishMap = useMemo(() => new Map(wishes.map((w) => [w.id, w])), [wishes]);
  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const openCount = reports.filter((r) => r.status === "open").length;

  const filtered = reports.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Review and resolve user reports.{" "}
            {openCount > 0 && (
              <span className="text-amber-400">{openCount} pending</span>
            )}
          </p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        {(
          [
            { value: "all", label: "All", count: reports.length },
            { value: "open", label: "Open", count: openCount },
            {
              value: "resolved",
              label: "Resolved",
              count: reports.filter((r) => r.status === "resolved").length,
            },
            {
              value: "dismissed",
              label: "Dismissed",
              count: reports.filter((r) => r.status === "dismissed").length,
            },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatusFilter(item.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
              statusFilter === item.value
                ? "border-foreground/20 bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {item.label}
            <span className="ml-1.5 text-[10px] opacity-70">{item.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reports…
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-300/90">
          {error}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-[13px] text-muted-foreground">
              {statusFilter === "open"
                ? "The queue is empty. Nothing needs review right now."
                : "No reports match this filter."}
            </p>
          )}
          {filtered.map((report) => {
            const wish = wishMap.get(report.wishId);
            const reporter = profileMap.get(report.reporterId);
            const handled = report.status === "resolved" || report.status === "dismissed";
            return (
              <div
                key={report.id}
                className={cn(
                  "rounded-xl border bg-card/40 p-4",
                  report.status === "open" ? "border-amber-500/25" : "border-border",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
                          report.status === "open"
                            ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                            : report.status === "dismissed"
                              ? "border-border bg-secondary/50 text-muted-foreground"
                              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
                        )}
                      >
                        {report.status}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10.5px] text-muted-foreground">
                        {REASON_LABELS[report.reason]}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(report.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-[13.5px] font-medium text-foreground">
                      {wish ? (
                        <Link to={`/wishes/${wish.id}`} className="hover:underline" target="_blank">
                          {wish.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Wish deleted by its author</span>
                      )}
                    </p>
                    <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
                      "{report.details}"
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Reported by {reporter?.displayName ?? "a member"}
                      {wish
                        ? ` · ${formatMoney(wish.raisedAmount, wish.currency)} raised of ${formatMoney(wish.goalAmount, wish.currency)}`
                        : ""}
                      {wish?.removed ? " · already removed" : ""}
                    </p>
                    {report.resolution && (
                      <p className="mt-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-[11.5px] text-muted-foreground">
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
                            setReason(
                              "Request asks for off-platform payment, which is prohibited.",
                            );
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
