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
    <div className={cn("max-w-2xl space-y-2", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-sage/35 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-forest">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance font-serif text-[32px] sm:text-[42px] font-normal leading-[1.1] tracking-tight text-forest">
        {title}
      </h2>
      {description && (
        <p className="text-pretty text-[15px] leading-relaxed text-olive">{description}</p>
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
        "flex flex-col gap-6 border-b border-olive/20 pb-10 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-sage/35 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-forest">
            {eyebrow}
          </span>
        )}
        <h1 className="text-balance font-serif text-[42px] sm:text-[56px] font-normal leading-[1.05] tracking-tight text-forest">
          {title}
        </h1>
        {description && (
          <p className="text-pretty text-[15px] sm:text-[16px] leading-relaxed text-olive">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
