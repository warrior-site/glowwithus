export default function BigText({ scrollY }) {
  return (
    <section style={{ padding: "100px 0", overflow: "hidden", background: "var(--navy)" }}>
      {[
        { text: "GLOW BEYOND — HEAL DEEPER — KNOW YOUR SKIN — GLOW BEYOND — HEAL DEEPER —", filled: false, offset: -0.15 },
        { text: "DERMATOLOGY MEETS AI — DERMATOLOGY MEETS AI — DERMATOLOGY MEETS AI —", filled: true, offset: 0.1, baseOffset: -120 },
      ].map((row, i) => (
        <div key={i} style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(70px, 12vw, 180px)",
          fontWeight: 800, whiteSpace: "nowrap", lineHeight: 1, letterSpacing: -3,
          padding: "10px 0",
          color: row.filled ? "var(--cream)" : "transparent",
          WebkitTextStroke: row.filled ? "none" : "1px rgba(245,240,235,0.15)",
          transform: `translateX(${scrollY * row.offset + (row.baseOffset || 0)}px)`,
          willChange: "transform",
        }}>{row.text}</div>
      ))}
    </section>
  );
}