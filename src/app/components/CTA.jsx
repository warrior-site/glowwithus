import { useInView } from "../hooks/useInView";

export default function CTA({ onHover }) {
  const [ref1, v1] = useInView();
  const [ref2, v2] = useInView();
  const [ref3, v3] = useInView();
  return (
    <section id="results" style={{
      padding: "160px 48px", textAlign: "center", position: "relative", overflow: "hidden",
      background: "var(--navy)",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,62,127,0.12), transparent 70%)",
      }} />
      <h2 ref={ref1} style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(48px, 8vw, 110px)", fontWeight: 800, letterSpacing: -3, lineHeight: 0.95,
        marginBottom: 32, position: "relative", zIndex: 1, color: "var(--cream)",
        opacity: v1 ? 1 : 0, transform: v1 ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.8s, transform 0.8s",
      }}>
        Ready for skin<br />that <span style={{ color: "var(--rose)" }}>finally</span><br />listens?
      </h2>
      <p ref={ref2} style={{
        fontSize: 18, color: "rgba(245,240,235,0.5)", maxWidth: 420, margin: "0 auto 48px",
        lineHeight: 1.6, position: "relative", zIndex: 1, fontFamily: "'Space Grotesk', sans-serif",
        opacity: v2 ? 1 : 0, transition: "opacity 0.8s 0.2s",
      }}>
        Join 2 million people who stopped guessing and started healing.
      </p>
      <div ref={ref3} style={{
        position: "relative", zIndex: 1,
        display: "flex", justifyContent: "center",
        opacity: v3 ? 1 : 0, transition: "opacity 0.8s 0.4s",
      }}>
        <div style={{
          display: "flex", gap: 12,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 100, padding: "6px 6px 6px 24px",
          maxWidth: 460, width: "100%", backdropFilter: "blur(10px)",
        }}>
          <input type="email" placeholder="Enter your email..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--cream)", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, minWidth: 0,
            }} />
          <button
            onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
            style={{
              background: "linear-gradient(135deg, var(--rose), var(--violet))",
              color: "#fff", border: "none", padding: "14px 28px", borderRadius: 100,
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, cursor: "none",
            }}>Start Free</button>
        </div>
      </div>
    </section>
  );
}