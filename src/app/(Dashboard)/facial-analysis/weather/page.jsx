"use client";

import { useState, useEffect, useCallback } from "react";

const THEME = {
  navy: "#0A0A1A",
  offWhite: "#F5F0EB",
  acidRose: "#FF3E7F",
  violet: "#7B5EA7",
  amber: "#E8A838",
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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {icon}
          <span style={{ fontSize: 11, color: THEME.offWhite, opacity: 0.7, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}<span style={{ fontSize: 9, opacity: 0.6 }}>/{max}</span></span>
      </div>
      <div style={{ height: 4, background: "rgba(245,240,235,0.08)", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            borderRadius: 2,
            transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: `0 0 8px ${color}88`,
          }}
        />
      </div>
    </div>
  );
}

// --- Alert Chip ---
function AlertChip({ type, children }) {
  const colors = {
    danger: { bg: "rgba(255,62,127,0.12)", border: THEME.acidRose, text: THEME.acidRose },
    warning: { bg: "rgba(232,168,56,0.12)", border: THEME.amber, text: THEME.amber },
    info: { bg: "rgba(123,94,167,0.12)", border: THEME.violet, text: THEME.violet },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 6,
      padding: "8px 12px",
      fontSize: 12,
      color: c.text,
      lineHeight: 1.5,
      marginBottom: 8,
      display: "flex",
      gap: 8,
      alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 14, marginTop: 1 }}>{type === "danger" ? "⚠" : type === "warning" ? "◈" : "◉"}</span>
      <span>{children}</span>
    </div>
  );
}

// --- Skeleton ---
function Skeleton({ h = 12, w = "100%", mb = 8 }) {
  return (
    <div style={{
      height: h, width: w, marginBottom: mb,
      background: "rgba(245,240,235,0.06)",
      borderRadius: 4,
      animation: "dermPulse 1.8s ease-in-out infinite",
    }} />
  );
}

