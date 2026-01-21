type OGCardProps = {
  width: number
  height: number
  title: string
  subtitle?: string
  emoji?: string
  useGradient?: boolean
  fontFamily?: string
}

export function OGCard({ width, height, title, subtitle, emoji = "🥴", useGradient = true, fontFamily }: OGCardProps) {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ff4da6",
        position: "relative",
        fontFamily:
          fontFamily ||
          'Bangers, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial',
      }}
    >
      {useGradient ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 45%, #ff80bf 0%, #ff4da6 55%, #ff1f8a 100%)",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 24,
          border: "12px solid #000",
          boxShadow: "16px 16px 0 #000",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          width: "100%",
          height: "100%",
          color: "#000",
        }}
      >
        {emoji ? <div style={{ fontSize: 220, lineHeight: 1, marginBottom: 20 }}>{emoji}</div> : null}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: 2,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 36, fontWeight: 700, marginTop: 16, textAlign: "center" }}>{subtitle}</div>
        ) : null}
      </div>
    </div>
  )
}
