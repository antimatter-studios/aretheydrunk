import { type InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-5 py-4 bg-card text-foreground brutal-border-thick brutal-shadow-sm",
        "focus:outline-none focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0_#000]",
        "placeholder:text-muted-foreground font-bold text-lg transition-all",
        className,
      )}
      {...props}
    />
  )
})

BrutalInput.displayName = "BrutalInput"
