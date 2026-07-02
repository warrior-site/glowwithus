"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useFacialAnalysisStore } from "@/stores/useFacialAnalysisStore";
import "@/app/styles/facial1.css";

/* ── debug prefix ── */
const LOG = (...a) => console.log("[DermAI]", ...a);
const ERR = (...a) => console.error("[DermAI]", ...a);

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
      {/* Sweeping scan line */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, #FF3E7F 40%, #7B5EA7 60%, transparent)",
          boxShadow: "0 0 12px 4px rgba(255,62,127,0.5)",
          animation: "scanLine 2s ease-in-out infinite",
        }} />
      </div>

      {/* Glowing corners */}
      <div className="cornerMarker cornerTopLeft"     style={{ borderColor: "#FF3E7F", boxShadow: "0 0 8px #FF3E7F" }} />
      <div className="cornerMarker cornerTopRight"    style={{ borderColor: "#FF3E7F", boxShadow: "0 0 8px #FF3E7F" }} />
      <div className="cornerMarker cornerBottomLeft"  style={{ borderColor: "#7B5EA7", boxShadow: "0 0 8px #7B5EA7" }} />
      <div className="cornerMarker cornerBottomRight" style={{ borderColor: "#7B5EA7", boxShadow: "0 0 8px #7B5EA7" }} />

      {/* Status badge */}
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

      {/* Pulsing dots */}
      <div style={{ display: "flex", gap: "6px" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: i % 2 === 0 ? "#FF3E7F" : "#7B5EA7",
            animation: `lumPulse 1.4s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>

      {/* Pipeline steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center" }}>
        {[
          "Uploading to ImageKit CDN",
          "Running Gemini vision pipeline",
          "Saving to database",
        ].map((label, i) => (
          <div key={i} style={{
            fontSize: "11px", color: "rgba(245,240,235,0.4)",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <span>○</span>{label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function DermAI() {
  const { currentUser } = useUserStore();
  const fileInputRef    = useRef(null);
  

  /* previewUrl: local blob URL shown instantly before the CDN URL is ready */
  const [previewUrl,  setPreviewUrl]  = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const {
    analysisData: rawScan,
    isLoading,
    error,
    fetchAnalysisData,
    uploadAndAnalyzeScan,
  } = useFacialAnalysisStore();

  /* ── fetch on mount ── */
  useEffect(() => {
    LOG("mount — currentUser:", currentUser?._id ?? "none");
    if (currentUser?._id) {
      fetchAnalysisData(currentUser._id); 
    }
     if (!isLoading && currentUser?._id && !rawScan) {
    setShowBanner(true);
  } else {
    setShowBanner(false);
  }

  }, [currentUser?._id, fetchAnalysisData]);
 

  /* ── FIX: clear previewUrl only after rawScan has a CDN image_url ──
     This prevents the blank flash that happened when previewUrl was cleared
     inside the async callback before Zustand re-rendered with the new rawScan. */
  useEffect(() => {
    if (rawScan?.image_url && previewUrl) {
      LOG("rawScan.image_url ready — releasing local blob preview:", rawScan.image_url);
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [rawScan?.image_url, previewUrl]);

  /* ── file processing ── */
  const processFile = (file) => {
    if (!file) { ERR("processFile: no file"); return; }
    LOG("processFile →", file.name, `${(file.size / 1024 / 1024).toFixed(2)}MB`, file.type);

    /* Instant local preview — no waiting for upload */
    const blob = URL.createObjectURL(file);
    LOG("blob URL created:", blob);
    setPreviewUrl(blob);
    setIsUploading(true);

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result; // includes data:image/...;base64, prefix
      LOG("FileReader.onload — base64 length:", base64?.length, "starts with:", base64?.slice(0, 40));

      if (!currentUser?._id) {
        ERR("No currentUser._id — cannot call uploadAndAnalyzeScan");
        setIsUploading(false);
        return;
      }

      const result = await uploadAndAnalyzeScan(currentUser._id, base64);
      LOG("uploadAndAnalyzeScan returned:", result?._id ?? "null");
      setIsUploading(false);
      /* NOTE: previewUrl is NOT cleared here.
         The useEffect above clears it once rawScan.image_url is populated. */
    };

    reader.onerror = (e) => {
      ERR("FileReader error:", e);
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    LOG("handleFileChange fired — files:", e.target.files?.length);
    processFile(e.target.files?.[0]);
    /* Reset input so the same file can be re-selected */
    e.target.value = "";
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop     = (e) => {
    e.preventDefault();
    LOG("handleDrop — files:", e.dataTransfer.files?.length);
    processFile(e.dataTransfer.files?.[0]);
  };

  const triggerScan = () => {
    LOG("triggerScan");
    fileInputRef.current?.click();
  };

  const isBusy = isUploading || isLoading;

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
            <circle cx="12" cy="8" r="5"/>
            <path d="M3 21c0-4.418 4.03-8 9-8s9 3.582 9 8"/>
          </svg>
        )}
      </span>
      {isBusy ? "Analyzing..." : (label || (rawScan ? "New Scan" : "Start Scan"))}
    </button>
  );

  /* ── loading state (initial fetch, no preview yet) ── */
  if (isLoading && !rawScan && !previewUrl) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--cream)", background: "var(--navy)" }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "32px", animation: "lumPulse 1.5s ease-in-out infinite" }}>⏳</p>
          <p style={{ marginTop: "12px", color: "rgba(245,240,235,0.5)" }}>Loading your scan history...</p>
        </div>
      </div>
    );
  }

  /* ── error state ── */
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

  /* ── data normalisation ── */
  const hasHistory = !!rawScan;

  const dashboardData = hasHistory ? {
    analysisNumber:   rawScan._id?.slice(-4).toUpperCase() || "0001",
    scanTime:         "2.1s",
    date:             rawScan.createdAt
                        ? new Date(rawScan.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                        : "Recent",
    imageUrl:         rawScan.image_url || "",
    overallScore:     rawScan.overall_health_score || 70,
    verdict:          rawScan.overall_health_score > 75 ? "Excellent Condition" : "Good Condition",
    verdictDesc:      rawScan.ai_summary || "",
    estimatedAge:     rawScan.ai_metrics?.skin_age_estimate || currentUser?.age || 25,
    metrics: {
      acne:         rawScan.ai_metrics?.acne_score          || 0,
      wrinkle:      rawScan.ai_metrics?.wrinkle_score       || 0,
      pigmentation: rawScan.ai_metrics?.pigmentation_score  || 0,
      redness:      rawScan.ai_metrics?.redness_score       || 0,
      pores:        rawScan.ai_metrics?.pores_score         || 0,
      darkCircles:  rawScan.ai_metrics?.dark_circles_score  || 0,
    },
    detectedConcerns: (rawScan.detected_concerns || []).map((c, idx) => {
      const top    = c.location_box?.top    || 0;
      const left   = c.location_box?.left   || 0;
      const width  = (c.location_box?.right  || 0) - left;
      const height = (c.location_box?.bottom || 0) - top;
      return {
        id:         c._id || idx,
        type:       c.concern_type,
        name:       c.concern_type?.toUpperCase().replace("_", " ") || "UNKNOWN",
        confidence: Math.round((c.confidence || 0) * 100),
        location:   c.concern_location || "",
        styles:     { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` },
      };
    }),
    recommendations: rawScan.ai_recommendations || [],
    aiSummary:       rawScan.ai_summary || "",
    skinHealthTags:  rawScan.detected_concerns?.map((c) => c.concern_type) || [],
  } : {
    analysisNumber: "NONE", scanTime: "N/A",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    imageUrl: "", overallScore: 0, verdict: "Awaiting Image",
    verdictDesc: "Upload a clear face portrait to initialise the AI diagnostic engine.",
    estimatedAge: currentUser?.age || "--",
    metrics: { acne: 0, wrinkle: 0, pigmentation: 0, redness: 0, pores: 0, darkCircles: 0 },
    detectedConcerns: [], recommendations: [], aiSummary: "", skinHealthTags: [],
  };

  /* image display priority: local blob → CDN url */
  const displayImage = previewUrl || dashboardData.imageUrl;
  const showImage    = !!displayImage;

  const circumference    = 276.46;
  const strokeDasharray  = `${dashboardData.overallScore * 2.76} ${circumference}`;
  const strokeDashoffset = circumference - (dashboardData.overallScore / 100) * circumference;
  const severity         = (v) => v >= 60 ? "High" : v >= 30 ? "Moderate" : "Mild";

  /* ── user initials ── */
  const initials = (currentUser?.full_name || currentUser?.email || "U")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="shell" style={{ display: "block", minHeight: "100vh" }}>
      {showBanner && (
              <Banner
                banner={{
                  message:
                    "Do Profile Analysis so our system understands your skin better",
                  action_type: "navigate",
                  action_payload: { route: "/facial-analysis" },
                }}
              />
            )}

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
            <p>AI-powered skin assessment — {dashboardData.date}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>

            {/* User chip */}
            {currentUser && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(123,94,167,0.12)",
                border: "1px solid rgba(123,94,167,0.25)",
                borderRadius: "12px", padding: "8px 14px",
              }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF3E7F, #7B5EA7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>{initials}</div>
                <div style={{ lineHeight: "1.3" }}>
                  {/* full_name: User.full_name */}
                  <div style={{ color: "var(--cream)", fontWeight: 600, fontSize: "13px" }}>
                    {currentUser.full_name || "User"}
                  </div>
                  {/* email: User.email */}
                  <div style={{ color: "rgba(245,240,235,0.45)", fontSize: "11px" }}>
                    {currentUser.email || ""}
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
                <span>{dashboardData.scanTime}</span>
              </div>
              {hasHistory && !isBusy && (
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

        {/* ── ACTION BAR ── */}
        <div className="actionBar">
          <ScanButton />
          <button className="btn btnViolet">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Report
          </button>
          <button className="btn btnGhost">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Share with Doctor
          </button>
        </div>

        {/* ── HISTORY STRIP ── */}
        <div className="card historyCard">
          <div className="cardTitle">Analysis History</div>
          <div className="historyStrip">
            {hasHistory && (
              <div className="historyThumb historyThumbActive">
                <div className="historyImg">Today</div>
                <div className="historyDate">
                  {rawScan.createdAt
                    ? new Date(rawScan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "Latest"}
                </div>
              </div>
            )}
            <div className="historyThumb"><div className="historyImg">–3d</div><div className="historyDate">–</div></div>
            <div className="historyThumb"><div className="historyImg">–1w</div><div className="historyDate">–</div></div>
            <div className="historyThumb"><div className="historyImg">–2w</div><div className="historyDate">–</div></div>
            <div className="historyThumb historyThumbAdd" onClick={triggerScan} style={{ cursor: "pointer" }}>
              <div className="addThumbText">+<br/>Add</div>
            </div>
          </div>
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
                {/* Scan animation overlay */}
                {isBusy && <ScanningOverlay />}

                {/* Static chrome */}
                {!isBusy && <div className="scanOverlay" />}
                {!isBusy && <div className="scanCrosshair" />}

                {/* Image */}
                {displayImage && (
                  <img
                    src={displayImage}
                    alt="Face Scan"
                    onLoad={() => LOG("img onLoad — src:", displayImage.slice(0, 60))}
                    onError={(e) => ERR("img onError — src:", displayImage.slice(0, 60), e)}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      position: "absolute", inset: 0,
                      filter: isBusy ? "brightness(0.55)" : "none",
                      transition: "filter 0.3s ease",
                    }}
                  />
                )}

                {/* Bounding boxes (post-analysis only) */}
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
                    ? "⏳ Uploading to ImageKit CDN..."
                    : <>Stored at <strong>ImageKit CDN</strong></>}
                </span>
                {!isBusy && (
                  <span style={{ color: "var(--violet)", cursor: "pointer", fontWeight: "bold" }} onClick={triggerScan}>
                    Change Image ↺
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Dropzone */
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
                    <circle cx="55" cy="55" r="44" fill="none" className="ringTrackCircle" strokeWidth="8"/>
                    <circle cx="55" cy="55" r="44" fill="none"
                      className="ringProgressCircle" strokeWidth="8"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FF3E7F"/>
                        <stop offset="100%" stopColor="#7B5EA7"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="ringCenter">
                    <div className="ringValue">{isBusy ? "—" : dashboardData.overallScore}</div>
                    <div className="ringLabel">/100</div>
                  </div>
                </div>
                <div className="scoreInfo">
                  <h3>{isBusy ? "Analyzing..." : dashboardData.verdict}</h3>
                  <p>{isBusy ? "Results appear here once the pipeline finishes." : (dashboardData.verdictDesc || "Upload a face portrait to initialise analysis.")}</p>
                  <div className="ageChip">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                    </svg>
                    Skin Age Estimate: <strong className="amberText">{isBusy ? "—" : `${dashboardData.estimatedAge} yrs`}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Metrics */}
            <div className="card">
              <div className="cardTitle">AI Metrics</div>
              <div className="metricsGrid">
                {[
                  { key: "acne",         label: "Acne Score",    accent: "Rose",   val: dashboardData.metrics.acne },
                  { key: "wrinkle",      label: "Wrinkle Score", accent: "Violet", val: dashboardData.metrics.wrinkle },
                  { key: "pigmentation", label: "Pigmentation",  accent: "Amber",  val: dashboardData.metrics.pigmentation },
                  { key: "redness",      label: "Redness Score", accent: "Red",    val: dashboardData.metrics.redness },
                  { key: "pores",        label: "Pores Score",   accent: "Blue",   val: dashboardData.metrics.pores },
                  { key: "darkCircles",  label: "Dark Circles",  accent: "Green",  val: dashboardData.metrics.darkCircles },
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
            {hasHistory && !isBusy && dashboardData.detectedConcerns.length > 0 ? (
              dashboardData.detectedConcerns.map((c) => (
                <div key={c.id} className="concernRow">
                  <div className={`concernDot dot${c.type === "acne" ? "Rose" : c.type === "dark_spot" ? "Amber" : c.type === "wrinkle" ? "Violet" : "Red"}`} />
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
                  <div><div className="concernName">Scanning...</div><div className="concernLocation">—</div></div>
                  <div><div className="confidenceText">— %</div><div className="confBarTrack"><div className="confBarFill fillRose" style={{ width: "0%" }} /></div></div>
                  <div className="locationTag">—</div>
                </div>
              ))
            ) : (
              [
                { dot: "Rose",   name: "Acne (Pustule)",        loc: "Cheek region — upper right", conf: 87, tag: "top:22% left:58%" },
                { dot: "Rose",   name: "Acne (Comedone)",       loc: "Cheek region — upper left",  conf: 74, tag: "top:35% left:25%" },
                { dot: "Amber",  name: "Dark Spot (Post-acne)", loc: "Chin / lower central",       conf: 91, tag: "top:55% left:42%" },
                { dot: "Violet", name: "Wrinkle (Fine line)",   loc: "Forehead — left horizontal", conf: 65, tag: "top:18% left:15%" },
                { dot: "Red",    name: "Redness (Diffuse)",     loc: "Cheek — right, broad area",  conf: 79, tag: "top:42% left:60%" },
              ].map((c, i) => (
                <div key={i} className="concernRow" style={{ opacity: 0.35 }}>
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
                ? "Running Gemini 2.5 Flash multimodal analysis — summary will appear here shortly..."
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
              {hasHistory && !isBusy && dashboardData.recommendations.length > 0 ? (
                dashboardData.recommendations.map((rec, idx) => (
                  <div key={idx} className="recItem">
                    <div className="recIcon recIconRose">💡</div>
                    <div className="recText"><div className="recTitle">{rec}</div></div>
                  </div>
                ))
              ) : (
                [
                  { icon: "🧴", accent: "Rose",   title: "Apply SPF 50+ sunscreen daily",   desc: "Prevents further pigmentation from UV exposure" },
                  { icon: "🚫", accent: "Violet", title: "Avoid physical exfoliation",        desc: "Reduces redness irritation on reactive zones" },
                  { icon: "💧", accent: "Amber",  title: "Use niacinamide serum (5–10%)",     desc: "Addresses pores, redness, and pigmentation" },
                  { icon: "🌙", accent: "Rose",   title: "Retinol 0.025% at night",           desc: "Gentle start for fine lines and cell turnover" },
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
        .imageWrapper:hover .image-rescan-hint { opacity: 1 !important; }
      `}</style>
    </div>
  );
}