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
      {eyebrow && <p className="font-meta text-[10px] font-bold uppercase text-muted-foreground">// {eyebrow}</p>}
      <h2 className="text-balance font-display text-[36px] leading-[0.95] sm:text-[44px]">
        {title}
      </h2>
      {description && (
        <p className="text-pretty text-[14px] leading-relaxed text-muted-foreground">{description}</p>
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
        "flex flex-col gap-5 border-b-2 border-border pb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow && <p className="font-meta text-[10px] font-bold uppercase text-muted-foreground">// {eyebrow}</p>}
        <h1 className="text-balance font-display text-[48px] leading-[0.9] sm:text-[60px]">
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
