import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Textarea } from "./ui/input";
import { Field, Switch } from "./ui/field";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Wish } from "@/lib/types";

export function ThankYouDialog({
  wish,
  open,
  onClose,
  onPosted,
}: {
  wish: Wish;
  open: boolean;
  onClose: () => void;
  onPosted: () => void;
}) {
  const { profile } = useAuth();
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMessage(wish.thankYou ?? "");
    setAnonymous(false);
    setBusy(false);
    setError(null);
  }, [open, wish.thankYou]);

  async function submit() {
    if (!profile) return;
    if (message.trim().length < 20) {
      setError("A couple of sentences, so it means something to the people who helped.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.postThankYou({
        wishId: wish.id,
        fromProfileId: profile.id,
        toProfileId: wish.authorId,
        anonymous,
        message,
      });
      toast.success("Thank-you posted", { description: "Supporters were notified without seeing who you are." });
      onPosted();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not post that message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Say thank you"
      description="Supporters get a notification. They never see your identity unless you choose to share it."
    >
      <div className="space-y-4">
        <Field
          label="Your message"
          htmlFor="thank-you-message"
          hint="Avoid contact details — the platform keeps delivery arrangements private."
        >
          <Textarea
            id="thank-you-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={600}
            rows={5}
            placeholder="What changed for you? Even a small detail means a lot to someone who helped."
          />
        </Field>
        <Switch
          checked={anonymous}
          onChange={setAnonymous}
          label="Post anonymously"
          description="Your display name stays hidden on this thank-you message."
        />
        {error && (
          <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-[12.5px] text-red-200/90">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Post thank-you
          </Button>
        </div>
      </div>
    </Modal>
  );
}
