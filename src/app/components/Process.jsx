import { useInView } from "../hooks/useInView";

const STEPS = [
  { num: "01", title: "Scan Your Skin", desc: "Upload a selfie or use live camera. Our computer vision engine scans over 40 visual markers in real time — pores, texture, pigmentation, oiliness." },
  { num: "02", title: "AI Diagnoses",   desc: "Our model — trained on 3 million+ clinical images — identifies active conditions, severity levels, and underlying triggers specific to your skin type." },
  { num: "03", title: "Get Your Protocol", desc: "A custom AM/PM routine with ingredient-level guidance, product suggestions, and dermatologist notes tailored exactly to your diagnosis." },
  { num: "04", title: "Track Progress", desc: "Weekly re-scans measure real change. See your skin score evolve. Adjust your protocol as you improve." },
];

export default function Process() {
  const [vizRef, vizVisible] = useInView();
  const [labelRef, labelVisible] = useInView();
  const [titleRef, titleVisible] = useInView();
  return (
    <section id="how-it-works" style={{ padding: "140px 48px", background: "var(--navy)" }}>
      <span ref={labelRef} style={{
        fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "var(--rose)",
        marginBottom: 24, display: "block",
        opacity: labelVisible ? 1 : 0, transform: labelVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s, transform 0.6s", fontFamily: "'Space Grotesk', sans-serif",
      }}>How It Works</span>
      <h2 ref={titleRef} style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(40px, 6vw, 88px)", fontWeight: 800, lineHeight: 1, letterSpacing: -2,
        marginBottom: 80, color: "var(--cream)",
        opacity: titleVisible ? 1 : 0, transform: titleVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.8s 0.2s, transform 0.8s 0.2s",
      }}>Science-backed.<br />Personalized.</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
        <div>
          {STEPS.map((step, i) => {
            const [stepRef, stepVisible] = useInView();
            return (
              <div key={i} ref={stepRef} style={{
                padding: "40px 0", borderTop: "1px solid rgba(255,255,255,0.07)",
                display: "flex", gap: 32, alignItems: "flex-start",
                opacity: stepVisible ? 1 : 0,
                transform: stepVisible ? "translateX(0)" : "translateX(40px)",
                transition: `opacity 0.6s ${i * 0.15}s, transform 0.6s ${i * 0.15}s`,
              }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 800, color: "var(--rose)", minWidth: 32, paddingTop: 4 }}>{step.num}</span>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10, letterSpacing: -0.3, color: "var(--cream)" }}>{step.title}</div>
                  <p style={{ fontSize: 14, color: "rgba(245,240,235,0.5)", lineHeight: 1.7, fontFamily: "'Space Grotesk', sans-serif" }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={vizRef} style={{
          position: "sticky", top: 120,
          opacity: vizVisible ? 1 : 0, transform: vizVisible ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.8s, transform 0.8s",
          display: "flex", justifyContent: "center",
        }}>
          <div style={{
            width: "min(440px, 90vw)", aspectRatio: 1, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, rgba(255,62,127,0.3) 0%, rgba(123,94,167,0.2) 40%, rgba(8,8,26,0.9) 80%)",
            border: "1px solid rgba(255,62,127,0.15)",
            position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
            animation: "orbPulse 4s ease-in-out infinite",
          }}>
            {[["12s","var(--rose)","110%"],["20s","var(--amber)","130%","reverse"],["30s","var(--violet)","155%"]].map(([dur, col, size, dir], i) => (
              <div key={i} style={{
                position: "absolute",
                width: size, height: size,
                border: "1px solid rgba(255,255,255,0.06)", borderRadius: "50%",
                animation: `spin ${dur} linear ${dir||""} infinite`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, position: "absolute", top: -4, left: "calc(50% - 4px)" }} />
              </div>
            ))}
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800,
              textAlign: "center", lineHeight: 1.2, letterSpacing: -1, zIndex: 2, color: "var(--cream)",
            }}>
              YOUR<br />
              <span style={{ background: "linear-gradient(135deg,var(--rose),var(--violet))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>SKIN</span><br />
              SCORE
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}