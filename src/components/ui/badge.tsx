import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", {
  variants: {
    variant: {
      default: "bg-primary/10 text-primary",
      destructive: "bg-destructive/10 text-destructive",
      outline: "border border-border text-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      success: "bg-emerald-500/10 text-emerald-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ className, variant }))} {...props} />;
}
