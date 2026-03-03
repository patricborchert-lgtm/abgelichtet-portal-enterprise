import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", {
  variants: {
    variant: {
      default: "bg-[#8F87F1]/12 text-[#6E65D8]",
      destructive: "bg-rose-500/10 text-rose-700",
      outline: "border border-slate-200 bg-white text-slate-700",
      secondary: "bg-amber-500/10 text-amber-700",
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
