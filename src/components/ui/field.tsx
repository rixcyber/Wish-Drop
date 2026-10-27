import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none text-foreground/90", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";

interface FieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={htmlFor}>{label}</Label>
          {optional && <span className="text-[11px] text-muted-foreground">Optional</span>}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-[12.5px] text-red-300/90">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-lg border border-input bg-background/60 px-3.5 pr-9 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          safe >= 100 ? "bg-emerald-400/80" : "bg-foreground/75",
        )}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-background/40 px-4 py-3.5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground/90">{label}</p>
        {description && <p className="text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
          checked ? "border-foreground/30 bg-foreground/85" : "border-border bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-[18px] w-[18px] rounded-full bg-background transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
