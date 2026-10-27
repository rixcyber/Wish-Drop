import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  ExternalLink,
  Flag,
  Gift,
  HeartHandshake,
  Loader2,
  Lock,
  MessageSquareHeart,
  Pencil,
  Share2,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, publicIdentity } from "@/components/Avatar";
import { WishCard, StatusBadge } from "@/components/WishCard";
import { ContributeDialog } from "@/components/ContributeDialog";
import { ReportDialog } from "@/components/ReportDialog";
import { ThankYouDialog } from "@/components/ThankYouDialog";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/field";
import { useAuth } from "@/context/AuthContext";
import { useCommunity, useWishSave } from "@/hooks/useCommunity";
import { useQuery } from "@/lib/useQuery";
import { api } from "@/lib/api";
import { formatMoney, timeAgo } from "@/lib/format";
import { CATEGORY_LABELS, wishProgress } from "@/lib/backend";
import { PAYMENT_MODE } from "@/lib/payments";
import { DONATIONS_CLOSED_COPY, paymentsOpen } from "@/lib/config";
import type { Wish } from "@/lib/types";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function WishDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isSaved, toggleSave } = useAuth();
  const onToggleSaveFromCard = useWishSave();
  const { wishes } = useCommunity();

  const { data, loading, reload } = useQuery(async () => {
    if (!id) return null;
    const wish = await api.getWish(id);
    if (!wish) return null;
    const [author, thankYous, allProfiles] = await Promise.all([
      api.getProfile(wish.authorId),
      api.listThankYous(wish.id),
      api.listProfiles(),
    ]);
    return { wish, author, thankYous, allProfiles };
  }, [id]);

  const [contributeOpen, setContributeOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [thankOpen, setThankOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-semibold">This wish isn't available</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          It may have been removed by moderation, deleted by its author, or the link might be wrong.
        </p>
        <Button asChild className="mt-6">
          <Link to="/explore">Explore other wishes</Link>
        </Button>
      </div>
    );
  }

  const { wish, author, thankYous, allProfiles } = data;
  const progress = wishProgress(wish);
  const isOwner = profile?.id === wish.authorId;
  const saved = isSaved(wish.id);
  const remaining = Math.max(0, wish.goalAmount - wish.raisedAmount);
  const identity = publicIdentity(author, wish.authorId, wish.anonymous);
  const authorHandle = publicIdentity(author, wish.authorId);
  const profileMap = new Map(allProfiles.map((item) => [item.id, item]));
  const related = wishes
    .filter((item) => item.id !== wish.id && item.category === wish.category && !item.removed)
    .slice(0, 3);

  async function handleBookmark() {
    if (!profile) {
      toast("Sign in to save wishes");
      navigate(`/signin?next=${encodeURIComponent(`/wishes/${wish.id}`)}`);
      return;
    }
    try {
      const next = await toggleSave(wish.id);
      toast.success(next ? "Saved to your list" : "Removed from saved wishes");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update your saved wishes.");
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied", { description: "Share it privately rather than posting someone's story elsewhere." });
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteWish(wish.id);
      toast.success("Wish deleted");
      navigate("/account?tab=wishes");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not delete that wish.");
      setDeleting(false);
    }
  }

  function openSupport() {
    if (!profile) {
      toast("Sign in to support a wish", {
        description: "Browsing is open to everyone. Supporting needs an account for safety and refunds.",
      });
      navigate(`/signin?next=${encodeURIComponent(`/wishes/${wish.id}`)}`);
      return;
    }
    if (!paymentsOpen) {
      toast("Donations aren't open yet", { description: DONATIONS_CLOSED_COPY });
      return;
    }
    setContributeOpen(true);
  }

  return (
    <div className="container py-8 sm:py-10">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All wishes
      </Link>

      {wish.removed && (
        <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3.5 text-[12.5px] leading-relaxed text-red-100/85">
          <span className="font-medium">Removed by moderation. </span>
          {wish.removeReason ?? "This wish no longer meets the platform rules."} It cannot receive
          support.
        </div>
      )}

      <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <article>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {CATEGORY_LABELS[wish.category]}
            </span>
            <span className="text-muted-foreground/40" aria-hidden="true">
              ·
            </span>
            <StatusBadge status={wish.status} />
            {wish.featured && (
              <span className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.12em] text-amber-200/70">
                <BadgeCheck className="h-3 w-3" />
                Highlighted
              </span>
            )}
          </div>

          <h1 className="mt-4 text-balance text-[30px] font-semibold leading-[1.12] tracking-[-0.025em] sm:text-[38px]">
            {wish.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Avatar
              name={identity.name}
              seed={wish.authorId}
              anonymous={identity.anonymous}
              src={identity.avatarUrl}
              size="md"
            />
            <div>
              <p className="text-[13px] font-medium text-foreground/90">{identity.name}</p>
              <p className="text-[11.5px] text-muted-foreground">
                Posted {timeAgo(wish.createdAt)}
                {identity.anonymous ? " · identity kept private" : ""}
              </p>
            </div>
          </div>

          {wish.imageUrl && (
            <div className="mt-7 overflow-hidden rounded-2xl border border-border/70 bg-secondary/40">
              <img
                src={wish.imageUrl}
                alt={`Image for the wish “${wish.title}”`}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          )}

          <div className="mt-7 space-y-4 text-[14.5px] leading-[1.75] text-foreground/85">
            {wish.story.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index} className="text-pretty">
                {paragraph}
              </p>
            ))}
          </div>

          {wish.itemUrl && (
            <a
              href={wish.itemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/40 px-4 py-3.5 transition-colors hover:border-border hover:bg-card/70"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground">
                  <Gift className="h-4 w-4" strokeWidth={1.7} />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-foreground/90">The exact item requested</p>
                  <p className="text-[11.5px] text-muted-foreground">{hostOf(wish.itemUrl)}</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          )}

          <section className="mt-10 border-t border-border/60 pt-8">
            <h2 className="flex items-center gap-2 text-[17px] font-semibold">
              <MessageSquareHeart className="h-4 w-4 text-foreground/70" strokeWidth={1.8} />
              Thank-yous
            </h2>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">
              Written by the person who posted the wish. Only what they choose to share appears here.
            </p>

            {wish.thankYou ? (
              <blockquote className="mt-5 rounded-2xl border border-border/70 bg-card/50 p-5">
                <p className="text-[14px] leading-relaxed text-foreground/85">“{wish.thankYou}”</p>
                <footer className="mt-3 flex items-center justify-between gap-3 text-[11.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-400/70" />
                    {identity.anonymous ? "Anonymous author" : identity.name}
                  </span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setThankOpen(true)}
                      className="text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Edit message
                    </button>
                  )}
                </footer>
              </blockquote>
            ) : isOwner ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border/80 bg-card/30 p-5">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {wish.status === "fulfilled"
                    ? "Your wish is funded. Post a thank-you so the people who helped know what changed."
                    : "Once your wish is fulfilled, you can leave a thank-you here. Supporters are notified without seeing your identity."}
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setThankOpen(true)}>
                  Write a thank-you
                </Button>
              </div>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-border/80 bg-card/30 px-4 py-5 text-[12.5px] leading-relaxed text-muted-foreground">
                No public thank-you yet. {wish.status === "fulfilled" ? "The wish is funded." : "The wish is still open."}
              </p>
            )}

            {thankYous.length > 0 && (
              <ul className="mt-4 space-y-2.5">
                {thankYous.map((entry) => {
                  const senderProfile = profileMap.get(entry.fromProfileId);
                  const sender = entry.anonymous
                    ? "Anonymous"
                    : senderProfile?.displayName ?? "A supporter";
                  return (
                    <li key={entry.id} className="rounded-xl border border-border/60 bg-background/30 px-4 py-3.5">
                      <p className="text-[13px] leading-relaxed text-foreground/80">“{entry.message}”</p>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {sender} · {timeAgo(entry.createdAt)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {!isOwner && profile && (
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border/60 pt-6 text-[11.5px] text-muted-foreground">
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Flag className="h-3.5 w-3.5" strokeWidth={1.8} />
                Report this wish
              </button>
              <span className="text-muted-foreground/50" aria-hidden="true">
                ·
              </span>
              <span>Reports are confidential and reviewed by a moderator.</span>
            </div>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-2xl font-semibold tracking-tight">
                {formatMoney(wish.raisedAmount, wish.currency)}
              </p>
              <p className="text-[12px] text-muted-foreground">
                of {formatMoney(wish.goalAmount, wish.currency)}
              </p>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {progress.status === "fulfilled"
                ? "Fully funded"
                : `${formatMoney(remaining, wish.currency)} still needed`}
            </p>
            <Progress value={progress.percent} className="mt-4" />
            <div className="mt-3 flex items-center justify-between text-[11.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" strokeWidth={1.8} />
                {wish.supporterCount} {wish.supporterCount === 1 ? "supporter" : "supporters"}
              </span>
              <span>{progress.percent}% funded</span>
            </div>

            <div className="mt-5 space-y-2">
              {isOwner ? (
                <>
                  <div className="rounded-lg border border-border/70 bg-background/40 px-3.5 py-3 text-[12px] leading-relaxed text-muted-foreground">
                    This is your wish. You can't support your own request, but you can edit or remove
                    it at any time.
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/post?edit=${wish.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit wish
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={wish.removed || progress.status === "fulfilled" || !paymentsOpen}
                  onClick={openSupport}
                >
                  <HeartHandshake className="h-4 w-4" />
                  {progress.status === "fulfilled"
                    ? "Fully funded"
                    : wish.removed
                      ? "Not accepting support"
                      : !paymentsOpen
                        ? "Donations closed"
                        : "Help fulfill this wish"}
                </Button>
              )}

              {!isOwner && wish.itemUrl && wish.fulfillmentMethod !== "contribute" && !wish.removed && (
                <Button asChild variant="secondary" className="w-full">
                  <a href={wish.itemUrl} target="_blank" rel="noopener noreferrer">
                    <Gift className="h-4 w-4" />
                    {paymentsOpen ? "Gift the item directly" : "Buy it from the retailer"}
                  </a>
                </Button>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={() => void handleBookmark()}>
                  <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={() => void handleShare()}>
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              </div>
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11.5px] text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-200/90"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete this wish
              </button>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-border/70 bg-card/30 p-5">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Keeping this safe
            </h2>
            <p className="flex items-start gap-2.5 text-[12px] leading-relaxed text-muted-foreground">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
              Delivery is arranged privately after funding. No address or phone number is ever shown
              on a wish.
            </p>
            <p className="flex items-start gap-2.5 text-[12px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
              Anyone asking for payment off-platform is removed. Keep everything inside WishDrop.
            </p>
            {PAYMENT_MODE === "demo" && paymentsOpen && (
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5 text-[11px] leading-relaxed text-amber-100/75">
                Demo build: support recorded here is simulated. No money is transferred and no order
                is placed.
              </p>
            )}
            {!paymentsOpen && (
              <p className="rounded-lg border border-border/70 bg-background/40 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                {DONATIONS_CLOSED_COPY}
              </p>
            )}
          </div>

          {isOwner && (
            <div className="rounded-2xl border border-border/70 bg-card/30 p-5 text-[12px] leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground/85">Your public identity</p>
              <p className="mt-1.5">
                {authorHandle.anonymous
                  ? "Your profile is anonymous, so this wish shows a stable anonymous handle instead of your name."
                  : `This wish currently shows “${authorHandle.name}” on your profile.`}
              </p>
              <Link
                to="/account?tab=settings"
                className="mt-2 inline-block text-foreground/80 underline-offset-4 hover:underline"
              >
                Change in profile settings
              </Link>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-border/60 pt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-[20px] font-semibold tracking-[-0.015em]">More in {CATEGORY_LABELS[wish.category]}</h2>
            <Link to="/explore" className="text-[12.5px] text-muted-foreground hover:text-foreground">
              See all
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((item: Wish) => (
              <WishCard
                key={item.id}
                wish={item}
                author={profileMap.get(item.authorId)}
                saved={profile ? isSaved(item.id) : false}
                onToggleSave={onToggleSaveFromCard}
              />
            ))}
          </div>
        </section>
      )}

      <ContributeDialog
        wish={wish}
        open={contributeOpen}
        onClose={() => setContributeOpen(false)}
        onDone={() => reload()}
      />
      {profile && !isOwner && (
        <ReportDialog
          wish={wish}
          reporterId={profile.id}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
      {isOwner && (
        <ThankYouDialog
          wish={wish}
          open={thankOpen}
          onClose={() => setThankOpen(false)}
          onPosted={reload}
        />
      )}

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this wish?"
        description="This removes the wish and its progress from the feed. Supporters keep their own contribution history."
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Keep it
          </Button>
          <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete wish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
