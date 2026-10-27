import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border-2 border-border text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[4px_4px_0_hsl(var(--foreground))] hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_hsl(var(--foreground))]",
        secondary: "bg-secondary text-secondary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] hover:bg-accent",
        outline: "bg-card shadow-[3px_3px_0_hsl(var(--foreground))] hover:-translate-x-px hover:-translate-y-px hover:bg-accent",
        ghost: "border-transparent bg-transparent shadow-none hover:border-border hover:bg-accent",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-9 w-9",
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