// --- Main Component ---
export default function SkinShieldWeather() {
  const [status, setStatus] = useState("idle"); // idle | locating | loading | ready | error
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [pulseSend, setPulseSend] = useState(false);

  const fetchWeather = useCallback(async (lat, lon) => {
    setStatus("loading");
    try {
      // Open-Meteo: free, no key, returns UV, humidity, apparent temp, wind
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,uv_index,precipitation&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather fetch failed");
      const data = await res.json();
      const c = data.current;

      // Derive AQI mock from wind (Open-Meteo doesn't expose AQI freely)
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
      setError("Geolocation not supported by your browser.");
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
        setError("Location access denied. Enable permissions to use this panel.");
        setStatus("error");
      }
    );
  };

  // --- Derive advice ---
  const getAdvice = (w) => {
    if (!w) return [];
    const items = [];
    if (w.uvi >= 8) items.push({ type: "danger", text: "Extreme UV detected. Apply mineral SPF 50+ immediately and reapply every 90 minutes. Seek shade between 10am–4pm." });
    else if (w.uvi >= 5) items.push({ type: "warning", text: `UV Index ${w.uvi} — elevated risk. Broad-spectrum mineral SPF 50 strongly advised. Reapply every 2 hours.` });
    else if (w.uvi >= 3) items.push({ type: "info", text: `UV Index ${w.uvi} — moderate. SPF 30+ sufficient. Consider antioxidant serum for photo-defense.` });

    if (w.humidity < 30) items.push({ type: "danger", text: `Humidity critically low (${w.humidity}%). Activate your moisture-lock routine — layer hyaluronic acid under an occlusive barrier immediately.` });
    else if (w.humidity < 50) items.push({ type: "warning", text: `Humidity at ${w.humidity}%. Add a humectant serum and seal with a barrier cream to prevent transepidermal water loss.` });

    if (w.aqi >= 7) items.push({ type: "warning", text: "High pollution proxy detected. Use a niacinamide + antioxidant shield. Double-cleanse tonight to remove particulate buildup." });

    if (w.precipitation > 0) items.push({ type: "info", text: `Precipitation active (${w.precipitation}mm). Reapply water-resistant SPF. Avoid heavy exfoliation today.` });

    if (items.length === 0) items.push({ type: "info", text: "Conditions are favorable today. Maintain your standard routine with SPF 30+ for baseline protection." });
    return items;
  };

  const advice = getAdvice(weather);

  const handleSendGemini = () => {
    setPulseSend(true);
    setTimeout(() => setPulseSend(false), 2000);
    // In production: inject context into Gemini prompt
  };

  const uvColor = weather ? (weather.uvi >= 8 ? THEME.acidRose : weather.uvi >= 5 ? THEME.amber : THEME.violet) : THEME.violet;

  return (
    <>
      <style>{`
        @keyframes dermPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        @keyframes scanRipple {
          0% { transform: scaleX(0.3); opacity: 0.8; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes geminiPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(123,94,167,0.6); }
          50% { box-shadow: 0 0 0 8px rgba(123,94,167,0); }
        }
        .derm-send-btn {
          animation: none;
        }
        .derm-send-btn.pulsing {
          animation: geminiPulse 0.6s ease-out 3;
        }
        .derm-locate-btn:hover {
          background: rgba(255,62,127,0.18) !important;
          border-color: ${THEME.acidRose} !important;
        }
      `}</style>

      <div style={{
        background: "rgba(10,10,26,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(245,240,235,0.10)",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 460,
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        color: THEME.offWhite,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Ambient glow bg */}
        <div style={{
          position: "absolute", top: -60, right: -60, width: 200, height: 200,
          background: `radial-gradient(circle, ${THEME.violet}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconShield color={THEME.acidRose} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: THEME.offWhite }}>SKIN SHIELD</div>
              <div style={{ fontSize: 10, color: THEME.offWhite, opacity: 0.4, letterSpacing: "0.1em" }}>DAILY WEATHER FORECAST</div>
            </div>
          </div>
          {coords && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: THEME.offWhite, opacity: 0.45 }}>
              <IconLocation />
              {coords.lat.toFixed(2)}°, {coords.lon.toFixed(2)}°
            </div>
          )}
        </div>

        {/* --- IDLE STATE --- */}
        {status === "idle" && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🛡️</div>
            <div style={{ fontSize: 13, color: THEME.offWhite, opacity: 0.6, marginBottom: 20, lineHeight: 1.6 }}>
              Enable location access to calculate<br />real-time environmental skin aggressors.
            </div>
            <button
              className="derm-locate-btn"
              onClick={requestLocation}
              style={{
                background: "rgba(255,62,127,0.10)",
                border: `1px solid ${THEME.acidRose}55`,
                borderRadius: 8,
                padding: "10px 22px",
                color: THEME.acidRose,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.06em",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              ◎ ENABLE LOCATION
            </button>
          </div>
        )}

        {/* --- LOCATING / LOADING STATE --- */}
        {(status === "locating" || status === "loading") && (
          <div>
            <div style={{ fontSize: 11, color: THEME.violet, marginBottom: 16, letterSpacing: "0.08em" }}>
              {status === "locating" ? "◎ ACQUIRING COORDINATES..." : "◎ FETCHING ENVIRONMENTAL DATA..."}
            </div>
            <Skeleton h={10} w="60%" mb={12} />
            <Skeleton h={4} mb={14} />
            <Skeleton h={4} w="80%" mb={14} />
            <Skeleton h={4} w="90%" mb={20} />
            <Skeleton h={60} mb={10} />
            <Skeleton h={40} w="70%" />
          </div>
        )}

        {/* --- ERROR STATE --- */}
        {status === "error" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⚡</div>
            <div style={{ fontSize: 12, color: THEME.acidRose, marginBottom: 16 }}>{error}</div>
            <button
              className="derm-locate-btn"
              onClick={requestLocation}
              style={{
                background: "rgba(255,62,127,0.10)",
                border: `1px solid ${THEME.acidRose}55`,
                borderRadius: 8,
                padding: "8px 18px",
                color: THEME.acidRose,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.06em",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              RETRY
            </button>
          </div>
        )}

        {/* --- READY STATE --- */}
        {status === "ready" && weather && (
          <>
            {/* Quick stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {[
                { label: "UV INDEX", value: weather.uvi, color: uvColor, icon: <IconSun color={uvColor} /> },
                { label: "HUMIDITY", value: `${weather.humidity}%`, color: THEME.violet, icon: <IconDroplet color={THEME.violet} /> },
                { label: "WIND", value: `${weather.wind}km/h`, color: THEME.offWhite, icon: <IconWind /> },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "rgba(245,240,235,0.04)",
                  border: "1px solid rgba(245,240,235,0.07)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                }}>
                  <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
                  <div style={{ fontSize: 8, opacity: 0.4, letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Aggressor Meter */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", opacity: 0.4, marginBottom: 12, textTransform: "uppercase" }}>
                ◈ Skin Aggressor Meter
              </div>
              <AggressorBar label="UV Exposure Risk" value={weather.uvi} max={11} color={uvColor} icon={<IconSun color={uvColor} />} />
              <AggressorBar label="Moisture Loss Risk" value={100 - weather.humidity} max={100} color={THEME.violet} icon={<IconDroplet color={THEME.violet} />} />
              <AggressorBar label="Pollution Proxy" value={weather.aqi} max={10} color={THEME.amber} icon={<IconWind color={THEME.amber} />} />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(245,240,235,0.06)", marginBottom: 16 }} />

            {/* AI Guard section */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", opacity: 0.4, marginBottom: 12, textTransform: "uppercase" }}>
                ◈ AI Skincare Guard
              </div>
              {advice.map((a, i) => (
                <AlertChip key={i} type={a.type}>{a.text}</AlertChip>
              ))}
            </div>

            {/* Send to Gemini */}
            <button
              className={`derm-send-btn${pulseSend ? " pulsing" : ""}`}
              onClick={handleSendGemini}
              style={{
                width: "100%",
                background: "rgba(123,94,167,0.14)",
                border: `1px solid ${THEME.violet}55`,
                borderRadius: 8,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                color: THEME.offWhite,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                transition: "background 0.2s",
              }}
            >
              <IconGemini />
              SEND CONTEXT TO GEMINI
            </button>
          </>
        )}
      </div>
    </>
  );
}