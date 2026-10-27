import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans text-[10px] font-semibold tracking-wide uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "border-forest/30 bg-forest text-ivory",
        secondary: "border-sage/60 bg-sage/35 text-forest",
        outline: "border-olive/25 bg-white/70 text-olive",
        success: "border-sage bg-sage/45 text-forest font-bold",
        warning: "border-butter/80 bg-butter/45 text-forest font-bold",
        danger: "border-coral/40 bg-coral/15 text-coral font-bold",
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
