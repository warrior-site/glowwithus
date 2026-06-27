// src/components/auth/AuthCommon.jsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export const C = {
  navy: "#0A0A1A",
  navyLight: "#12122A",
  navyMid: "#1A1A35",
  rose: "#FF3E7F",
  roseDim: "#CC2F62",
  violet: "#7B5EA7",
  violetDim: "#5E4580",
  amber: "#E8A838",
  offWhite: "#F5F0EB",
  offWhiteDim: "#C8C3BE",
  surface: "#0F0F22",
  border: "rgba(245,240,235,0.08)",
  borderHover: "rgba(245,240,235,0.18)",
};

export function Field({ label, name, type = "text", value, onChange, required, options }) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value?.length > 0;

  const sharedStyle = {
    width: "100%", background: "transparent", border: "none", outline: "none", color: C.offWhite,
    fontSize: 15, paddingTop: 20, paddingBottom: 6, fontFamily: "inherit", appearance: "none"
  };

  return (
    <div style={{ position: "relative", marginBottom: 18 }}>
      <motion.div
        animate={{ borderColor: focused ? C.rose : isActive ? C.violet : C.border, boxShadow: focused ? `0 0 0 1px ${C.rose}33` : "none" }}
        style={{ borderRadius: 10, border: `1.5px solid`, borderColor: C.border, background: C.navyMid, padding: "4px 14px 6px" }}
      >
        <motion.label animate={{ top: isActive ? 6 : 15, fontSize: isActive ? 11 : 15, color: focused ? C.rose : isActive ? C.violet : C.offWhiteDim }} style={{ position: "absolute", left: 14, pointerEvents: "none", fontWeight: 500 }}>
          {label}
        </motion.label>
        {type === "select" ? (
          <select name={name} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...sharedStyle, cursor: "pointer", color: value ? C.offWhite : "transparent" }}>
            <option value="" disabled />
            {options.map((o) => (<option key={o.value} value={o.value} style={{ background: C.navyMid }}>{o.label}</option>))}
          </select>
        ) : (
          <input type={type} name={name} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} required={required} autoComplete="off" style={sharedStyle} />
        )}
      </motion.div>
    </div>
  );
}

export function PasswordField({ label, name, value, onChange }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isActive = focused || value?.length > 0;

  return (
    <div style={{ position: "relative", marginBottom: 18 }}>
      <motion.div animate={{ borderColor: focused ? C.rose : isActive ? C.violet : C.border }} style={{ borderRadius: 10, border: "1.5px solid", borderColor: C.border, background: C.navyMid, padding: "4px 44px 6px 14px" }}>
        <motion.label animate={{ top: isActive ? 6 : 15, fontSize: isActive ? 11 : 15, color: focused ? C.rose : isActive ? C.violet : C.offWhiteDim }} style={{ position: "absolute", left: 14, pointerEvents: "none" }}>
          {label}
        </motion.label>
        <input type={show ? "text" : "password"} name={name} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.offWhite, fontSize: 15, paddingTop: 20, paddingBottom: 6 }} />
        <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.offWhiteDim, fontSize: 18 }}>
          {show ? "◡" : "◠"}
        </button>
      </motion.div>
    </div>
  );
}

export function TabBtn({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "12px 0", fontSize: 15, fontWeight: 600, color: active ? C.offWhite : C.offWhiteDim, position: "relative" }}>
      {label}
      {active && (
        <motion.div layoutId="tab-indicator" style={{ position: "absolute", bottom: 0, left: "15%", right: "15%", height: 2, borderRadius: 1, background: `linear-gradient(90deg, ${C.rose}, ${C.violet})` }} />
      )}
    </button>
  );
}

export function SubmitBtn({ loading, label }) {
  return (
    <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }} style={{ width: "100%", padding: "14px 0", borderRadius: 10, border: "none", background: loading ? C.navyMid : `linear-gradient(135deg, ${C.rose} 0%, ${C.violet} 100%)`, color: loading ? C.offWhiteDim : C.offWhite, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
      {loading ? <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}>Working…</motion.span> : label}
    </motion.button>
  );
}

export function ErrorBanner({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }} style={{ background: `${C.rose}18`, border: `1px solid ${C.rose}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#FF8FAE" }}>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BackgroundGrid() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke={C.offWhite} strokeWidth="0.5" /></pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity }} style={{ position: "absolute", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.violet}40 0%, transparent 70%)` }} />
    </div>
  );
}

export function ParticleBurst({ active }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({ id: i, angle: (i / 20) * 360, color: [C.rose, C.amber, C.violet, C.offWhite][i % 4], distance: 60 + Math.random() * 80, size: 4 + Math.random() * 6 }));
  return (
    <AnimatePresence>
      {active && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 9999 }}>
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <motion.div key={p.id} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(rad) * p.distance, y: Math.sin(rad) * p.distance, opacity: 0, scale: 0 }} style={{ position: "absolute", width: p.size, height: p.size, borderRadius: "50%", background: p.color }} />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

export function SuccessScreen({ user, mode }) {
  const router = useRouter();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${C.rose}, ${C.violet})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }} />
      <h2 style={{ color: C.offWhite, fontSize: 22, fontWeight: 700 }}>{mode === "login" ? `Welcome back!` : "You're in!"}</h2>
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 1.2 }} style={{ height: 2, background: `linear-gradient(90deg, ${C.rose}, ${C.violet})`, marginTop: 32 }} onAnimationComplete={() => setTimeout(() => router.push("/facial-analysis"), 300)} />
    </motion.div>
  );
}