import React from "react"

export interface RenderProps {
  size: { width: number; height: number }
  title: string
  stops: [string, string, string]
  base: string
  emojiSrc?: string
  kind?: "opengraph" | "twitter"
}

export function renderSocial({ size, title, stops, base, emojiSrc }: RenderProps) {
  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: base,
        border: "12px solid #000",
        boxSizing: "border-box",
        padding: 24,
        textAlign: "center",
        fontFamily: "Bangers, sans-serif",
        position: "relative",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {(() => {
          const cx = size.width / 2
          const cy = size.height / 2
          const r = Math.hypot(size.width, size.height)
          return (
            <g>
              <defs>
                <radialGradient id="bg" cx={`${cx}`} cy={`${cy}`} r={`${r}`} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={stops[0]} />
                  <stop offset="55%" stopColor={stops[1]} />
                  <stop offset="100%" stopColor={stops[2]} />
                </radialGradient>
              </defs>
              <rect x={0} y={0} width={size.width} height={size.height} fill="url(#bg)" />
            </g>
          )
        })()}
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {(() => {
          const wedges: React.ReactElement[] = []
          const cx = size.width / 2
          const cy = size.height / 2
          const count = 48
          const radius = Math.hypot(size.width, size.height)
          const innerR = 2
          const colors = [
            "rgba(255,255,255,0.24)",
            "rgba(255,255,255,0.08)",
          ]
          for (let i = 0; i < count; i++) {
            const a1 = (i * 2 * Math.PI) / count
            const a2 = ((i + 1) * 2 * Math.PI) / count
            const x1 = cx + radius * Math.cos(a1)
            const y1 = cy + radius * Math.sin(a1)
            const x2 = cx + radius * Math.cos(a2)
            const y2 = cy + radius * Math.sin(a2)
            const ix1 = cx + innerR * Math.cos(a1)
            const iy1 = cy + innerR * Math.sin(a1)
            const ix2 = cx + innerR * Math.cos(a2)
            const iy2 = cy + innerR * Math.sin(a2)
            wedges.push(
              <polygon
                key={i}
                points={`${ix1},${iy1} ${x1},${y1} ${x2},${y2} ${ix2},${iy2}`}
                fill={colors[i % 2]}
              />,
            )
          }
          return wedges
        })()}
        <circle cx={size.width / 2} cy={size.height / 2} r={2} fill="#ff7fbf" />
      </svg>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {emojiSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={emojiSrc} alt="emoji" width={220} height={220} style={{ display: "block" }} />
        ) : (
          <div style={{ fontSize: 220, lineHeight: 1 }}>🥴</div>
        )}
        <div style={{
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: 2,
          color: "#fff",
          textShadow:
            "4px 0 #000, -4px 0 #000, 0 4px #000, 0 -4px #000, 3px 3px #000, -3px -3px #000, 3px -3px #000, -3px 3px #000",
        }}>{title}</div>
        <div style={{
          fontSize: 36,
          fontWeight: 700,
          color: "#fff",
          textShadow:
            "3px 0 #000, -3px 0 #000, 0 3px #000, 0 -3px #000, 2px 2px #000, -2px -2px #000, 2px -2px #000, -2px 2px #000",
        }}>The Ultimate Party Voting Game</div>
      </div>
    </div>
  )
}
