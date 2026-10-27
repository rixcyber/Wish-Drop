import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, Gift, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Input, Textarea } from "./ui/input";
import { Field, Progress, Switch } from "./ui/field";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { createGiftOrder, processDemoPayment } from "@/lib/payments";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Wish } from "@/lib/types";

interface ContributeDialogProps {
  wish: Wish;
  open: boolean;
  onClose: () => void;
  onDone: (wish: Wish) => void;
}

type Method = "money" | "gift";

export function ContributeDialog({ wish, open, onClose, onDone }: ContributeDialogProps) {
  const { profile } = useAuth();
  const remaining = Math.max(0, Math.round((wish.goalAmount - wish.raisedAmount) * 100) / 100);
  const [method, setMethod] = useState<Method>("money");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [giftAcknowledged, setGiftAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMethod("money");
    setAmount(String(Math.min(remaining, 50) || remaining));
    setMessage("");
    setAnonymous(true);
    setGiftAcknowledged(false);
    setError(null);
    setBusy(false);
  }, [open, remaining]);

  const presets = useMemo(() => {
    const options = [25, 50, 100, remaining].filter((value, index, list) => {
      if (!Number.isFinite(value) || value <= 0 || value > remaining) return false;
      return list.indexOf(value) === index;
    });
    return options.slice(0, 4);
  }, [remaining]);

  const numericAmount = Number(amount);
  const progressPercent = (wish.raisedAmount / Math.max(wish.goalAmount, 1)) * 100;

  async function submit() {
    if (!profile) return;
    setError(null);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (numericAmount > remaining) {
      setError(`This wish only needs ${formatMoney(remaining, wish.currency)} more.`);
      return;
    }
    if (method === "gift" && !giftAcknowledged) {
      setError("Please confirm you understand this is a demo gift order.");
      return;
    }

    setBusy(true);
    try {
      if (method === "gift") {
        const order = await createGiftOrder({ wishId: wish.id, itemUrl: wish.itemUrl });
        const result = await api.createContribution({
          wishId: wish.id,
          supporterId: profile.id,
          amount: numericAmount,
          anonymous,
          method: "gift_item",
          message: message.trim() || null,
          paymentReference: order.reference,
          paymentStatus: order.status,
        });
        toast.success("Demo gift order recorded", { description: order.note });
        onDone(result.wish);
      } else {
        const payment = await processDemoPayment({
          wishId: wish.id,
          amount: numericAmount,
          currency: wish.currency,
        });
        const result = await api.createContribution({
          wishId: wish.id,
          supporterId: profile.id,
          amount: numericAmount,
          anonymous,
          method: "money",
          message: message.trim() || null,
          paymentReference: payment.reference,
          paymentStatus: payment.status,
        });
        toast.success("Demo contribution recorded", {
          description: `${formatMoney(numericAmount, wish.currency)} simulated · ref ${payment.reference}`,
        });
        onDone(result.wish);
      }
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That didn't go through. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={`Support “${wish.title}”`}
      description={`${formatMoney(remaining, wish.currency)} still needed · ${wish.supporterCount} ${
        wish.supporterCount === 1 ? "person has" : "people have"
      } helped`}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Progress value={progressPercent} />
          <div className="flex justify-between text-[11.5px] text-muted-foreground">
            <span>{formatMoney(wish.raisedAmount, wish.currency)} raised</span>
            <span>{formatMoney(wish.goalAmount, wish.currency)} goal</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-olive/15 bg-ivory p-1.5">
          {(
            [
              { value: "money", label: "Contribute money", icon: Wallet },
              { value: "gift", label: "Gift the item", icon: Gift },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMethod(option.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
                method === option.value
                  ? "bg-forest text-ivory font-semibold shadow-sm"
                  : "text-olive hover:text-forest",
              )}
            >
              <option.icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {option.label}
            </button>
          ))}
        </div>

        {method === "money" ? (
          <div className="space-y-3.5">
            <Field label="Amount" htmlFor="contribution-amount" hint="Demo mode — no card details are collected.">
              <div className="relative">
                <Input
                  id="contribution-amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="0"
                  className="pr-16 text-[15px] tabular-nums"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-olive">
                  {wish.currency}
                </span>
              </div>
            </Field>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs transition-all",
                    Number(amount) === preset
                      ? "border-forest bg-forest text-ivory font-semibold shadow-sm"
                      : "border-olive/20 bg-white/70 text-olive hover:border-forest/40 hover:text-forest",
                  )}
                >
                  {preset === remaining ? `Cover the rest · ${formatMoney(preset, wish.currency)}` : formatMoney(preset, wish.currency)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="rounded-2xl border border-sage/40 bg-sage/15 p-4 text-xs leading-relaxed text-olive">
              <p className="font-semibold text-forest">How gifting works</p>
              <p className="mt-1.5 text-ink/80">
                In a live build you would buy the exact item from the verified retailer below.
                WishDrop records the confirmed order value so the wish's progress stays accurate,
                and the recipient never sees your address or payment details.
              </p>
              {wish.itemUrl && (
                <a
                  href={wish.itemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-forest underline underline-offset-4 hover:text-coral"
                >
                  Open the retailer listing
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <Field label="Value of the gift" htmlFor="gift-amount" hint="Usually the remaining amount.">
              <div className="relative">
                <Input
                  id="gift-amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                  className="pr-16 text-[15px] tabular-nums"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-olive">
                  {wish.currency}
                </span>
              </div>
            </Field>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-olive/15 bg-white/60 p-3 text-xs leading-relaxed text-ink/80">
              <input
                type="checkbox"
                checked={giftAcknowledged}
                onChange={(event) => setGiftAcknowledged(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-olive/30 accent-coral"
              />
              <span>
                I understand this records a <span className="font-medium text-forest">demo</span> gift
                order. No retailer is contacted and nothing ships.
              </span>
            </label>
          </div>
        )}

        <Field label="Leave a note" htmlFor="contribution-message" optional>
          <Textarea
            id="contribution-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={240}
            rows={3}
            placeholder="Something kind and short. No contact details, please."
            className="min-h-[84px]"
          />
        </Field>

        <Switch
          checked={anonymous}
          onChange={setAnonymous}
          label="Stay anonymous publicly"
          description="Your display name is hidden from the wish owner and from everyone else. WishDrop still needs an account for refunds and safety."
        />

        <div className="rounded-2xl border border-butter/80 bg-butter/30 p-3.5 text-xs leading-relaxed text-amber-950">
          <span className="font-semibold text-forest">Demo payment. </span>
          No card is charged, no money moves, and this wish is not really funded. A live build only
          marks contributions confirmed after the payment provider's webhook.
        </div>

        {error && (
          <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-xs font-medium text-coral">
            {error}
          </p>
        )}

        <Button
          onClick={() => void submit()}
          disabled={busy || remaining <= 0}
          variant="coral"
          className="w-full"
          size="lg"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing demo payment…
            </>
          ) : method === "gift" ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Record demo gift · {formatMoney(Number.isFinite(numericAmount) ? numericAmount : 0, wish.currency)}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirm demo contribution · {formatMoney(Number.isFinite(numericAmount) ? numericAmount : 0, wish.currency)}
            </>
          )}
        </Button>
        <p className="text-center text-xs leading-relaxed text-olive">
          Contributions are refundable in a live build under the{" "}
          <Link to="/payments" className="text-forest underline underline-offset-4 hover:text-coral">
            published payment policy
          </Link>
          .
        </p>
      </div>
    </Modal>
  );
}
