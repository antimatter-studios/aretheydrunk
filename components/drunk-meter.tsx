import type { DrunkLevel } from "@/lib/drunk-levels"

interface DrunkMeterProps {
  percentage: number
  level: DrunkLevel
}

export function DrunkMeter({ percentage, level }: DrunkMeterProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between font-[family-name:var(--font-bangers)] text-xl tracking-wide mb-3">
        <span className="text-sober">SOBER</span>
        <span className="brutal-border bg-secondary px-3 py-1 text-2xl">{percentage}%</span>
        <span className="text-drunk">WASTED</span>
      </div>
      <div className="h-12 bg-card brutal-border-thick overflow-hidden relative">
        {/* Halftone overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "6px 6px",
          }}
        />
        {/* Fill bar */}
        <div
          className="h-full transition-all duration-500 relative"
          style={{
            width: `${percentage}%`,
            backgroundColor: level.color,
          }}
        >
          {/* Animated stripes */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)",
            }}
          />
        </div>
      </div>
      {/* Markers */}
      <div className="flex justify-between text-xs font-bold mt-1 opacity-60">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
