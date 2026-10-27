import { useMemo, useState } from "react";
import {
  Ban,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/Avatar";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/useQuery";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

type StatusFilter = "all" | "active" | "banned";

/**
 * Admin user management — view users, suspend, reinstate.
 * Extracted from the original AdminPage user panel.
 */
export function AdminUsers() {
  const { data, loading, error, reload } = useQuery(async () => {
    const [profiles, wishes] = await Promise.all([
      api.listProfiles(),
      api.listWishes({ includeRemoved: true }),
    ]);
    return { profiles, wishes };
  }, []);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [confirmAction, setConfirmAction] = useState<{
    profile: Profile;
    action: "ban" | "reinstate";
  } | null>(null);

  const profiles = data?.profiles ?? [];
  const wishes = data?.wishes ?? [];

  const wishCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of wishes) {
      map.set(w.authorId, (map.get(w.authorId) ?? 0) + 1);
    }
    return map;
  }, [wishes]);

  const filtered = profiles.filter((p) => {
    if (statusFilter === "active" && p.status !== "active") return false;
    if (statusFilter === "banned" && p.status !== "banned") return false;
    if (!query.trim()) return true;
    return p.displayName.toLowerCase().includes(query.trim().toLowerCase());
  });

  async function setStatus(profile: Profile, status: Profile["status"]) {
    setBusyId(profile.id);
    try {
      await api.setProfileStatus(profile.id, status);
      toast.success(status === "banned" ? "Account suspended" : "Account reinstated");
      setConfirmAction(null);
      reload();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update that account.");
    } finally {
      setBusyId(null);
    }
  }

  const suspendedCount = profiles.filter((p) => p.status === "banned").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {profiles.length} registered users · {suspendedCount} suspended
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users by name"
            className="pl-10"
            aria-label="Search users"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(
            [
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "banned", label: "Suspended" },
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
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-300/90">
          {error}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <ul className="divide-y divide-border/60">
            {filtered.map((profile) => {
              const wishCount = wishCountMap.get(profile.id) ?? 0;
              return (
                <li
                  key={profile.id}
                  className={cn(
                    "flex flex-wrap items-center gap-3 px-4 py-3.5",
                    profile.status === "banned" && "bg-red-500/5",
                  )}
                >
                  <Avatar
                    name={profile.displayName}
                    seed={profile.id}
                    anonymous={profile.anonymous}
                    src={profile.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-[13px] font-medium text-foreground">
                      {profile.displayName}
                      {profile.role === "admin" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wide text-muted-foreground">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          admin
                        </span>
                      )}
                      {profile.status === "banned" && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">
                          suspended
                        </span>
                      )}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {wishCount} wishes · joined {timeAgo(profile.createdAt)}
                    </p>
                  </div>
                  {profile.role !== "admin" && (
                    <Button
                      size="sm"
                      variant={profile.status === "banned" ? "outline" : "ghost"}
                      className={
                        profile.status === "banned"
                          ? ""
                          : "text-muted-foreground hover:bg-red-500/10 hover:text-red-300"
                      }
                      disabled={busyId === profile.id}
                      onClick={() =>
                        setConfirmAction({
                          profile,
                          action: profile.status === "banned" ? "reinstate" : "ban",
                        })
                      }
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
          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-[12.5px] text-muted-foreground">
              No users match that filter.
            </p>
          )}
        </div>
      )}

      {/* Confirmation modal */}
      <Modal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.action === "ban"
            ? "Suspend this account?"
            : "Reinstate this account?"
        }
        description={
          confirmAction
            ? confirmAction.action === "ban"
              ? `"${confirmAction.profile.displayName}" will be suspended and unable to post, contribute, or interact. Their existing wishes will be hidden from the feed.`
              : `"${confirmAction.profile.displayName}" will regain full access to the platform.`
            : undefined
        }
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setConfirmAction(null)}>
            Cancel
          </Button>
          <Button
            variant={confirmAction?.action === "ban" ? "destructive" : "default"}
            disabled={Boolean(confirmAction && busyId === confirmAction.profile.id)}
            onClick={() => {
              if (!confirmAction) return;
              void setStatus(
                confirmAction.profile,
                confirmAction.action === "ban" ? "banned" : "active",
              );
            }}
          >
            {confirmAction?.action === "ban" ? (
              <>
                <Ban className="h-4 w-4" />
                Suspend account
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Reinstate account
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
