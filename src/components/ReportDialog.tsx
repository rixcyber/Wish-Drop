import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Textarea } from "./ui/input";
import { Field, Select } from "./ui/field";
import { api } from "@/lib/api";
import type { ReportReason, Wish } from "@/lib/types";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "scam", label: "Looks like a scam" },
  { value: "misleading", label: "Misleading or unverifiable" },
  { value: "prohibited", label: "Prohibited request" },
  { value: "duplicate", label: "Duplicate wish" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "privacy", label: "Shares personal information" },
  { value: "other", label: "Something else" },
];

interface ReportDialogProps {
  wish: Wish;
  reporterId: string;
  open: boolean;
  onClose: () => void;
}

export function ReportDialog({ wish, reporterId, open, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason>("scam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("scam");
    setDetails("");
    setError(null);
    setBusy(false);
  }, [open]);

  async function submit() {
    if (details.trim().length < 15) {
      setError("Add a sentence or two so a moderator can check it properly.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.createReport({ wishId: wish.id, reporterId, reason, details });
      toast.success("Report sent to moderation", {
        description: "A moderator reviews reports in a human queue. You won't be identified to the person who posted this.",
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send that report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Report this wish"
      description="What looks wrong? Reports are confidential and reviewed by a person."
    >
      <div className="space-y-4">
        <Field label="Reason" htmlFor="report-reason">
          <Select id="report-reason" value={reason} onChange={(event) => setReason(event.target.value as ReportReason)}>
            {REASONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="What did you notice?"
          htmlFor="report-details"
          hint="Mention anything verifiable: off-platform payment requests, copied stories, addresses, pressure."
        >
          <Textarea
            id="report-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={800}
            rows={4}
            placeholder="Be specific. A moderator will read this alongside the wish."
          />
        </Field>
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
            Send report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
