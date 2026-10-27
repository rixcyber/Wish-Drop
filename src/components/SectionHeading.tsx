import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WishFeedHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function WishFeedHeader({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: WishFeedHeaderProps) {
  return (
    <div className={cn("max-w-xl space-y-2.5", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
      )}
      <h2 className="text-balance text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[30px]">
        {title}
      </h2>
      {description && (
        <p className="text-pretty text-[13.5px] leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 border-b border-border/50 pb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
        )}
        <h1 className="text-balance text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[38px]">
          {title}
        </h1>
        {description && (
          <p className="text-pretty text-[14px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
