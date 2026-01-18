import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "drunk" | "sober" | "outline"
  size?: "sm" | "md" | "lg"
}

const variantStyles = {
  primary: "bg-primary text-foreground",
  secondary: "bg-secondary text-foreground",
  accent: "bg-accent text-foreground",
  drunk: "bg-drunk text-foreground",
  sober: "bg-sober text-foreground",
  outline: "bg-card text-foreground",
}

const sizeStyles = {
  sm: "px-5 py-2 text-sm",
  md: "px-7 py-3 text-base",
  lg: "px-10 py-4 text-xl",
}

export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "font-[family-name:var(--font-bangers)] uppercase tracking-wider brutal-border-thick brutal-shadow brutal-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

BrutalButton.displayName = "BrutalButton"
