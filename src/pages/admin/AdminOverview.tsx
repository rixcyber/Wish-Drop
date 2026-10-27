import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  Flag,
  Gift,
  Loader2,
  Trash2,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/useQuery";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Admin overview — platform health stats and recent moderation activity.
 * All data is computed from the existing reports, wishes, and profiles
 * tables via authorized queries.
 */
export function AdminOverview() {
  const { data, loading, error } = useQuery(async () => {
    const [reports, wishes, profiles] = await Promise.all([
      api.listReports(),
      api.listWishes({ includeRemoved: true }),
      api.listProfiles(),
    ]);
    return { reports, wishes, profiles };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-[13px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-300/90">
        {error}
      </div>
    );
  }

  const reports = data?.reports ?? [];
  const wishes = data?.wishes ?? [];
  const profiles = data?.profiles ?? [];

  const openReports = reports.filter((r) => r.status === "open").length;
  const removedWishes = wishes.filter((w) => w.removed).length;
  const suspendedAccounts = profiles.filter((p) => p.status === "banned").length;

  const stats = [
    { label: "Total Users", value: profiles.length, icon: Users, color: "text-blue-400" },
    { label: "Total Wishes", value: wishes.length, icon: Gift, color: "text-emerald-400" },
    { label: "Total Reports", value: reports.length, icon: Flag, color: "text-amber-400" },
    {
      label: "Pending Reports",
      value: openReports,
      icon: AlertTriangle,
      color: "text-orange-400",
      alert: openReports > 0,
    },
    { label: "Suspended", value: suspendedAccounts, icon: Ban, color: "text-red-400" },
    { label: "Removed Wishes", value: removedWishes, icon: Trash2, color: "text-rose-400" },
  ];

  // Recent resolved/dismissed reports
  const recentReports = reports
    .filter((r) => r.status !== "open")
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  // Recent wish removals
  const recentRemovals = wishes
    .filter((w) => w.removed)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Platform health and moderation summary.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "flex items-center gap-4 rounded-xl border border-border bg-card/60 px-5 py-4 transition-colors",
              stat.alert && "border-amber-500/30 bg-amber-500/5",
            )}
          >
            <span className={cn("rounded-lg border border-border p-2.5", stat.color)}>
              <stat.icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none text-foreground">{stat.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {openReports > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 px-5 py-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-[12.5px] text-amber-200/90">
            {openReports} report{openReports !== 1 ? "s" : ""} pending review.{" "}
            <Link
              to="/admin/reports"
              className="underline underline-offset-4 hover:text-amber-100"
            >
              Open queue
            </Link>
          </p>
        </div>
      )}

      {/* Recent activity panels */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent report activity */}
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-foreground">Recent Report Activity</h2>
            <Link
              to="/admin/reports"
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <p className="mt-4 text-[12.5px] text-muted-foreground">No resolved reports yet.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {recentReports.map((report) => (
                <li key={report.id} className="flex items-start gap-3 text-[12.5px]">
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      report.status === "resolved"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {report.status}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground/80">
                      {report.resolution || `${report.reason} report`}
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {timeAgo(report.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent wish removals */}
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-foreground">Recent Removals</h2>
            <Link
              to="/admin/wishes"
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          {recentRemovals.length === 0 ? (
            <p className="mt-4 text-[12.5px] text-muted-foreground">No removed wishes.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {recentRemovals.map((wish) => (
                <li key={wish.id} className="flex items-start gap-3 text-[12.5px]">
                  <Trash2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400/70" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground/80">{wish.title}</p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {wish.removeReason ?? "Removed by moderation"} · {timeAgo(wish.updatedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
