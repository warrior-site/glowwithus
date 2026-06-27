const MARQUEE_ITEMS = [
  "Acne & Breakouts","Hair Fall","Dark Spots","Oily Skin","Pigmentation",
  "Rosacea","Eczema","Dry Patches","Blackheads","Under-Eye Circles","Uneven Texture","Sun Damage",
];

export default function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{
      padding: "40px 0", overflow: "hidden",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)",
    }}>
      <div style={{
        display: "flex", gap: 80,
        animation: "marqueeScroll 20s linear infinite",
        width: "max-content",
      }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
            letterSpacing: 3, textTransform: "uppercase",
            color: "rgba(245,240,235,0.3)", whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rose)", display: "inline-block" }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}