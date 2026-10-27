import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  ImagePlus,
  Info,
  Loader2,
  Lock,
  Sparkles,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, Select, Switch } from "@/components/ui/field";
import { WishCard } from "@/components/WishCard";
import { PageHeader } from "@/components/SectionHeading";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@/lib/useQuery";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { validateWishDraft, firstError, type DraftErrors } from "@/lib/validation";
import { CURRENCIES, CATEGORIES, GOAL_LIMITS, type Wish, type WishDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMPTY_DRAFT: WishDraft = {
  title: "",
  story: "",
  category: "essentials",
  goalAmount: 0,
  currency: "USD",
  imageUrl: null,
  itemUrl: null,
  fulfillmentMethod: "either",
  anonymous: false,
};

const FULFILLMENT_OPTIONS = [
  {
    value: "either" as const,
    label: "Either works",
    description: "Supporters can gift the item or contribute toward the cost.",
    icon: Sparkles,
  },
  {
    value: "gift" as const,
    label: "Gift the item",
    description: "The item is bought from a verified retailer and sent privately.",
    icon: Gift,
  },
  {
    value: "contribute" as const,
    label: "Contributions",
    description: "Several people can cover part of the amount.",
    icon: Wallet,
  },
];

export function PostWishPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const fileInput = useRef<HTMLInputElement>(null);

  const { data: editing, loading: loadingEdit } = useQuery(
    async () => (editId ? api.getWish(editId) : null),
    [editId],
  );

  const { data: myWishes } = useQuery(
    async () => (profile ? api.listWishes().then((list) => list.filter((w) => w.authorId === profile.id)) : []),
    [profile?.id],
  );

  const [draft, setDraft] = useState<WishDraft>(EMPTY_DRAFT);
  const [amountText, setAmountText] = useState("");
  const [errors, setErrors] = useState<DraftErrors>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!editing || hydrated) return;
    setDraft({
      title: editing.title,
      story: editing.story,
      category: editing.category,
      goalAmount: editing.goalAmount,
      currency: editing.currency,
      imageUrl: editing.imageUrl,
      itemUrl: editing.itemUrl,
      fulfillmentMethod: editing.fulfillmentMethod,
      anonymous: editing.anonymous,
    });
    setAmountText(String(editing.goalAmount));
    setHydrated(true);
  }, [editing, hydrated]);

  if (!profile) return null;
  const profileId = profile.id;

  if (editId && !loadingEdit && editing && editing.authorId !== profile.id) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-xl font-semibold">You can only edit your own wishes</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          If this wish belongs to someone else, you can report it from its page.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to={`/wishes/${editing.id}`}>Back to the wish</Link>
        </Button>
      </div>
    );
  }

  const goalAmount = Number(amountText);
  const effectiveDraft: WishDraft = { ...draft, goalAmount };
  const existingTitles = (myWishes ?? [])
    .filter((wish) => wish.id !== editId)
    .map((wish) => wish.title);
  const raised = editing?.raisedAmount ?? 0;

  const previewWish: Wish = {
    id: "preview",
    authorId: profile.id,
    title: draft.title.trim() || "Your wish title appears here",
    story:
      draft.story.trim() ||
      "This is where your story will sit — why this matters, what it would change, and how you'd use it.",
    category: draft.category,
    goalAmount: Number.isFinite(goalAmount) ? goalAmount : 0,
    currency: draft.currency,
    imageUrl: draft.imageUrl,
    itemUrl: draft.itemUrl,
    fulfillmentMethod: draft.fulfillmentMethod,
    anonymous: draft.anonymous,
    status: "open",
    raisedAmount: 0,
    supporterCount: 0,
    thankYou: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    removed: false,
    removeReason: null,
    featured: false,
  };

  function patch(next: Partial<WishDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await api.uploadWishImage(file);
      patch({ imageUrl: url });
      toast.success("Image attached");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not use that image.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleSubmit() {
    const nextErrors = validateWishDraft(effectiveDraft, { existingTitles });
    if (goalAmount < raised) {
      nextErrors.goalAmount = `Your wish already received ${formatMoney(raised, draft.currency)}. The goal cannot be lower than that.`;
    }
    setErrors(nextErrors);
    const problem = firstError(nextErrors);
    if (problem) {
      toast.error("Almost there", { description: problem });
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        const updated = await api.updateWish(editing.id, {
          title: effectiveDraft.title.trim(),
          story: effectiveDraft.story.trim(),
          category: effectiveDraft.category,
          goalAmount: effectiveDraft.goalAmount,
          currency: effectiveDraft.currency,
          imageUrl: effectiveDraft.imageUrl,
          itemUrl: effectiveDraft.itemUrl?.trim() || null,
          fulfillmentMethod: effectiveDraft.fulfillmentMethod,
          anonymous: effectiveDraft.anonymous,
        });
        toast.success("Wish updated");
        navigate(`/wishes/${updated.id}`);
      } else {
        const created = await api.createWish(profileId, effectiveDraft);
        toast.success("Your wish is live", {
          description: "You can edit or delete it at any time from your dashboard.",
        });
        navigate(`/wishes/${created.id}`);
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not publish that wish.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-12 sm:py-16">
      <PageHeader
        eyebrow={editing ? "Edit wish" : "Post a wish"}
        title={editing ? "Update your wish" : "Ask for something that would genuinely help."}
        description={
          editing
            ? "Keep the price honest. If you have already received support, the goal cannot drop below what has been given."
            : "One wish, one clear cost, one honest story. There is no urgency clock here — people find wishes when they find them."
        }
      />

      {loadingEdit && (
        <div className="mt-10 flex items-center gap-2 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your wish…
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <section className="space-y-5">
            <div>
              <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                The basics
              </h2>
            </div>

            <Field
              label="Wish title"
              htmlFor="wish-title"
              error={errors.title}
              hint="Be specific: “A refurbished laptop to finish my degree” beats “Help me please”."
            >
              <Input
                id="wish-title"
                value={draft.title}
                onChange={(event) => patch({ title: event.target.value })}
                maxLength={90}
                placeholder="What do you wish for?"
              />
              <p className="text-right text-[11px] text-muted-foreground">{draft.title.length}/90</p>
            </Field>

            <Field
              label="Why does this matter?"
              htmlFor="wish-story"
              error={errors.story}
              hint="Write like you're explaining it to one kind person, not to an audience. No addresses or phone numbers."
            >
              <Textarea
                id="wish-story"
                value={draft.story}
                onChange={(event) => patch({ story: event.target.value })}
                maxLength={2000}
                rows={7}
                placeholder="What is the situation, what would this change, and what have you already tried?"
              />
              <p className="text-right text-[11px] text-muted-foreground">{draft.story.length}/2000</p>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="wish-category">
                <Select
                  id="wish-category"
                  value={draft.category}
                  onChange={(event) => patch({ category: event.target.value as WishDraft["category"] })}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Amount needed"
                htmlFor="wish-amount"
                error={errors.goalAmount}
                hint={`Between ${GOAL_LIMITS.min} and ${GOAL_LIMITS.max.toLocaleString("en-US")}.`}
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="wish-amount"
                      inputMode="decimal"
                      value={amountText}
                      onChange={(event) => setAmountText(event.target.value.replace(/[^\d.]/g, ""))}
                      placeholder="0"
                      min={GOAL_LIMITS.min}
                      max={GOAL_LIMITS.max}
                      className="pr-12 tabular-nums"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11.5px] text-muted-foreground">
                      {draft.currency}
                    </span>
                  </div>
                  <Select
                    aria-label="Currency"
                    value={draft.currency}
                    onChange={(event) => patch({ currency: event.target.value as WishDraft["currency"] })}
                    className="w-[104px]"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </Select>
                </div>
              </Field>
            </div>
          </section>

          <section className="space-y-5 border-t border-border/60 pt-8">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Optional details
            </h2>

            <Field
              label="Retailer or quote link"
              htmlFor="wish-link"
              optional
              error={errors.itemUrl}
              hint="A real listing helps people verify the price before they help."
            >
              <Input
                id="wish-link"
                type="url"
                value={draft.itemUrl ?? ""}
                onChange={(event) => patch({ itemUrl: event.target.value || null })}
                placeholder="https://…"
              />
            </Field>

            <Field label="Item photo" optional hint="JPG or PNG, up to 8 MB. Screenshots of listings work well.">
              {draft.imageUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-border/70">
                  <img src={draft.imageUrl} alt="Wish preview" className="aspect-[16/9] w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => patch({ imageUrl: null })}
                    className="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-[11px] text-white/85 backdrop-blur transition-colors hover:bg-black/80"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/30 px-5 py-9 text-center transition-colors hover:border-border/80 hover:bg-accent/30 disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground" strokeWidth={1.6} />
                  )}
                  <span className="text-[12.5px] text-muted-foreground">
                    {uploading ? "Processing image…" : "Choose an image"}
                  </span>
                </button>
              )}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />
            </Field>
          </section>

          <section className="space-y-5 border-t border-border/60 pt-8">
            <div>
              <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                How people can help
              </h2>
              <p className="mt-2 text-[12.5px] text-muted-foreground">
                Choose the arrangement that makes sense for this wish.
              </p>
            </div>

            <div className="grid gap-3">
              {FULFILLMENT_OPTIONS.map((option) => {
                const active = draft.fulfillmentMethod === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => patch({ fulfillmentMethod: option.value })}
                    className={cn(
                      "flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all",
                      active
                        ? "border-forest bg-forest text-ivory shadow-sm"
                        : "border-olive/20 bg-white/80 text-ink hover:border-forest/30 hover:bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                        active ? "border-sage/30 bg-sage/20 text-butter" : "border-olive/20 bg-sage/20 text-forest",
                      )}
                    >
                      <option.icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span>
                      <span className={cn("block text-[14px] font-medium", active ? "text-ivory" : "text-forest")}>
                        {option.label}
                      </span>
                      <span className={cn("mt-0.5 block text-xs leading-relaxed", active ? "text-sage" : "text-olive")}>
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <Switch
              checked={draft.anonymous}
              onChange={(anonymous) => patch({ anonymous })}
              label="Post anonymously"
              description="Your display name is replaced by a stable anonymous handle. Supporters can still help you; WishDrop keeps the private link between the two of you."
            />
          </section>

          <section className="space-y-5 border-t border-olive/15 pt-8">
            <div className="rounded-2xl border border-olive/15 bg-white/70 p-4.5">
              <p className="flex items-start gap-2.5 text-xs leading-relaxed text-olive">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-forest" strokeWidth={1.8} />
                <span>
                  Publishing confirms the wish is yours, the amount is honest, and you will not ask
                  anyone to pay outside WishDrop. Misleading wishes are removed and repeat offenders
                  are suspended.
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button variant="coral" size="lg" onClick={() => void handleSubmit()} disabled={submitting || uploading}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editing ? "Saving…" : "Publishing…"}
                  </>
                ) : (
                  <>
                    {editing ? "Save changes" : "Publish wish"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <Link
                to={editing ? `/wishes/${editing.id}` : "/explore"}
                className="text-xs text-olive underline-offset-4 hover:text-forest hover:underline"
              >
                Cancel
              </Link>
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-coral">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
              Live preview
            </p>
            <WishCard wish={previewWish} author={profile} saved={false} />
          </div>

          <div className="rounded-3xl border border-sage/40 bg-sage/15 p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest">
              What makes a wish work
            </h2>
            <ul className="mt-3.5 space-y-2.5 text-xs leading-relaxed text-ink/80">
              <li className="flex gap-2">
                <span className="font-semibold text-coral">01</span>
                A specific item or verifiable expense — not a general request for cash.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-coral">02</span>
                A price you could show a receipt for.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-coral">03</span>
                A story that explains the gap, not one that performs it.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-coral">04</span>
                No contact details, addresses or other people's private information.
              </li>
            </ul>
            <div className="mt-4 flex items-start gap-2 border-t border-sage/30 pt-3.5 text-xs leading-relaxed text-olive">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest" strokeWidth={1.8} />
              <span>
                Never share payment details. WishDrop will never ask you to move a conversation to
                another app.
              </span>
            </div>
          </div>

          {editing && editing.raisedAmount > 0 && (
            <div className="rounded-2xl border border-butter/80 bg-butter/30 p-4 text-xs leading-relaxed text-amber-950">
              This wish has already received {formatMoney(editing.raisedAmount, editing.currency)}.
              Editing the story is fine; lowering the goal below the amount received is not.
            </div>
          )}

          <p className="flex items-center gap-1.5 text-xs text-olive">
            <Upload className="h-3.5 w-3.5" />
            Images are resized in your browser before upload.
          </p>
        </aside>
      </div>
    </div>
  );
}
