"use client";

import { useState, useEffect, useCallback } from "react";

const THEME = {
  navy: "#0A0A1A",
  offWhite: "#F5F0EB",
  acidRose: "#FF3E7F",
  violet: "#7B5EA7",
  amber: "#E8A838",
  emerald: "#10B981", // Added for optimal health states
};

// --- Inline SVGs ---
const IconLocation = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={THEME.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const IconSun = ({ color = THEME.amber }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const IconDroplet = ({ color = THEME.violet }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);

const IconWind = ({ color = THEME.offWhite }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
  </svg>
);

const IconShield = ({ color = THEME.acidRose }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconGemini = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={THEME.offWhite} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- Meter Bar ---
function AggressorBar({ label, value, max, color, icon }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span style={{ fontSize: 11, color: THEME.offWhite, opacity: 0.7, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}<span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400 }}>/{max}</span></span>
      </div>
      <div style={{ height: 6, background: "rgba(245,240,235,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}44, ${color})`,
            borderRadius: 3,
            transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

// --- Alert Chip ---
function AlertChip({ type, children }) {
  const colors = {
    danger: { bg: "rgba(255,62,127,0.08)", border: "rgba(255,62,127,0.3)", text: THEME.acidRose },
    warning: { bg: "rgba(232,168,56,0.08)", border: "rgba(232,168,56,0.3)", text: THEME.amber },
    info: { bg: "rgba(123,94,167,0.08)", border: "rgba(123,94,167,0.3)", text: THEME.violet },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 12,
      color: c.text,
      lineHeight: 1.5,
      marginBottom: 10,
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 14, marginTop: 1, filter: `drop-shadow(0 0 4px ${c.text}44)` }}>
        {type === "danger" ? "✕" : type === "warning" ? "▲" : "◆"}
      </span>
      <span style={{ color: THEME.offWhite, opacity: 0.9 }}>{children}</span>
    </div>
  );
}

// --- Dynamic Skeleton Loader ---
function Skeleton({ h = 12, w = "100%", mb = 8 }) {
  return (
    <div style={{
      height: h, width: w, marginBottom: mb,
      background: `linear-gradient(90deg, rgba(123,94,167,0.08) 25%, rgba(123,94,167,0.18) 50%, rgba(123,94,167,0.08) 75%)`,
      backgroundSize: "200% 100%",
      borderRadius: 6,
      animation: "dermPulse 1.5s infinite linear",
    }} />
  );
}

export default function SkinShieldWeather() {
  const [status, setStatus] = useState("idle"); // idle | locating | loading | ready | error
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [pulseSend, setPulseSend] = useState(false);

  const fetchWeather = useCallback(async (lat, lon) => {
    setStatus("loading");
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,uv_index,precipitation&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Environmental payload fetch failed");
      const data = await res.json();
      const c = data.current;

      const aqiProxy = Math.max(1, Math.min(10, Math.round(10 - c.wind_speed_10m / 5)));

      setWeather({
        uvi: Math.round(c.uv_index * 10) / 10,
        humidity: c.relative_humidity_2m,
        temp: Math.round(c.temperature_2m),
        apparentTemp: Math.round(c.apparent_temperature),
        wind: Math.round(c.wind_speed_10m),
        precipitation: c.precipitation,
        aqi: aqiProxy,
        timezone: data.timezone,
      });
      setStatus("ready");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  }, []);

  const requestLocation = () => {
    setStatus("locating");
    setError(null);
    if (!navigator.geolocation) {
      setError("Biometric Telemetry / Geolocation not supported.");
      setStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        fetchWeather(latitude, longitude);
      },
      (err) => {
        setError("Location perimeter access denied. Re-enable device permissions.");
        setStatus("error");
      }
    );
  };

  const getAdvice = (w) => {
    if (!w) return [];
    const items = [];
    if (w.uvi >= 8) items.push({ type: "danger", text: "Critical UV ceiling breached. Layer mineral SPF 50+ immediately. Re-apply every 90 minutes." });
    else if (w.uvi >= 5) items.push({ type: "warning", text: `Elevated UV Risk (${w.uvi}). Broad-spectrum photoprotection required.` });
    else if (w.uvi >= 3) items.push({ type: "info", text: `Moderate UV (${w.uvi}). Standard SPF 30 adequate. Pair with antioxidant defenses.` });

    if (w.humidity < 30) items.push({ type: "danger", text: `Extreme low humidity (${w.humidity}%). High TEWL threat detected; deploy an occlusive barrier.` });
    else if (w.humidity < 50) items.push({ type: "warning", text: `Humidity compromised (${w.humidity}%). Introduce active humectants or rich ceramide matrices.` });

    if (w.aqi >= 7) items.push({ type: "warning", text: "Particulate barrier compromise likely. Implement a deep double-cleanse sequence tonight." });
    if (w.precipitation > 0) items.push({ type: "info", text: "Precipitation active. Ensure current defense layering is highly water-resistant." });

    if (items.length === 0) items.push({ type: "info", text: "Ambient environment optimal. Keep standard baseline topical shields active." });
    return items;
  };

  const advice = getAdvice(weather);

  // --- Derive Overall Skin Score ---
  const calculateSkinScore = (w) => {
    if (!w) return 100;
    let penalties = 0;
    penalties += (w.uvi * 5); // Max ~55 penalty
    penalties += w.humidity < 50 ? (50 - w.humidity) : 0; // Max 50 penalty
    penalties += (w.aqi * 3); // Max 30 penalty
    return Math.max(15, 100 - Math.round(penalties));
  };

  const skinScore = calculateSkinScore(weather);
  const scoreColor = skinScore > 75 ? THEME.emerald : skinScore > 45 ? THEME.amber : THEME.acidRose;

  const handleSendGemini = () => {
    setPulseSend(true);
    setTimeout(() => setPulseSend(false), 2000);
  };

  const uvColor = weather ? (weather.uvi >= 8 ? THEME.acidRose : weather.uvi >= 5 ? THEME.amber : THEME.violet) : THEME.violet;

  return (
    <>
      <style>{`
        @keyframes dermPulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes geminiPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(123,94,167,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(123,94,167,0); }
        }
        .derm-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .derm-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
        .derm-btn:active {
          transform: translateY(0);
        }
        .derm-send-btn.pulsing {
          animation: geminiPulse 0.6s ease-out 3;
        }
      `}</style>

      <div style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
        background: "transparent"
      }}>
        <div style={{
          background: "linear-gradient(145deg, rgba(10,10,26,0.95), rgba(15,15,35,0.9))",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(245,240,235,0.08)",
          borderRadius: 20,
          padding: "24px",
          width: "100%",
          maxWidth: "460px",
          fontFamily: "'Inter', system-ui, sans-serif",
          color: THEME.offWhite,
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(245,240,235,0.1)"
        }}>

          {/* Glowing Ambient Core Accent */}
          <div style={{
            position: "absolute", top: -80, right: -80, width: 220, height: 220,
            background: `radial-gradient(circle, ${status === 'ready' ? scoreColor + '1a' : THEME.violet + '22'} 0%, transparent 70%)`,
            pointerEvents: "none",
            transition: "background 0.5s ease"
          }} />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: 8, background: "rgba(255,62,127,0.08)", borderRadius: 10, border: `1px solid rgba(255,62,127,0.15)` }}>
                <IconShield color={THEME.acidRose} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", color: THEME.offWhite }}>SKIN SHIELD</div>
                <div style={{ fontSize: 9, color: THEME.offWhite, opacity: 0.4, letterSpacing: "0.12em", fontWeight: 500 }}>ENVIRONMENTAL TELEMETRY</div>
              </div>
            </div>
            {coords && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: THEME.offWhite, opacity: 0.5, background: "rgba(245,240,235,0.04)", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(245,240,235,0.05)" }}>
                <IconLocation />
                <span>{coords.lat.toFixed(2)}°, {coords.lon.toFixed(2)}°</span>
              </div>
            )}
          </div>

          {/* --- IDLE / INITIAL STATE --- */}
          {status === "idle" && (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 20px', background: 'rgba(123,94,167,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${THEME.violet}44` }}>
                <span style={{ fontSize: 32 }}>🛡️</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: THEME.offWhite }}>Environmental Analysis Pending</div>
              <div style={{ fontSize: 12, color: THEME.offWhite, opacity: 0.5, marginBottom: 24, lineHeight: 1.6 }}>
                Grant secure localized coordinates to compute active molecular UV risks, moisture attenuation ceilings, and particulate variables.
              </div>
              <button
                className="derm-btn"
                onClick={requestLocation}
                style={{
                  background: `linear-gradient(135deg, ${THEME.acidRose}, #E02868)`,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 24px",
                  color: "#FFF",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  boxShadow: `0 4px 14px ${THEME.acidRose}44`,
                  width: "100%",
                }}
              >
                INITIALIZE CORE SCAN
              </button>
            </div>
          )}

          {/* --- LOCATING / LOADING TIMELINE SKELETON --- */}
          {(status === "locating" || status === "loading") && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "8px 12px", background: "rgba(123,94,167,0.05)", borderRadius: 8, border: `1px solid ${THEME.violet}22` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.violet, animation: "pulse 1s infinite alternate" }} />
                <div style={{ fontSize: 11, color: THEME.violet, letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}>
                  {status === "locating" ? "Securing Sat-Telemetry Layer..." : "Parsing Air Column Profiles..."}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                <Skeleton h={50} />
                <Skeleton h={50} />
                <Skeleton h={50} />
              </div>
              <Skeleton h={14} w="40%" mb={12} />
              <Skeleton h={24} mb={10} />
              <Skeleton h={24} mb={10} />
              <Skeleton h={24} mb={24} />
              <Skeleton h={42} />
            </div>
          )}

          {/* --- ERROR DIAGNOSTICS STATE --- */}
          {status === "error" && (
            <div style={{ textAlign: "center", padding: "30px 12px", border: `1px solid rgba(255,62,127,0.15)`, borderRadius: 12, background: "rgba(255,62,127,0.02)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: THEME.acidRose, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Telemetry Protocol Failed</div>
              <div style={{ fontSize: 12, color: THEME.offWhite, opacity: 0.6, marginBottom: 20, lineHeight: 1.5 }}>{error}</div>
              <button
                className="derm-btn"
                onClick={requestLocation}
                style={{
                  background: "rgba(245,240,235,0.05)",
                  border: `1px solid ${THEME.offWhite}33`,
                  borderRadius: 8,
                  padding: "10px 20px",
                  color: THEME.offWhite,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                }}
              >
                RE-ATTEMPT SYNC
              </button>
            </div>
          )}

          {/* --- READY DASHBOARD STATE --- */}
          {status === "ready" && weather && (
            <>
              {/* Dynamic Health Index Display */}
              <div style={{
                background: "linear-gradient(180deg, rgba(245,240,235,0.02), rgba(245,240,235,0.05))",
                border: "1px solid rgba(245,240,235,0.06)",
                borderRadius: 14,
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20
              }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.4, letterSpacing: "0.08em", fontWeight: 600, marginBottom: 2 }}>AMBIENT DERMAL INDEX</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: scoreColor }}>
                    {skinScore > 75 ? "EXCELLENT SHIELD" : skinScore > 45 ? "STRESSED SHIELD" : "CRITICAL RISK"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: "-0.04em" }}>{skinScore}</div>
                  <div style={{ fontSize: 8, opacity: 0.3, letterSpacing: "0.05em", marginTop: 2, fontWeight: 700 }}>SCORE / 100</div>
                </div>
              </div>

              {/* Environmental Vectors Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "UV INDEX", value: weather.uvi, color: uvColor, icon: <IconSun color={uvColor} /> },
                  { label: "HUMIDITY", value: `${weather.humidity}%`, color: THEME.violet, icon: <IconDroplet color={THEME.violet} /> },
                  { label: "WIND LAYER", value: `${weather.wind} km/h`, color: THEME.offWhite, icon: <IconWind /> },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "rgba(245,240,235,0.02)",
                    border: "1px solid rgba(245,240,235,0.05)",
                    borderRadius: 12,
                    padding: "12px 8px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                  }}>
                    <div style={{ marginBottom: 6, height: 20, display: "flex", alignItems: "center" }}>{s.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.color, letterSpacing: "-0.01em" }}>{s.value}</div>
                    <div style={{ fontSize: 8, opacity: 0.35, letterSpacing: "0.08em", marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Aggressor Stress Stack */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.1em", opacity: 0.4, marginBottom: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>◆</span> ACTIVE EXTERNAL STRESSORS
                </div>
                <AggressorBar label="Photo-Oxidative (UV)" value={weather.uvi} max={11} color={uvColor} icon={<IconSun color={uvColor} />} />
                <AggressorBar label="Transepidermal Water Loss" value={100 - weather.humidity} max={100} color={THEME.violet} icon={<IconDroplet color={THEME.violet} />} />
                <AggressorBar label="Particulate Burden Proxy" value={weather.aqi} max={10} color={THEME.amber} icon={<IconWind color={THEME.amber} />} />
              </div>

              {/* System Divider */}
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(245,240,235,0.08), transparent)", marginBottom: 20 }} />

              {/* AI Real-time Logic Guard */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.1em", opacity: 0.4, marginBottom: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>◆</span> ARCHITECTURAL ROUTINE MODIFICATIONS
                </div>
                <div style={{ maxHeight: "210px", overflowY: "auto", paddingRight: 4 }}>
                  {advice.map((a, i) => (
                    <AlertChip key={i} type={a.type}>{a.text}</AlertChip>
                  ))}
                </div>
              </div>

              {/* Send Context Button */}
              <button
                className={`derm-btn dmr-sec-btn ${pulseSend ? "pulsing" : ""}`}
                onClick={handleSendGemini}
                style={{
                  width: "100%",
                  background: "rgba(123,94,167,0.12)",
                  border: `1px solid ${THEME.violet}44`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: "pointer",
                  color: THEME.offWhite,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                <IconGemini />
                STREAM ENGINE CONTEXT TO GEMINI
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}