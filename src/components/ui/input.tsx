import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-olive/25 bg-white/80 px-3.5 py-2 text-sm text-ink transition-colors placeholder:text-olive/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 focus-visible:border-forest disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[130px] w-full rounded-xl border border-olive/25 bg-white/80 px-3.5 py-3 text-sm text-ink transition-colors placeholder:text-olive/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 focus-visible:border-forest disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Input, Textarea };
