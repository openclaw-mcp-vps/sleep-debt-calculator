import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-[var(--surface-muted)] text-[var(--text)] border border-[var(--border)]",
        success: "bg-[rgba(52,211,153,0.15)] text-[var(--success)] border border-[rgba(52,211,153,0.35)]",
        warning: "bg-[rgba(251,191,36,0.15)] text-[var(--warning)] border border-[rgba(251,191,36,0.35)]",
        danger: "bg-[rgba(248,113,113,0.15)] text-[var(--danger)] border border-[rgba(248,113,113,0.35)]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
