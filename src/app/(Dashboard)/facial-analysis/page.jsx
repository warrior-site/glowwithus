"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useFacialAnalysisStore } from "@/stores/useFacialAnalysisStore";
import "@/app/styles/facial1.css";

/* ── debug ── */
const LOG = (...a) => console.log("[DermAI]", ...a);
const ERR = (...a) => console.error("[DermAI]", ...a);

/* ── helpers ── */
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

const fmtShort = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";

const todayLabel = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const severity = (v) => (v >= 60 ? "High" : v >= 30 ? "Moderate" : "Mild");

/* ── initial-load smoothing ── */
const MIN_HISTORY_LOAD_MS = 1100; // avoid a jarring instant flash on fast connections
const HISTORY_LOADING_MESSAGES = [
  "Connecting to your account…",
  "Looking up scan history…",
  "Fetching analysis records…",
  "Preparing your dashboard…",
];

/* ── normalise one raw scan document into dashboard-ready shape ── */
function normaliseScan(rawScan, currentUser) {
  if (!rawScan) return null;
  return {
    _id: rawScan._id,
    analysisNumber: rawScan._id?.slice(-4).toUpperCase() ?? "—",
    date: fmtDate(rawScan.createdAt),
    dateShort: fmtShort(rawScan.createdAt),
    imageUrl: rawScan.image_url ?? "",
    overallScore: rawScan.overall_health_score ?? 0,
    verdict: (rawScan.overall_health_score ?? 0) > 75 ? "Excellent Condition" : "Good Condition",
    verdictDesc: rawScan.ai_summary ?? "",
    estimatedAge: rawScan.ai_metrics?.skin_age_estimate ?? currentUser?.age ?? "—",
    metrics: {
      acne: rawScan.ai_metrics?.acne_score ?? 0,
      wrinkle: rawScan.ai_metrics?.wrinkle_score ?? 0,
      pigmentation: rawScan.ai_metrics?.pigmentation_score ?? 0,
      redness: rawScan.ai_metrics?.redness_score ?? 0,
      pores: rawScan.ai_metrics?.pores_score ?? 0,
      darkCircles: rawScan.ai_metrics?.dark_circles_score ?? 0,
    },
    detectedConcerns: (rawScan.detected_concerns ?? []).map((c, idx) => {
      const top = c.location_box?.top ?? 0;
      const left = c.location_box?.left ?? 0;
      const width = (c.location_box?.right ?? 0) - left;
      const height = (c.location_box?.bottom ?? 0) - top;
      return {
        id: c._id ?? idx,
        type: c.concern_type ?? "",
        name: (c.concern_type ?? "UNKNOWN").toUpperCase().replace("_", " "),
        confidence: Math.round((c.confidence ?? 0) * 100),
        location: c.concern_location ?? "",
        styles: { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` },
      };
    }),
    recommendations: rawScan.ai_recommendations ?? [],
    aiSummary: rawScan.ai_summary ?? "",
    skinHealthTags: (rawScan.detected_concerns ?? []).map((c) => c.concern_type).filter(Boolean),
  };
}

/* ─────────────────────────────────────────────
   SCAN ANIMATION OVERLAY
───────────────────────────────────────────── */
function ScanningOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10,
      background: "rgba(10,10,26,0.60)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "14px",
    }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, #FF3E7F 40%, #7B5EA7 60%, transparent)",
          boxShadow: "0 0 12px 4px rgba(255,62,127,0.5)",
          animation: "scanLine 2s ease-in-out infinite",
        }} />
      </div>
      <div className="cornerMarker cornerTopLeft" style={{ borderColor: "#FF3E7F", boxShadow: "0 0 8px #FF3E7F" }} />
      <div className="cornerMarker cornerTopRight" style={{ borderColor: "#FF3E7F", boxShadow: "0 0 8px #FF3E7F" }} />
      <div className="cornerMarker cornerBottomLeft" style={{ borderColor: "#7B5EA7", boxShadow: "0 0 8px #7B5EA7" }} />
      <div className="cornerMarker cornerBottomRight" style={{ borderColor: "#7B5EA7", boxShadow: "0 0 8px #7B5EA7" }} />
      <div style={{
        background: "rgba(255,62,127,0.15)", border: "1px solid rgba(255,62,127,0.4)",
        borderRadius: "12px", padding: "10px 20px",
        display: "flex", alignItems: "center", gap: "10px",
        backdropFilter: "blur(6px)",
      }}>
        <span style={{ fontSize: "18px", animation: "lumSpin 1s linear infinite", display: "inline-block" }}>⏳</span>
        <div>
          <div style={{ color: "#FF3E7F", fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em" }}>
            ANALYZING SKIN METRICS
          </div>
          <div style={{ color: "rgba(245,240,235,0.6)", fontSize: "11px", marginTop: "2px" }}>
            DermAI · Gemini 2.5 Flash
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: i % 2 === 0 ? "#FF3E7F" : "#7B5EA7",
            animation: `lumPulse 1.4s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center" }}>
        {["Uploading to ImageKit CDN", "Running Gemini vision pipeline", "Saving to database"].map((label, i) => (
          <div key={i} style={{ fontSize: "11px", color: "rgba(245,240,235,0.4)", display: "flex", alignItems: "center", gap: "5px" }}>
            <span>○</span>{label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HISTORY THUMB
───────────────────────────────────────────── */
function HistoryThumb({ scan, isActive, onClick }) {
  return (
    <div
      className={`historyThumb ${isActive ? "historyThumbActive" : ""}`}
      onClick={onClick}
      title={`View scan from ${scan.dateShort}`}
      style={{ cursor: "pointer", position: "relative", overflow: "hidden" }}
    >
      {/* Photo thumbnail */}
      {scan.imageUrl ? (
        <img
          src={scan.imageUrl}
          alt={`Scan ${scan.dateShort}`}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            borderRadius: "inherit",
            filter: isActive ? "none" : "brightness(0.65) saturate(0.8)",
            transition: "filter 0.2s ease",
          }}
        />
      ) : (
        <div className="historyImg" style={{ fontSize: "11px" }}>No img</div>
      )}

      {/* "Scanned" badge overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(to top, rgba(10,10,26,0.85) 0%, transparent 100%)",
        padding: "14px 4px 4px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "2px",
      }}>
        <span style={{
          fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em",
          color: isActive ? "#FF3E7F" : "rgba(245,240,235,0.6)",
          textTransform: "uppercase",
        }}>
          {isActive ? "● Viewing" : "Scanned"}
        </span>
        <span style={{ fontSize: "9px", color: "rgba(245,240,235,0.5)" }}>
          {scan.dateShort}
        </span>
      </div>

      {/* Active ring */}
      {isActive && (
        <div style={{
          position: "absolute", inset: 0,
          border: "2px solid #FF3E7F",
          borderRadius: "inherit",
          pointerEvents: "none",
          boxShadow: "0 0 0 1px rgba(255,62,127,0.3) inset",
        }} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function DermAI() {
  const { currentUser } = useUserStore();
  const fileInputRef = useRef(null);

  /* local state */
  const [previewUrl, setPreviewUrl] = useState(null);   // blob URL while uploading
  const [isUploading, setIsUploading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);     // all fetched scans, newest first
  const [selectedId, setSelectedId] = useState(null);   // which scan is being viewed
  const [historyError, setHistoryError] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true); // true until first history fetch settles
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const isFirstHistoryLoad = useRef(true);

  const {
    analysisData: latestRawScan,  // most recent scan from store (after new upload)
    isLoading,
    error,
    fetchAnalysisData,
    uploadAndAnalyzeScan,
  } = useFacialAnalysisStore();

  /* ── fetch history on mount ── */
  const fetchHistory = useCallback(async (userId) => {
    if (!userId) return;
    setHistoryError(null);
    const startedAt = Date.now();
    const isFirstLoad = isFirstHistoryLoad.current;
    try {
      LOG("fetchHistory →", userId);
      const res = await fetch(`/api/facial-analysis/history?userId=${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      /* data should be array of raw scan documents, newest first */
      const scans = Array.isArray(data)
        ? data
        : Array.isArray(data?.scans)
          ? data.scans
          : [];
      LOG("fetchHistory — received", scans.length, "scans");
      const normalised = scans.map((s) => normaliseScan(s, currentUser));
      setScanHistory(normalised);
      /* Auto-select the newest scan */
      if (normalised.length > 0 && !selectedId) {
        setSelectedId(normalised[0]._id);
      }
    } catch (e) {
      ERR("fetchHistory error:", e);
      setHistoryError(e.message);
      /* Fallback: use the single scan from the store if history endpoint fails */
    } finally {
      /* On the very first load, hold the loading screen for a minimum
         duration so it never flashes/blinks on fast connections — feels
         intentional rather than jumpy. Subsequent (background) refreshes
         resolve immediately since the dashboard is already visible. */
      if (isFirstLoad) {
        isFirstHistoryLoad.current = false;
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_HISTORY_LOAD_MS - elapsed);
        setTimeout(() => setHistoryLoading(false), remaining);
      } else {
        setHistoryLoading(false);
      }
    }
  }, [currentUser, selectedId]);

  useEffect(() => {
    if (!currentUser?._id) return;
    LOG("mount — currentUser:", currentUser._id);
    /* also trigger store fetch for the latest scan */
    fetchAnalysisData(currentUser._id);
    fetchHistory(currentUser._id);
  }, [currentUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── bugfix: don't spin forever if currentUser never resolves
     (e.g. auth still hydrating / user genuinely signed out) ── */
  useEffect(() => {
    if (currentUser?._id) return;
    const timeout = setTimeout(() => setHistoryLoading(false), 4000);
    return () => clearTimeout(timeout);
  }, [currentUser?._id]);

  /* ── when a fresh scan lands in the store, merge it into history ── */
  useEffect(() => {
    if (!latestRawScan?._id) return;
    const normalised = normaliseScan(latestRawScan, currentUser);
    setScanHistory((prev) => {
      /* avoid duplicates */
      const exists = prev.some((s) => s._id === normalised._id);
      if (exists) return prev;
      LOG("merging new scan into history:", normalised._id);
      return [normalised, ...prev];
    });
    setSelectedId(latestRawScan._id);
  }, [latestRawScan?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── cycle the "looking for history…" status messages while loading ── */
  useEffect(() => {
    if (!historyLoading) return;
    setLoadingMsgIdx(0);
    const id = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % HISTORY_LOADING_MESSAGES.length);
    }, 550);
    return () => clearInterval(id);
  }, [historyLoading]);

  /* ── release blob URL once CDN URL is available ── */
  useEffect(() => {
    if (latestRawScan?.image_url && previewUrl) {
      LOG("CDN url ready — revoking blob:", latestRawScan.image_url);
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [latestRawScan?.image_url, previewUrl]);

  /* ── selected scan data ── */
  const activeScan = selectedId
    ? (scanHistory.find((s) => s._id === selectedId) ?? scanHistory[0] ?? null)
    : (scanHistory[0] ?? null);

  /* is the selected scan the latest one (could be freshly uploading) */
  const isLatestSelected = !selectedId || selectedId === scanHistory[0]?._id;
  const isBusy = (isUploading || isLoading) && isLatestSelected;

  /* ── file processing ── */
  const processFile = (file) => {
    if (!file) { ERR("processFile: no file"); return; }
    LOG("processFile →", file.name, `${(file.size / 1024 / 1024).toFixed(2)}MB`);

    /* instant local preview */
    const blob = URL.createObjectURL(file);
    setPreviewUrl(blob);
    setIsUploading(true);

    /* ensure we switch to latest-scan view while uploading */
    setSelectedId(scanHistory[0]?._id ?? null);

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result;
      LOG("FileReader.onload — length:", base64?.length);

      if (!currentUser?._id) {
        ERR("No currentUser._id");
        setIsUploading(false);
        return;
      }

      const result = await uploadAndAnalyzeScan(currentUser._id, base64);
      LOG("uploadAndAnalyzeScan result:", result?._id ?? "null");
      setIsUploading(false);

      /* refresh full history so the new scan appears with CDN URL */
      await fetchHistory(currentUser._id);
    };

    reader.onerror = (e) => {
      ERR("FileReader error:", e);
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => { e.preventDefault(); processFile(e.dataTransfer.files?.[0]); };
  const triggerScan = () => fileInputRef.current?.click();

  /* ── scan button ── */
  const ScanButton = ({ label }) => (
    <button
      className="btn btnPrimary"
      onClick={isBusy ? undefined : triggerScan}
      disabled={isBusy}
      style={{ opacity: isBusy ? 0.65 : 1, cursor: isBusy ? "not-allowed" : "pointer" }}
    >
      <span style={isBusy ? { display: "inline-block", animation: "lumSpin 1s linear infinite" } : {}}>
        {isBusy ? "⏳" : (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="5" />
            <path d="M3 21c0-4.418 4.03-8 9-8s9 3.582 9 8" />
          </svg>
        )}
      </span>
      {isBusy ? "Analyzing…" : (label ?? (activeScan ? "New Scan" : "Start Scan"))}
    </button>
  );

  /* ── empty / loading placeholders ── */
  const emptyDash = {
    analysisNumber: "—", date: todayLabel(), imageUrl: "",
    overallScore: 0, verdict: "Awaiting Image",
    verdictDesc: "Upload a clear face portrait to initialise the AI diagnostic engine.",
    estimatedAge: currentUser?.age ?? "—",
    metrics: { acne: 0, wrinkle: 0, pigmentation: 0, redness: 0, pores: 0, darkCircles: 0 },
    detectedConcerns: [], recommendations: [], aiSummary: "", skinHealthTags: [],
  };

  const dashboardData = activeScan ?? emptyDash;

  /* image displayed: blob during upload → CDN url otherwise */
  const displayImage = (isBusy && previewUrl) ? previewUrl : dashboardData.imageUrl;
  const showImage = !!displayImage;

  /* ring maths */
  const circumference = 276.46;
  const strokeDasharray = `${dashboardData.overallScore * 2.76} ${circumference}`;
  const strokeDashoffset = circumference - (dashboardData.overallScore / 100) * circumference;

  /* user initials */
  const initials = (currentUser?.full_name ?? currentUser?.email ?? "U")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  /* ── initial loading (before any history arrives) ── */
  if ((historyLoading || isLoading) && scanHistory.length === 0 && !previewUrl) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--cream)", background: "var(--navy)" }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
        <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{
            width: "56px", height: "56px", margin: "0 auto 20px",
            borderRadius: "50%",
            border: "3px solid rgba(255,62,127,0.15)",
            borderTopColor: "#FF3E7F",
            animation: "lumSpin 0.9s linear infinite",
          }} />
          <p
            key={loadingMsgIdx}
            style={{
              marginTop: "4px",
              color: "rgba(245,240,235,0.65)",
              fontSize: "14px",
              fontWeight: 500,
              animation: "fadeIn 0.35s ease",
            }}
          >
            {HISTORY_LOADING_MESSAGES[loadingMsgIdx]}
          </p>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "14px" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: i % 2 === 0 ? "#FF3E7F" : "#7B5EA7",
                animation: `lumPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes lumSpin  { to { transform: rotate(360deg); } }
          @keyframes lumPulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
          @keyframes fadeIn   { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  /* ── store-level error ── */
  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--rose)", gap: "15px", background: "var(--navy)" }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
        <h3>Pipeline Error</h3>
        <p style={{ color: "rgba(245,240,235,0.5)", maxWidth: "400px", textAlign: "center" }}>{error}</p>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <ScanButton label="Retry with New Image" />
          <button
            onClick={() => window.location.reload()}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 20px", borderRadius: "12px", background: "rgba(245,240,235,0.07)", color: "var(--cream)", fontWeight: "600", fontSize: "14px", cursor: "pointer", border: "1px solid rgba(245,240,235,0.13)" }}
          >
            🔄 Reload
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="shell" style={{ display: "block", minHeight: "100vh", animation: "dashFadeIn 0.35s ease" }}>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      <main className="main">

        {/* ── PAGE HEADER ── */}
        <div className="pageHeader">
          <div>
            <h1>Facial Analysis</h1>
            {/* Always shows real current date */}
            <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(123,94,167,0.15)", borderRadius: "6px", color: "var(--violet)", fontWeight: 600 }}>
                TODAY
              </span>
              {todayLabel()}
              {activeScan && activeScan._id !== emptyDash._id && (
                <>
                  <span style={{ color: "rgba(245,240,235,0.3)" }}>·</span>
                  <span style={{ color: "rgba(245,240,235,0.5)", fontSize: "12px" }}>
                    Viewing scan from {dashboardData.date}
                  </span>
                </>
              )}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            {currentUser && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(123,94,167,0.12)", border: "1px solid rgba(123,94,167,0.25)",
                borderRadius: "12px", padding: "8px 14px",
              }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF3E7F, #7B5EA7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>{initials}</div>
                <div style={{ lineHeight: "1.3" }}>
                  <div style={{ color: "var(--cream)", fontWeight: 600, fontSize: "13px" }}>
                    {currentUser.full_name ?? "User"}
                  </div>
                  <div style={{ color: "rgba(245,240,235,0.45)", fontSize: "11px" }}>
                    {currentUser.email ?? ""}
                  </div>
                </div>
                {currentUser.is_premium_user && (
                  <span style={{
                    fontSize: "10px", fontWeight: 700, padding: "2px 7px",
                    background: "rgba(255,62,127,0.15)", color: "#FF3E7F",
                    border: "1px solid rgba(255,62,127,0.3)", borderRadius: "6px",
                  }}>PRO</span>
                )}
              </div>
            )}

            <div className="headerRightActions">
              <div className="metaRow">
                <span>Analysis #{dashboardData.analysisNumber}</span>
                <div className="metaSep" />
                <span>{scanHistory.length} scan{scanHistory.length !== 1 ? "s" : ""} total</span>
              </div>
              {activeScan && !isBusy && (
                <span className="statusPill statusCompleted">
                  <span className="statusDot" /> Completed
                </span>
              )}
              {isBusy && (
                <span className="statusPill" style={{ background: "rgba(255,62,127,0.12)", color: "#FF3E7F", border: "1px solid rgba(255,62,127,0.3)" }}>
                  <span className="statusDot" style={{ background: "#FF3E7F", animation: "lumPulse 1s infinite" }} /> Analyzing
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── HISTORY FETCH ERROR (non-blocking) ── */}
        {historyError && !historyLoading && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "12px", padding: "10px 14px", marginBottom: "16px",
            background: "rgba(255,62,127,0.08)", border: "1px solid rgba(255,62,127,0.25)",
            borderRadius: "10px", animation: "fadeIn 0.3s ease",
          }}>
            <span style={{ fontSize: "12px", color: "rgba(245,240,235,0.75)" }}>
              {typeof historyError === "string" && !historyError.includes("HTTP 404")
                ? `⚠️ History fetch error: ${historyError}`
                : "⚠️ No scan history available."
              }
            </span>
            <button
              onClick={() => currentUser?._id && fetchHistory(currentUser._id)}
              style={{
                fontSize: "11px", fontWeight: 700, color: "#FF3E7F",
                background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── ACTION BAR ── */}
        <div className="actionBar">
          <ScanButton />
          <button className="btn btnViolet">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
          <button className="btn btnGhost">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share with Doctor
          </button>
        </div>

        {/* ── HISTORY STRIP ── */}
        <div className="card historyCard">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div className="cardTitle" style={{ marginBottom: 0 }}>Analysis History</div>
            {scanHistory.length > 0 && (
              <span style={{ fontSize: "11px", color: "rgba(245,240,235,0.4)" }}>
                {scanHistory.length} scan{scanHistory.length !== 1 ? "s" : ""} — click to view
              </span>
            )}
          </div>

          <div className="historyStrip">
            {/* Uploading ghost thumb */}
            {isBusy && (
              <div className="historyThumb historyThumbActive" style={{ position: "relative", overflow: "hidden" }}>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Uploading"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5)", borderRadius: "inherit" }}
                  />
                )}
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "4px",
                }}>
                  <span style={{ fontSize: "16px", animation: "lumSpin 1s linear infinite", display: "inline-block" }}>⏳</span>
                  <span style={{ fontSize: "9px", color: "#FF3E7F", fontWeight: 700, letterSpacing: "0.05em" }}>SCANNING</span>
                </div>
              </div>
            )}

            {/* Real scan history thumbnails */}
            {scanHistory.map((scan) => (
              <HistoryThumb
                key={scan._id}
                scan={scan}
                isActive={!isBusy && selectedId === scan._id}
                onClick={() => {
                  if (isBusy) return;
                  LOG("history click →", scan._id);
                  setSelectedId(scan._id);
                }}
              />
            ))}

            {/* Placeholder slots if < 3 scans */}
            {!isBusy && scanHistory.length === 0 && (
              <>
                <div className="historyThumb" style={{ opacity: 0.3 }}><div className="historyImg" style={{ fontSize: "11px" }}>—</div><div className="historyDate">—</div></div>
                <div className="historyThumb" style={{ opacity: 0.2 }}><div className="historyImg" style={{ fontSize: "11px" }}>—</div><div className="historyDate">—</div></div>
              </>
            )}

            {/* Add new scan button */}
            <div
              className="historyThumb historyThumbAdd"
              onClick={isBusy ? undefined : triggerScan}
              style={{ cursor: isBusy ? "not-allowed" : "pointer", opacity: isBusy ? 0.5 : 1 }}
            >
              <div className="addThumbText">+<br />Add</div>
            </div>
          </div>

          {/* Non-latest scan viewing banner */}
          {activeScan && scanHistory.length > 1 && selectedId !== scanHistory[0]?._id && !isBusy && (
            <div style={{
              marginTop: "10px", padding: "8px 12px",
              background: "rgba(255,62,127,0.08)", border: "1px solid rgba(255,62,127,0.2)",
              borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "12px", color: "rgba(245,240,235,0.6)" }}>
                📅 Viewing past scan from <strong style={{ color: "var(--cream)" }}>{dashboardData.date}</strong>
              </span>
              <button
                onClick={() => setSelectedId(scanHistory[0]._id)}
                style={{ fontSize: "11px", color: "#FF3E7F", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
              >
                Back to Latest →
              </button>
            </div>
          )}
        </div>

        {/* ── MAIN ANALYSIS GRID ── */}
        <div className="analysisGrid">

          {/* LEFT — image card or dropzone */}
          {showImage || isBusy ? (
            <div className="card imageCard">
              <div
                className="imageWrapper"
                style={{ cursor: isBusy ? "default" : "pointer", position: "relative" }}
                onDragOver={handleDragOver}
                onDrop={!isBusy ? handleDrop : undefined}
                onClick={!isBusy ? triggerScan : undefined}
              >
                {isBusy && <ScanningOverlay />}
                {!isBusy && <div className="scanOverlay" />}
                {!isBusy && <div className="scanCrosshair" />}

                {displayImage && (
                  <img
                    src={displayImage}
                    alt="Face Scan"
                    onLoad={() => LOG("img onLoad:", displayImage.slice(0, 60))}
                    onError={(e) => ERR("img error:", displayImage.slice(0, 60), e)}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      position: "absolute", inset: 0,
                      filter: isBusy ? "brightness(0.55)" : "none",
                      transition: "filter 0.3s ease",
                    }}
                  />
                )}

                {!isBusy && dashboardData.detectedConcerns.map((box) => (
                  <div
                    key={box.id}
                    className={`concernBox concernBox${box.type?.charAt(0).toUpperCase() + box.type?.slice(1)}`}
                    style={box.styles}
                  >
                    <span className="concernLabel">{box.name}</span>
                    <span className="confidenceBadge">{box.confidence}% conf.</span>
                  </div>
                ))}

                {!isBusy && (
                  <>
                    <div className="cornerMarker cornerTopLeft" />
                    <div className="cornerMarker cornerTopRight" />
                    <div className="cornerMarker cornerBottomLeft" />
                    <div className="cornerMarker cornerBottomRight" />
                    <div className="image-rescan-hint" style={{
                      position: "absolute", inset: 0, display: "flex", alignItems: "center",
                      justifyContent: "center", background: "rgba(10,10,26,0.55)",
                      opacity: 0, transition: "opacity 0.2s",
                      fontSize: "14px", fontWeight: 600, color: "#fff", gap: "8px",
                    }}>
                      📸 Click to rescan
                    </div>
                  </>
                )}
              </div>

              <div className="imageMeta">
                <span>
                  {isBusy
                    ? "⏳ Uploading to ImageKit CDN…"
                    : <><strong>ImageKit CDN</strong> · {dashboardData.date}</>}
                </span>
                {!isBusy && (
                  <span style={{ color: "var(--violet)", cursor: "pointer", fontWeight: "bold" }} onClick={triggerScan}>
                    New Scan ↺
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              className="card imageCard"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerScan}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", border: "2px dashed rgba(245,240,235,0.15)",
                minHeight: "380px", textAlign: "center", padding: "40px",
                cursor: "pointer", background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ fontSize: "54px", marginBottom: "16px" }}>📤</div>
              <h3 style={{ color: "var(--cream)", marginBottom: "8px" }}>Drop or Click to Upload</h3>
              <p style={{ fontSize: "13px", color: "rgba(245,240,235,0.4)", maxWidth: "240px", lineHeight: "1.6", marginBottom: "24px" }}>
                Accepts JPG, PNG, WEBP — front-facing portrait gives the best results.
              </p>
              <ScanButton label="Choose Photo" />
            </div>
          )}

          {/* RIGHT COL */}
          <div className="rightCol">

            {/* Overall Score */}
            <div className="card">
              <div className="cardTitle">Overall Skin Health</div>
              <div className="scoreRingCard">
                <div className="ringWrap">
                  <svg className="ringSvg" width="110" height="110" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="44" fill="none" className="ringTrackCircle" strokeWidth="8" />
                    <circle cx="55" cy="55" r="44" fill="none"
                      className="ringProgressCircle" strokeWidth="8"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FF3E7F" />
                        <stop offset="100%" stopColor="#7B5EA7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="ringCenter">
                    <div className="ringValue">{isBusy ? "—" : dashboardData.overallScore}</div>
                    <div className="ringLabel">/100</div>
                  </div>
                </div>
                <div className="scoreInfo">
                  <h3>{isBusy ? "Analyzing…" : dashboardData.verdict}</h3>
                  <p>{isBusy ? "Results appear here once the pipeline finishes." : (dashboardData.verdictDesc || "Upload a face portrait to initialise analysis.")}</p>
                  <div className="ageChip">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                    </svg>
                    Skin Age Estimate:&nbsp;<strong className="amberText">{isBusy ? "—" : `${dashboardData.estimatedAge} yrs`}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Metrics */}
            <div className="card">
              <div className="cardTitle">AI Metrics</div>
              <div className="metricsGrid">
                {[
                  { key: "acne", label: "Acne Score", accent: "Rose", val: dashboardData.metrics.acne },
                  { key: "wrinkle", label: "Wrinkle Score", accent: "Violet", val: dashboardData.metrics.wrinkle },
                  { key: "pigmentation", label: "Pigmentation", accent: "Amber", val: dashboardData.metrics.pigmentation },
                  { key: "redness", label: "Redness Score", accent: "Red", val: dashboardData.metrics.redness },
                  { key: "pores", label: "Pores Score", accent: "Blue", val: dashboardData.metrics.pores },
                  { key: "darkCircles", label: "Dark Circles", accent: "Green", val: dashboardData.metrics.darkCircles },
                ].map(({ key, label, accent, val }) => (
                  <div key={key} className={`metricTile accent${accent}`}
                    style={{ opacity: isBusy ? 0.3 : 1, transition: "opacity 0.3s" }}>
                    <div className="metricName">{label}</div>
                    <div className={`metricValue text${accent}`}>{val}<span className="metricPercent">%</span></div>
                    <div className="metricBarTrack">
                      <div className={`metricBarFill fill${accent}`} style={{ width: `${val}%` }} />
                    </div>
                    <div className={`metricSeverity text${accent}`}>{severity(val)}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── DETECTED CONCERNS ── */}
        <div className="card">
          <div className="cardTitle">Detected Concerns</div>
          <div className="concernsList">
            {activeScan && !isBusy && dashboardData.detectedConcerns.length > 0 ? (
              dashboardData.detectedConcerns.map((c) => (
                <div key={c.id} className="concernRow">
                  <div className={`concernDot dot${c.type === "acne" ? "Rose" : c.type === "dark_spot" ? "Amber" : c.type === "wrinkle" ? "Violet" : "Red"
                    }`} />
                  <div>
                    <div className="concernName">{c.name}</div>
                    <div className="concernLocation">{c.location || "Location data unavailable"}</div>
                  </div>
                  <div>
                    <div className="confidenceText">{c.confidence}% confidence</div>
                    <div className="confBarTrack"><div className="confBarFill fillRose" style={{ width: `${c.confidence}%` }} /></div>
                  </div>
                  <div className="locationTag">top:{c.styles.top} left:{c.styles.left}</div>
                </div>
              ))
            ) : isBusy ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="concernRow" style={{ opacity: 0.2 }}>
                  <div className="concernDot dotRose" />
                  <div><div className="concernName">Scanning…</div><div className="concernLocation">—</div></div>
                  <div><div className="confidenceText">— %</div><div className="confBarTrack"><div className="confBarFill fillRose" style={{ width: "0%" }} /></div></div>
                  <div className="locationTag">—</div>
                </div>
              ))
            ) : (
              /* placeholder when no scan exists yet */
              [
                { dot: "Rose", name: "Acne (Pustule)", loc: "Cheek region — upper right", conf: 87, tag: "top:22% left:58%" },
                { dot: "Rose", name: "Acne (Comedone)", loc: "Cheek region — upper left", conf: 74, tag: "top:35% left:25%" },
                { dot: "Amber", name: "Dark Spot (Post-acne)", loc: "Chin / lower central", conf: 91, tag: "top:55% left:42%" },
                { dot: "Violet", name: "Wrinkle (Fine line)", loc: "Forehead — left horizontal", conf: 65, tag: "top:18% left:15%" },
                { dot: "Red", name: "Redness (Diffuse)", loc: "Cheek — right, broad area", conf: 79, tag: "top:42% left:60%" },
              ].map((c, i) => (
                <div key={i} className="concernRow" style={{ opacity: 0.3 }}>
                  <div className={`concernDot dot${c.dot}`} />
                  <div><div className="concernName">{c.name}</div><div className="concernLocation">{c.loc}</div></div>
                  <div><div className="confidenceText">{c.conf}% confidence</div><div className="confBarTrack"><div className={`confBarFill fill${c.dot}`} style={{ width: `${c.conf}%` }} /></div></div>
                  <div className="locationTag">{c.tag}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="bottomGrid">

          <div className="card summaryCard">
            <div className="cardTitle">AI Summary</div>
            <p className="summaryText">
              {isBusy
                ? "Running Gemini 2.5 Flash multimodal analysis — summary will appear here shortly…"
                : (dashboardData.aiSummary || "Skin presents with moderate inflammatory acne concentrated along both cheek zones, alongside noticeable post-inflammatory pigmentation at the chin. Pore visibility is elevated, suggesting excess sebum production.")}
            </p>
            <div className="summaryBadgesRow">
              {(dashboardData.skinHealthTags.length > 0
                ? dashboardData.skinHealthTags
                : ["Acne", "Pigmentation", "Redness", "Pores"]
              ).map((tag, i) => (
                <span key={i} className="badge badgeRose" style={{ marginRight: "6px", opacity: isBusy ? 0.3 : 1 }}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">AI Recommendations</div>
            <div className="recommendationsGrid">
              {activeScan && !isBusy && dashboardData.recommendations.length > 0 ? (
                dashboardData.recommendations.map((rec, idx) => (
                  <div key={idx} className="recItem">
                    <div className="recIcon recIconRose">💡</div>
                    <div className="recText"><div className="recTitle">{rec}</div></div>
                  </div>
                ))
              ) : (
                [
                  { icon: "🧴", accent: "Rose", title: "Apply SPF 50+ sunscreen daily", desc: "Prevents further pigmentation from UV exposure" },
                  { icon: "🚫", accent: "Violet", title: "Avoid physical exfoliation", desc: "Reduces redness irritation on reactive zones" },
                  { icon: "💧", accent: "Amber", title: "Use niacinamide serum (5–10%)", desc: "Addresses pores, redness, and pigmentation" },
                  { icon: "🌙", accent: "Rose", title: "Retinol 0.025% at night", desc: "Gentle start for fine lines and cell turnover" },
                  { icon: "🩺", accent: "Violet", title: "Consult dermatologist for redness", desc: "Rosacea screening recommended within 30 days" },
                ].map((r, i) => (
                  <div key={i} className="recItem" style={{ opacity: isBusy ? 0.2 : 0.35 }}>
                    <div className={`recIcon recIcon${r.accent}`}>{r.icon}</div>
                    <div className="recText">
                      <div className="recTitle">{r.title}</div>
                      <div className="recDesc">{r.desc}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      <style>{`
        @keyframes lumSpin  { to { transform: rotate(360deg); } }
        @keyframes lumPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes scanLine {
          0%   { top: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dashFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .imageWrapper:hover .image-rescan-hint { opacity: 1 !important; }
        .historyThumb { transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease; animation: fadeIn 0.25s ease; }
        .historyThumb:hover { transform: translateY(-2px); }
        .historyThumb img { transition: opacity 0.25s ease, filter 0.2s ease; }
        .card { animation: fadeIn 0.3s ease; }
      `}</style>
    </div>
  );
}