export default function Cursor({ pos, expanded }) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: expanded ? 60 : 16,
      height: expanded ? 60 : 16,
      background: "var(--rose)",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 9999,
      mixBlendMode: "difference",
      transform: `translate(${pos.x - (expanded ? 30 : 8)}px, ${pos.y - (expanded ? 30 : 8)}px)`,
      transition: "width 0.2s ease, height 0.2s ease",
      willChange: "transform",
    }} />
  );
}