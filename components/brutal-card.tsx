import { type HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface BrutalCardProps extends HTMLAttributes<HTMLDivElement> {
  tilt?: "left" | "right" | "none"
}

export const BrutalCard = forwardRef<HTMLDivElement, BrutalCardProps>(
  ({ className, tilt = "none", children, ...props }, ref) => {
    const tiltClass = {
      left: "tilt-left",
      right: "tilt-right",
      none: "",
    }

    return (
      <div
        ref={ref}
        className={cn("bg-card brutal-border-thick brutal-shadow-lg p-6", tiltClass[tilt], className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)

BrutalCard.displayName = "BrutalCard"
