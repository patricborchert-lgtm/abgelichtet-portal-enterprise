import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-10 px-4 py-2.5",
        icon: "h-10 w-10",
        lg: "h-12 px-6",
        sm: "h-9 px-3",
      },
      variant: {
        default:
          "bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-[0_8px_20px_rgba(109,40,217,0.26)] hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_10px_24px_rgba(109,40,217,0.30)]",
        destructive:
          "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_8px_20px_rgba(225,29,72,0.24)] hover:from-rose-600 hover:to-rose-700 hover:shadow-[0_10px_24px_rgba(225,29,72,0.28)]",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        outline: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
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
    return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
