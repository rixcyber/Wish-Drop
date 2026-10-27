import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/12 text-primary/90",
        secondary: "border-border bg-secondary text-muted-foreground",
        outline: "border-border text-muted-foreground",
        success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
        warning: "border-amber-500/25 bg-amber-500/10 text-amber-300",
        danger: "border-red-500/25 bg-red-500/10 text-red-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
