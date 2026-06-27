import { useState } from "react";
import { useInView } from "../hooks/useInView";

export default function ConditionCard({ condition, index, onHover }) {
  const [ref, visible] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref} style={{
      background: hovered ? "#15153A" : "var(--navy2)",
      padding: "52px 40px",
      position: "relative", overflow: "hidden", cursor: "none",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.6s ${index * 0.1}s, transform 0.6s ${index * 0.1}s, background 0.3s`,
    }}
      onMouseEnter={() => { setHovered(true); onHover(true); }}
      onMouseLeave={() => { setHovered(false); onHover(false); }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${condition.accent}, transparent 60%)`,
        opacity: hovered ? 0.06 : 0, transition: "opacity 0.4s",
      }} />
      <span style={{ fontSize: 48, marginBottom: 24, display: "block", transition: "transform 0.3s, filter 0.3s", filter: hovered ? "grayscale(0)" : "grayscale(0.3)", transform: hovered ? "scale(1.2) rotate(-5deg)" : "scale(1)" }}>{condition.icon}</span>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 16, lineHeight: 1.1, color: "var(--cream)" }}>{condition.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(245,240,235,0.5)", fontWeight: 400, fontFamily: "'Space Grotesk', sans-serif" }}>{condition.desc}</p>
      <span style={{
        display: "inline-block", marginTop: 28,
        fontSize: 11, letterSpacing: hovered ? 4 : 2, textTransform: "uppercase",
        color: condition.accent,
        borderBottom: `1px solid ${condition.accent}`, paddingBottom: 2,
        transition: "letter-spacing 0.3s",
        fontFamily: "'Space Grotesk', sans-serif",
      }}>Learn More →</span>
    </div>
  );
}