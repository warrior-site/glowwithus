"use client"


import React, { useState } from "react";
import { useBannerStore } from "@/stores/useBannerStore"; // Adjust this path to your project layout

export default function AddBannerForm() {
  const { createBanner, isSaving, error: bannerError } = useBannerStore();

  // Initial banner state matching Mongoose fields perfectly
  const [formData, setFormData] = useState({
    user_id: "", // Leave blank if it's a global banner
    title: "",
    message: "",
    action_type: "navigate",
    action_payload: {
      route: "",
      modal_name: "",
    },
    banner_type: "info",
    priority: 1,
    is_active: true,
    expires_at: "",
    trigger_condition: "new_user",
  });

  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  // Standard flat-field handling
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Action Payload specific field nested handling
  const handlePayloadChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      action_payload: {
        ...prev.action_payload,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "" });

    // Sanitize payload data matching model properties
    const payload = {
      ...formData,
      user_id: formData.user_id.trim() === "" ? undefined : formData.user_id,
      priority: Number(formData.priority),
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      action_payload: {
        route: formData.action_type === "navigate" ? formData.action_payload.route : undefined,
        modal_name: formData.action_type === "open_modal" ? formData.action_payload.modal_name : undefined,
      },
    };

    const response = await createBanner(payload);
    if (response.success) {
      setSubmitStatus({ type: "success", message: "⚡ Banner campaign injected into database successfully!" });
      // Reset form if required
    } else {
      setSubmitStatus({ type: "error", message: response.error || "Execution failed." });
    }
  };

  return (
    <div style={styles.container}>
      {/* Immersive Theme Glowing Background Orbs */}
      <div style={styles.glowOrb1}></div>
      <div style={styles.glowOrb2}></div>

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <h1 style={styles.heading}>
          GENERATE <span style={{ color: "#FF3E7F" }}>BANNER ENGINE</span>
        </h1>
        <p style={styles.subheading}>Publish real-time personalized target notifications across UI entryways.</p>

        {/* Messaging Notifications Banner */}
        {(submitStatus.message || bannerError) && (
          <div style={submitStatus.type === "success" ? styles.successBanner : styles.errorBanner}>
            {submitStatus.message || bannerError}
          </div>
        )}

        {/* SECTION 1: CORE CONTENT & USER DISPATCH */}
        <h2 style={styles.sectionTitle}>01. Core Notification Meta</h2>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Target User ID (Optional - leave blank if global)</label>
          <input type="text" name="user_id" value={formData.user_id} onChange={handleChange} style={styles.input} placeholder="Mongoose MongoDB user Object_ID" />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Banner Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required style={styles.input} placeholder="e.g. Skin Analysis Waiting" />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Banner Message Summary *</label>
          <textarea name="message" value={formData.message} onChange={handleChange} required rows="2" style={styles.textarea} placeholder="e.g. Complete your scan to calculate daily routine optimization targets." />
        </div>

        <hr style={styles.divider} />

        {/* SECTION 2: INTERACTION LOGIC ENUMS */}
        <h2 style={styles.sectionTitle}>02. Click Action Trigger Sequence</h2>
        <div style={styles.grid2Col}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Action Type *</label>
            <select name="action_type" value={formData.action_type} onChange={handleChange} style={styles.select}>
              {["navigate", "open_modal", "trigger_analysis", "start_routine", "log_today"].map((act) => (
                <option key={act} value={act}>{act.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Conditional Sub-Payload Inputs depending on Action Choice */}
          <div style={styles.inputGroup}>
            {formData.action_type === "navigate" && (
              <>
                <label style={styles.label}>Destination Route</label>
                <input type="text" name="route" value={formData.action_payload.route} onChange={handlePayloadChange} required style={styles.input} placeholder="e.g. /analysis" />
              </>
            )}
            {formData.action_type === "open_modal" && (
              <>
                <label style={styles.label}>Target Modal Identifier</label>
                <input type="text" name="modal_name" value={formData.action_payload.modal_name} onChange={handlePayloadChange} required style={styles.input} placeholder="e.g. upload_face" />
              </>
            )}
            {!["navigate", "open_modal"].includes(formData.action_type) && (
              <>
                <label style={styles.label}>Payload State</label>
                <input type="text" disabled style={{ ...styles.input, opacity: 0.5 }} value="Self-contained function trigger" />
              </>
            )}
          </div>
        </div>

        <hr style={styles.divider} />

        {/* SECTION 3: VISUAL SCHEME & CONDITION CONTROLS */}
        <h2 style={styles.sectionTitle}>03. Context Delivery & Taxonomy</h2>
        <div style={styles.grid3Col}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Theme Palette Accent</label>
            <select name="banner_type" value={formData.banner_type} onChange={handleChange} style={styles.select}>
              {["info", "warning", "success", "premium"].map((type) => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Trigger Condition Rule</label>
            <select name="trigger_condition" value={formData.trigger_condition} onChange={handleChange} style={styles.select}>
              {["no_analysis", "no_routine", "low_streak", "inactive_user", "new_user"].map((cond) => (
                <option key={cond} value={cond}>{cond.replace("_", " ").toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Priority Engine Score</label>
            <input type="number" name="priority" min="1" max="100" value={formData.priority} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        <hr style={styles.divider} />

        {/* SECTION 4: LIFECYCLE MANAGEMENT */}
        <h2 style={styles.sectionTitle}>04. Lifecycle & Scheduling</h2>
        <div style={styles.grid2Col}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Expiration Date (UTC)</label>
            <input type="datetime-local" name="expires_at" value={formData.expires_at} onChange={handleChange} style={styles.input} />
          </div>

          <div style={{ ...styles.inputGroup, justifyContent: "center" }}>
            <label style={styles.switchLabel}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={styles.checkboxHidden} />
              <span style={formData.is_active ? styles.switchActive : styles.switchInactive}>
                {formData.is_active ? "⚡ CAMPAIGN ACTIVE" : "💤 CAMPAIGN PAUSED"}
              </span>
            </label>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div style={styles.previewContainer}>
          <div style={{ ...styles.previewTag, backgroundColor: styles.bannerColors[formData.banner_type] }}>
            LIVE SYSTEM PREVIEW • {formData.banner_type.toUpperCase()}
          </div>
          <h4 style={styles.previewTitle}>{formData.title || "Untitled Campaign"}</h4>
          <p style={styles.previewMessage}>{formData.message || "Write text summary logic up above..."}</p>
        </div>

        {/* ACTION SUBMIT BUTTON */}
        <button type="submit" disabled={isSaving} style={isSaving ? styles.submitBtnDisabled : styles.submitBtn}>
          {isSaving ? "BROADCASTING PACKETS..." : "INITIALIZE BANNER DEPLOYMENT"}
        </button>
      </form>
    </div>
  );
}

// Global UI Layout Styles - Synced exactly to your customized neon skincare parameters
const styles = {
  container: {
    backgroundColor: "#0A0A1A", // Deep Navy
    color: "#F5F0EB", // Off-white
    padding: "40px 20px",
    fontFamily: 'system-ui, -apple-system, sans-serif',
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
  },
  glowOrb1: {
    position: "absolute",
    width: "450px",
    height: "450px",
    background: "radial-gradient(circle, rgba(255,62,127,0.12) 0%, rgba(0,0,0,0) 70%)",
    top: "10%",
    right: "-100px",
    pointerEvents: "none",
  },
  glowOrb2: {
    position: "absolute",
    width: "450px",
    height: "450px",
    background: "radial-gradient(circle, rgba(123,94,167,0.15) 0%, rgba(0,0,0,0) 70%)",
    bottom: "-50px",
    left: "-50px",
    pointerEvents: "none",
  },
  formCard: {
    background: "rgba(245, 240, 235, 0.03)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(245, 240, 235, 0.08)",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "800px",
    width: "100%",
    boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
    zIndex: 2,
  },
  heading: {
    fontSize: "26px",
    fontWeight: "800",
    letterSpacing: "2.5px",
    margin: "0 0 6px 0",
  },
  subheading: {
    color: "#7B5EA7", // Muted Violet
    fontSize: "13px",
    margin: "0 0 32px 0",
  },
  sectionTitle: {
    fontSize: "13px",
    color: "#E8A838", // Warm Amber
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: "16px",
  },
  divider: {
    border: "0",
    height: "1px",
    background: "linear-gradient(to right, rgba(123,94,167,0.25), transparent)",
    margin: "24px 0",
  },
  grid2Col: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "12px",
  },
  grid3Col: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
    marginBottom: "12px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
  },
  label: {
    fontSize: "12px",
    textTransform: "uppercase",
    color: "#F5F0EB",
    marginBottom: "8px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  input: {
    background: "rgba(10, 10, 26, 0.7)",
    border: "1px solid rgba(245, 240, 235, 0.15)",
    borderRadius: "8px",
    padding: "12px",
    color: "#F5F0EB",
    fontSize: "14px",
    outline: "none",
  },
  textarea: {
    background: "rgba(10, 10, 26, 0.7)",
    border: "1px solid rgba(245, 240, 235, 0.15)",
    borderRadius: "8px",
    padding: "12px",
    color: "#F5F0EB",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  select: {
    background: "#0A0A1A",
    border: "1px solid rgba(245, 240, 235, 0.15)",
    borderRadius: "8px",
    padding: "12px",
    color: "#F5F0EB",
    fontSize: "14px",
    outline: "none",
  },
  switchLabel: {
    cursor: "pointer",
    marginTop: "16px",
    alignSelf: "flex-start",
  },
  checkboxHidden: {
    display: "none",
  },
  switchInactive: {
    background: "rgba(255, 62, 127, 0.05)",
    border: "1px solid rgba(255, 62, 127, 0.2)",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "#FF3E7F", // Acid Rose
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "1px",
  },
  switchActive: {
    background: "rgba(40, 167, 69, 0.15)",
    border: "1px solid #28a745",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "#28a745",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    boxShadow: "0 0 12px rgba(40, 167, 69, 0.2)",
  },
  previewContainer: {
    background: "rgba(10, 10, 26, 0.8)",
    border: "1px dashed rgba(123, 94, 167, 0.4)",
    borderRadius: "10px",
    padding: "20px",
    margin: "24px 0",
    position: "relative",
  },
  previewTag: {
    position: "absolute",
    top: "-10px",
    right: "15px",
    fontSize: "9px",
    fontWeight: "700",
    color: "#0A0A1A",
    padding: "2px 8px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
  },
  previewTitle: {
    margin: "0 0 4px 0",
    fontSize: "15px",
    fontWeight: "700",
    color: "#F5F0EB",
  },
  previewMessage: {
    margin: 0,
    fontSize: "13px",
    color: "rgba(245, 240, 235, 0.7)",
  },
  bannerColors: {
    info: "#7B5EA7",
    warning: "#E8A838",
    success: "#28a745",
    premium: "#FF3E7F",
  },
  submitBtn: {
    background: "linear-gradient(90deg, #7B5EA7 0%, #FF3E7F 100%)",
    color: "#F5F0EB",
    border: "none",
    borderRadius: "8px",
    padding: "16px",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "1px",
    width: "100%",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(123, 94, 167, 0.3)",
  },
  submitBtnDisabled: {
    background: "#1A1A2E",
    color: "#444",
    border: "none",
    borderRadius: "8px",
    padding: "16px",
    width: "100%",
  },
  successBanner: {
    background: "rgba(40, 167, 69, 0.15)",
    border: "1px solid #28a745",
    color: "#28a745",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "13px",
  },
  errorBanner: {
    background: "rgba(255, 62, 127, 0.15)",
    border: "1px solid #FF3E7F",
    color: "#FF3E7F",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "13px",
  },
};