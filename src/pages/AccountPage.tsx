import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Bookmark,
  CheckCheck,
  Gift,
  HeartHandshake,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, Progress, Switch } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/Avatar";
import { WishCard, StatusBadge } from "@/components/WishCard";
import { PageHeader } from "@/components/SectionHeading";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@/lib/useQuery";
import { api } from "@/lib/api";
import { useWishSave } from "@/hooks/useCommunity";
import { formatMoney, timeAgo } from "@/lib/format";
import { CATEGORY_LABELS, wishProgress } from "@/lib/backend";
import { cn } from "@/lib/utils";
import type { AppNotification, Wish } from "@/lib/types";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "wishes", label: "My wishes" },
  { value: "saved", label: "Saved" },
  { value: "contributions", label: "Contributions" },
  { value: "notifications", label: "Notifications" },
  { value: "settings", label: "Settings" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export function AccountPage() {
  const { profile, loading, notifications, unreadCount, markNotificationsRead, refreshProfile } =
    useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const onToggleSave = useWishSave();

  const tab = (TABS.find((item) => item.value === searchParams.get("tab"))?.value ?? "overview") as Tab;

  const { data, loading: dataLoading, reload } = useQuery(async () => {
    if (!profile) return null;
    const [wishes, saved, contributions, profiles] = await Promise.all([
      api.listWishes({ includeRemoved: true }),
      api.listSaved(profile.id),
      api.listMyContributions(profile.id),
      api.listProfiles(),
    ]);
    return {
      myWishes: wishes.filter((wish) => wish.authorId === profile.id),
      saved,
      contributions,
      profiles,
    };
  }, [profile?.id]);

  if (loading || !profile) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const myWishes = data?.myWishes ?? [];
  const saved = data?.saved ?? [];
  const contributions = data?.contributions ?? [];
  const profiles = data?.profiles ?? [];
  const totalRaised = myWishes.reduce((sum, wish) => sum + wish.raisedAmount, 0);
  const totalGiven = contributions.reduce((sum, item) => sum + item.amount, 0);
  const active = myWishes.filter((wish) => wish.status !== "fulfilled" && !wish.removed);

  return (
    <div className="container py-12 sm:py-16">
      <PageHeader
        eyebrow="Your account"
        title={`Hello, ${profile.anonymous ? "kind stranger" : profile.displayName}`}
        description={
          profile.anonymous
            ? "Your profile is anonymous. Wishes you post show a stable handle instead of your name."
            : "Here is everything you have asked for, saved and quietly helped with."
        }
        actions={
          <Button asChild>
            <Link to="/post">
              <Plus className="h-4 w-4" />
              Post a wish
            </Link>
          </Button>
        }
      />

      <div className="-mx-1 mt-8 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => navigate(`/account?tab=${item.value}`)}
            className={cn(
              "relative shrink-0 rounded-full border px-4 py-2 text-xs transition-all",
              tab === item.value
                ? "border-forest bg-forest text-ivory font-semibold shadow-sm"
                : "border-olive/20 bg-white/70 text-olive hover:border-forest/30 hover:text-forest",
            )}
          >
            {item.label}
            {item.value === "notifications" && unreadCount > 0 && (
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                  tab === item.value ? "bg-coral text-white" : "bg-coral/15 text-coral",
                )}
              >
                {unreadCount}
              </span>
            )}
            {item.value === "saved" && saved.length > 0 && (
              <span className="ml-1.5 text-[10px] opacity-60">({saved.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {dataLoading ? (
          <div className="flex items-center gap-2 py-16 text-[13px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your account…
          </div>
        ) : tab === "overview" ? (
          <Overview
            profile={profile}
            myWishes={myWishes}
            savedCount={saved.length}
            contributionsCount={contributions.length}
            totalRaised={totalRaised}
            totalGiven={totalGiven}
            activeCount={active.length}
            notifications={notifications}
            onMarkRead={() => void markNotificationsRead()}
          />
        ) : tab === "wishes" ? (
          <MyWishes wishes={myWishes} onChanged={reload} />
        ) : tab === "saved" ? (
          saved.length === 0 ? (
            <Empty
              icon={Bookmark}
              title="Nothing saved yet"
              body="Tap the bookmark on any wish to keep it here. Saved wishes never notify the person who posted them."
              action={{ label: "Find a wish to save", to: "/explore" }}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {saved.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  author={profiles.find((item) => item.id === wish.authorId)}
                  saved
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          )
        ) : tab === "contributions" ? (
          <Contributions contributions={contributions} />
        ) : tab === "notifications" ? (
          <Notifications items={notifications} onMarkRead={() => void markNotificationsRead()} />
        ) : (
          <SettingsPanel
            onSaved={() => void refreshProfile()}
            onReset={async () => {
              await api.resetDemoData?.();
              toast.success("Demo data reset", { description: "The sample community is back to its starting state." });
              window.location.href = "/";
            }}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Sparkles }) {
  return (
    <div className="rounded-2xl border border-olive/15 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-sage/20 text-forest">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-3 font-serif text-2xl font-bold tracking-tight text-forest">{value}</p>
    </div>
  );
}

function Overview({
  profile,
  myWishes,
  savedCount,
  contributionsCount,
  totalRaised,
  totalGiven,
  activeCount,
  notifications,
  onMarkRead,
}: {
  profile: { id: string; displayName: string; anonymous: boolean; email: string };
  myWishes: Wish[];
  savedCount: number;
  contributionsCount: number;
  totalRaised: number;
  totalGiven: number;
  activeCount: number;
  notifications: AppNotification[];
  onMarkRead: () => void;
}) {
  const currencyWish = myWishes[0];
  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active wishes" value={String(activeCount)} icon={Sparkles} />
        <Stat
          label="Raised for your wishes"
          value={formatMoney(totalRaised, currencyWish?.currency ?? "USD")}
          icon={HeartHandshake}
        />
        <Stat label="Given to others" value={formatMoney(totalGiven, currencyWish?.currency ?? "USD")} icon={Wallet} />
        <Stat label="Saved wishes" value={String(savedCount)} icon={Bookmark} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-border/70 bg-card/30 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold">Your wishes</h2>
            <Link to="/account?tab=wishes" className="text-[12px] text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {myWishes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 px-4 py-9 text-center">
              <p className="text-[13px] text-muted-foreground">You haven't posted a wish yet.</p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/post">Share your first wish</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {myWishes.slice(0, 3).map((wish) => {
                const progress = wishProgress(wish);
                return (
                  <li key={wish.id}>
                    <Link
                      to={`/wishes/${wish.id}`}
                      className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-background/30 px-3.5 py-3 transition-colors hover:border-border hover:bg-accent/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[13px] font-medium">{wish.title}</p>
                          {wish.removed && (
                            <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-200/80">
                              Removed
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Progress value={progress.percent} className="max-w-[140px]" />
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {progress.percent}%
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={wish.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/30 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold">Recent activity</h2>
            {notifications.some((item) => !item.read) && (
              <button
                type="button"
                onClick={onMarkRead}
                className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-[12.5px] text-muted-foreground">
              Nothing yet. Activity appears when someone supports your wish.
            </p>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.href ?? "/account?tab=notifications"}
                    className="block rounded-lg px-2 py-2 transition-colors hover:bg-accent/40"
                  >
                    <div className="flex items-start gap-2">
                      {!item.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />}
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium text-foreground/90">{item.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 border-t border-border/60 pt-3 text-[11.5px] text-muted-foreground">
            Signed in as <span className="text-foreground/75">{profile.email}</span>
            {contributionsCount > 0 && ` · ${contributionsCount} contributions`}
          </div>
        </section>
      </div>
    </div>
  );
}

function MyWishes({ wishes, onChanged }: { wishes: Wish[]; onChanged: () => void }) {
  const [deleteTarget, setDeleteTarget] = useState<Wish | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteWish(deleteTarget.id);
      toast.success("Wish deleted");
      setDeleteTarget(null);
      onChanged();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not delete that wish.");
    } finally {
      setDeleting(false);
    }
  }

  if (wishes.length === 0) {
    return (
      <Empty
        icon={Sparkles}
        title="No wishes yet"
        body="When you post a wish it appears here with its progress, edits and fulfilment status."
        action={{ label: "Post a wish", to: "/post" }}
      />
    );
  }

  return (
    <>
      <div className="space-y-2.5">
        {wishes.map((wish) => {
          const progress = wishProgress(wish);
          return (
            <div
              key={wish.id}
              className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/40 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                {wish.imageUrl ? (
                  <img
                    src={wish.imageUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg border border-border/60 object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-border/60 bg-secondary/40 text-muted-foreground">
                    <Gift className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/wishes/${wish.id}`}
                      className="truncate text-[13.5px] font-medium hover:underline"
                    >
                      {wish.title}
                    </Link>
                    <StatusBadge status={wish.status} />
                    {wish.removed && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-200/80">
                        Removed
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    {CATEGORY_LABELS[wish.category]} · {formatMoney(wish.raisedAmount, wish.currency)} of{" "}
                    {formatMoney(wish.goalAmount, wish.currency)} · {wish.supporterCount} supporters ·{" "}
                    {timeAgo(wish.createdAt)}
                  </p>
                  <Progress value={progress.percent} className="mt-2 max-w-xs" />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/wishes/${wish.id}`}>View</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/post?edit=${wish.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${wish.title}`}
                  className="h-8 w-8 text-muted-foreground hover:bg-red-500/10 hover:text-red-200/90"
                  onClick={() => setDeleteTarget(wish)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this wish?"
        description={deleteTarget ? `“${deleteTarget.title}” will disappear from the feed.` : undefined}
      >
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Supporters keep their own contribution history. If this wish was already funded, agree on
          delivery with your supporters before deleting it.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Keep it
          </Button>
          <Button variant="destructive" onClick={() => void remove()} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete wish
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Contributions({
  contributions,
}: {
  contributions: Array<{
    id: string;
    amount: number;
    currency: Wish["currency"];
    method: "money" | "gift_item";
    anonymous: boolean;
    reference: string;
    createdAt: string;
    wish: Wish;
  }>;
}) {
  if (contributions.length === 0) {
    return (
      <Empty
        icon={HeartHandshake}
        title="You haven't helped with a wish yet"
        body="Contributions you make appear here with their reference and status. In this build they are simulated."
        action={{ label: "Find a wish to support", to: "/explore" }}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <div className="hidden grid-cols-[1.6fr_0.8fr_0.8fr_0.9fr] gap-4 border-b border-border/70 bg-card/40 px-4 py-2.5 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground sm:grid">
        <span>Wish</span>
        <span>Amount</span>
        <span>Method</span>
        <span>Reference</span>
      </div>
      <ul className="divide-y divide-border/60">
        {contributions.map((item) => (
          <li
            key={item.id}
            className="grid gap-2 px-4 py-3.5 text-[12.5px] transition-colors hover:bg-accent/20 sm:grid-cols-[1.6fr_0.8fr_0.8fr_0.9fr] sm:items-center sm:gap-4"
          >
            <div className="min-w-0">
              <Link to={`/wishes/${item.wish.id}`} className="block truncate font-medium hover:underline">
                {item.wish.title}
              </Link>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {timeAgo(item.createdAt)}
                {item.anonymous ? " · anonymous" : ""}
              </p>
            </div>
            <span className="font-medium tabular-nums">{formatMoney(item.amount, item.currency)}</span>
            <span className="text-muted-foreground">
              {item.method === "gift_item" ? "Gift (demo)" : "Contribution (demo)"}
            </span>
            <span className="truncate font-mono text-[10.5px] text-muted-foreground">{item.reference}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notifications({ items, onMarkRead }: { items: AppNotification[]; onMarkRead: () => void }) {
  const unread = items.filter((item) => !item.read).length;

  if (items.length === 0) {
    return (
      <Empty
        icon={Bell}
        title="No notifications yet"
        body="You'll hear from us when someone supports your wish, when a wish you helped is fulfilled, or when a thank-you is posted."
        action={{ label: "Explore wishes", to: "/explore" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] text-muted-foreground">
          {unread > 0 ? `${unread} unread` : "All caught up"}
        </p>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={onMarkRead}>
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70">
        {items.map((item) => (
          <li key={item.id} className={cn("px-4 py-4", !item.read && "bg-card/40")}>
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  item.read ? "bg-transparent" : "bg-foreground",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-medium">{item.title}</p>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{item.body}</p>
                {item.href && (
                  <Link
                    to={item.href}
                    className="mt-2 inline-flex items-center gap-1 text-[11.5px] text-foreground/75 hover:text-foreground"
                  >
                    Open
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SettingsPanel({
  onSaved,
  onReset,
}: {
  onSaved: () => void;
  onReset: () => Promise<void>;
}) {
  const { profile, signOut } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [anonymous, setAnonymous] = useState(profile?.anonymous ?? false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setBio(profile.bio ?? "");
    setAnonymous(profile.anonymous);
    setAvatarUrl(profile.avatarUrl);
  }, [profile]);

  if (!profile) return null;

  async function handleAvatar(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await api.uploadWishImage(file);
      setAvatarUrl(url);
      toast.success("Photo ready", { description: "Save your profile to apply it." });
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not use that image.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function save() {
    setSaving(true);
    try {
      await api.updateProfile(profile!.id, {
        displayName: displayName.trim() || "Member",
        bio: bio.trim() || null,
        anonymous,
        avatarUrl,
      });
      toast.success("Profile saved");
      onSaved();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className="space-y-5 rounded-2xl border border-border/70 bg-card/30 p-5">
        <h2 className="text-[14px] font-semibold">Public profile</h2>

        <div className="flex items-center gap-4">
          <Avatar
            name={displayName || profile.displayName}
            seed={profile.id}
            anonymous={anonymous}
            src={avatarUrl}
            size="lg"
          />
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              {avatarUrl ? "Change photo" : "Upload photo"}
            </Button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="ml-2 text-[11.5px] text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">Optional. Initials are used otherwise.</p>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleAvatar(event.target.files?.[0])}
          />
        </div>

        <Field label="Display name" htmlFor="settings-name" hint="You can use a first name, a nickname, or nothing at all.">
          <Input
            id="settings-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={40}
          />
        </Field>

        <Field label="Short bio" htmlFor="settings-bio" optional hint="A sentence about you. No contact details.">
          <Textarea
            id="settings-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={200}
            rows={3}
            className="min-h-[80px]"
          />
        </Field>

        <Switch
          checked={anonymous}
          onChange={setAnonymous}
          label="Keep my identity private"
          description="Wishes and thank-yous you post show an anonymous handle. This cannot hide your identity from moderators, and it does not affect payments."
        />

        <div className="flex items-center gap-3">
          <Button onClick={() => void save()} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save profile
          </Button>
          <span className="text-[11.5px] text-muted-foreground">Member since {timeAgo(profile.createdAt)}</span>
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-2xl border border-border/70 bg-card/30 p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold">
            <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.7} />
            Account
          </h2>
          <dl className="mt-4 space-y-3 text-[12.5px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate text-foreground/85">{profile.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="text-foreground/85">{profile.role === "admin" ? "Moderator" : "Member"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="text-foreground/85">{profile.status === "active" ? "Active" : "Suspended"}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
            <Button variant="outline" onClick={() => void signOut()} className="justify-start">
              Sign out
            </Button>
            {profile.role === "admin" && (
              <Button asChild variant="ghost" className="justify-start text-muted-foreground">
                <Link to="/admin">Open moderation dashboard</Link>
              </Button>
            )}
          </div>
        </div>

        {api.resetDemoData && (
          <div className="rounded-2xl border border-border/70 bg-card/30 p-5">
            <h2 className="text-[14px] font-semibold">Demo data</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              Restore the sample community and accounts to their original state. Anything you posted,
              saved or supported in this browser will be cleared.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-muted-foreground"
              onClick={() => setResetOpen(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo data
            </Button>
          </div>
        )}
      </section>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset the demo?"
        description="This clears local demo data in this browser and reseeds the sample community."
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setResetOpen(false)} disabled={resetting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={resetting}
            onClick={() => {
              setResetting(true);
              void onReset().finally(() => setResetting(false));
            }}
          >
            {resetting && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset data
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Empty({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof Sparkles;
  title: string;
  body: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-olive/25 bg-sage/10 px-6 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-sage/30 p-3.5 text-forest">
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <h2 className="font-serif text-xl font-semibold text-forest">{title}</h2>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-olive">{body}</p>
      {action && (
        <Button asChild variant="coral" size="sm" className="mt-6">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
