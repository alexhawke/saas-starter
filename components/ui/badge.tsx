import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary border-transparent text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary border-transparent text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive border-transparent text-destructive-foreground hover:bg-destructive/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        success:
          "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100",
        warning:
          "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100",
        info:
          "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 