import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-forest text-ivory border border-forest/30 hover:bg-forest-surface hover:shadow-md hover:shadow-forest/15 hover:-translate-y-0.5 rounded-xl",
        coral:
          "bg-coral text-white border border-coral/30 hover:bg-coral-hover hover:shadow-md hover:shadow-coral/25 hover:-translate-y-0.5 rounded-xl",
        secondary:
          "bg-sage/40 text-forest border border-sage/60 hover:bg-sage/70 rounded-xl",
        outline:
          "bg-white/80 text-forest border border-forest/15 hover:bg-white hover:border-forest/35 hover:shadow-sm rounded-xl",
        ghost:
          "bg-transparent text-ink/80 hover:bg-sage/25 hover:text-forest rounded-xl",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 rounded-xl",
        link:
          "text-forest underline-offset-4 hover:underline hover:text-coral transition-colors p-0 h-auto font-medium",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-xs rounded-lg",
        lg: "h-12 px-7 text-[15px] rounded-xl",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
