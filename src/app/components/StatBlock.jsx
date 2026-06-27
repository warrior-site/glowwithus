import { useInView } from "../hooks/useInView";
import { useCountUp } from "../hooks/useCountUp";

export default function StatBlock({ number, suffix, label, index }) {
  const [ref, visible] = useInView();
  const count = useCountUp(number, visible);
  return (
    <div ref={ref} style={{
      padding: "80px 60px", background: "var(--navy2)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.7s ${index * 0.15}s, transform 0.7s ${index * 0.15}s`,
    }}>
      <span style={{
        fontFamily: "'Syne', sans-serif", fontSize: "clamp(60px, 8vw, 110px)", fontWeight: 800, lineHeight: 1, letterSpacing: -3,
        background: "linear-gradient(135deg, var(--rose), var(--violet))",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        display: "block", marginBottom: 8,
      }}>{count}</span>
      <span style={{ fontSize: 26, fontWeight: 700, color: "var(--cream)", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>{suffix}</span>
      <span style={{ fontSize: 16, color: "rgba(245,240,235,0.5)", fontWeight: 400, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
    </div>
  );
}