"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredientsStore } from "@/stores/useIngredientsStore"; // Adjust path if necessary

const THEME = {
  navy: "#0A0A1A",
  offWhite: "#F5F0EB",
  acidRose: "#FF3E7F",
  violet: "#7B5EA7",
  amber: "#E8A838",
};

export default function AddIngredientForm() {
  const addIngredient = useIngredientsStore((state) => state.addIngredient);
  const isStoreLoading = useIngredientsStore((state) => state.isLoading);
  const storeError = useIngredientsStore((state) => state.error);

  // Success Notification State
  const [successMessage, setSuccessMessage] = useState("");

  // Raw array helpers for string collection splits
  const [rawAliases, setRawAliases] = useState("");
  const [rawBenefits, setRawBenefits] = useState("");
  const [rawConcerns, setRawConcerns] = useState("");
  const [rawResearchLinks, setRawResearchLinks] = useState(""); // Added field

  // Base schema form matching Mongoose Document Properties[cite: 3]
  const [formData, setFormData] = useState({
    name: "",
    comedogenicity: 0,
    irritancy: 0,
    safetyFlag: "null", // mapping string "null" for standard HTML selects
    note: "",
    category: "other",
    pregnancySafe: true,
    description: "",
    skinCompatibility: {
      acne: { safe: true, note: "" },
      oily: { safe: true, note: "" },
      dry: { safe: true, note: "" },
      sensitive: { safe: true, note: "" },
      combination: { safe: true, note: "" },
      fungalAcne: { safe: true, note: "" },
      pigmentation: { safe: true, note: "" },
      rosacea: { safe: true, note: "" },
    },
  });

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSkinChange = (concern, field, val) => {
    setFormData((prev) => ({
      ...prev,
      skinCompatibility: {
        ...prev.skinCompatibility,
        [concern]: { ...prev.skinCompatibility[concern], [field]: val },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Sanitize string arrays from user text inputs
    const cleanArray = (str) =>
      str.split(",").map((s) => s.trim()).filter(Boolean);

    const payload = {
      ...formData,
      safetyFlag: formData.safetyFlag === "null" ? null : formData.safetyFlag,
      aliases: cleanArray(rawAliases),
      benefits: cleanArray(rawBenefits),
      concerns: cleanArray(rawConcerns),
      researchLinks: cleanArray(rawResearchLinks), // Added payload map[cite: 3]
    };

    const result = await addIngredient(payload);

    if (result?.success) {
      setSuccessMessage(`✓ Successfully added ${payload.name.toUpperCase()} to database!`);
      // Reset Form State
      setRawAliases("");
      setRawBenefits("");
      setRawConcerns("");
      setRawResearchLinks("");
      setFormData({
        name: "",
        comedogenicity: 0,
        irritancy: 0,
        safetyFlag: "null",
        note: "",
        category: "other",
        pregnancySafe: true,
        description: "",
        skinCompatibility: {
          acne: { safe: true, note: "" },
          oily: { safe: true, note: "" },
          dry: { safe: true, note: "" },
          sensitive: { safe: true, note: "" },
          combination: { safe: true, note: "" },
          fungalAcne: { safe: true, note: "" },
          pigmentation: { safe: true, note: "" },
          rosacea: { safe: true, note: "" },
        },
      });
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  // Base Styling configs for consistency
  const inputStyle = {
    width: "100%",
    background: "rgba(245,240,235,0.04)",
    border: "1px solid rgba(245,240,235,0.10)",
    borderRadius: 8,
    padding: "8px 12px",
    color: THEME.offWhite,
    fontSize: 11,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: 9,
    opacity: 0.4,
    letterSpacing: "0.1em",
    marginBottom: 4,
    display: "block",
    fontWeight: 600,
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 20, width: "100%" }}>

        <div style={{
      background: "rgba(10,10,26,0.82)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(245,240,235,0.10)",
      borderRadius: 16,
      padding: "clamp(16px, 4vw, 24px)",
      width: "100%",
      maxWidth: 800,
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      color: THEME.offWhite,
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow asset */}
      <div style={{
        position: "absolute", bottom: -80, left: -80, width: 280, height: 280,
        background: `radial-gradient(circle, ${THEME.violet}0D 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Header section */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ fontSize: 20 }}>🧪</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>INGREDIENT REGISTRY CONSOLE</div>
          <div style={{ fontSize: 9, opacity: 0.4, letterSpacing: "0.1em" }}>DATABASE SEEDER · COMPATIBILITY PROFILER · INCI SCHEMA ENGINE</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Fully Responsive Two-Column Grid Breakdown */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: 16, 
          marginBottom: 16 
        }}>
          
          {/* Left Main Data Pillar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>INGREDIENT NAME (REQUIRED)</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. HYALURONIC ACID"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = THEME.violet)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(245,240,235,0.10)")}
              />
            </div>

            <div>
              <label style={labelStyle}>ALIASES / ALTERNATIVE NAMES (COMMA SEPARATED)</label>
              <input
                type="text"
                value={rawAliases}
                onChange={(e) => setRawAliases(e.target.value)}
                placeholder="e.g. SODIUM HYALURONATE, HA"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={labelStyle}>COMEDOGENICITY (0-5)</label>
                <select
                  value={formData.comedogenicity}
                  onChange={(e) => handleInputChange("comedogenicity", Number(e.target.value))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n} style={{ background: THEME.navy }}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>IRRITANCY (0-5)</label>
                <select
                  value={formData.irritancy}
                  onChange={(e) => handleInputChange("irritancy", Number(e.target.value))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n} style={{ background: THEME.navy }}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={labelStyle}>SAFETY FLAG</label>
                <select
                  value={formData.safetyFlag}
                  onChange={(e) => handleInputChange("safetyFlag", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", color: formData.safetyFlag === "danger" ? THEME.acidRose : formData.safetyFlag === "warning" ? THEME.amber : THEME.offWhite }}
                >
                  <option value="null" style={{ background: THEME.navy, color: THEME.offWhite }}>NONE (SAFE)</option>
                  <option value="info" style={{ background: THEME.navy, color: THEME.violet }}>◉ INFO NOTE</option>
                  <option value="warning" style={{ background: THEME.navy, color: THEME.amber }}>◈ WARNING (MOD)</option>
                  <option value="danger" style={{ background: THEME.navy, color: THEME.acidRose }}>⚠ DANGER (HIGH)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>CATEGORY FUNCTION</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {["humectant", "emollient", "occlusive", "active", "surfactant", "preservative", "fragrance", "solvent", "uv_filter", "other"].map((cat) => (
                    <option key={cat} value={cat} style={{ background: THEME.navy }}>{cat.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>PREGNANCY COMPATIBILITY</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { val: true, label: "✓ PREGNANCY SAFE", color: THEME.violet },
                  { val: false, label: "⚠ UNSAFE / AVOID", color: THEME.acidRose },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleInputChange("pregnancySafe", option.val)}
                    style={{
                      flex: 1,
                      background: formData.pregnancySafe === option.val ? `${option.color}22` : "transparent",
                      border: `1px solid ${formData.pregnancySafe === option.val ? option.color : "rgba(245,240,235,0.08)"}`,
                      borderRadius: 6,
                      padding: "6px",
                      fontSize: 9,
                      fontWeight: 600,
                      color: formData.pregnancySafe === option.val ? THEME.offWhite : `${THEME.offWhite}44`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Text Fields Pillar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>AUDIT NOTE / BANNER MSG</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                placeholder="Disrupts skin barrier; Photosensitizing..."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>DESCRIPTION / SUMMARYContext</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Provide dynamic profile context..."
                rows={3}
                style={{ ...inputStyle, resize: "none", height: 60 }}
              />
            </div>

            <div>
              <label style={labelStyle}>BENEFITS (COMMA SEPARATED)</label>
              <input
                type="text"
                value={rawBenefits}
                onChange={(e) => setRawBenefits(e.target.value)}
                placeholder="hydration, barrier-repair, brightening"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>CONCERNS (COMMA SEPARATED)</label>
              <input
                type="text"
                value={rawConcerns}
                onChange={(e) => setRawConcerns(e.target.value)}
                placeholder="clogging, contact-dermatitis, purging"
                style={inputStyle}
              />
            </div>
            
            {/* Added Research Links Field[cite: 3] */}
            <div>
              <label style={labelStyle}>RESEARCH LINKS / STUDY URLS (COMMA SEPARATED)</label>
              <input
                type="text"
                value={rawResearchLinks}
                onChange={(e) => setRawResearchLinks(e.target.value)}
                placeholder="https://ncbi.nlm.nih.gov/..., https://pubchem..."
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Skin Concern Matrix Area */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, opacity: 0.35, letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700 }}>
            CORE FEATURE: SKIN CONCERN COMPATIBILITY MATRIX
          </div>
          <div style={{
            background: "rgba(245,240,235,0.02)",
            border: "1px solid rgba(245,240,235,0.06)",
            borderRadius: 8,
            padding: 12,
            maxHeight: 220,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }} className="derm-scroll">
            {Object.keys(formData.skinCompatibility).map((concern) => {
              const current = formData.skinCompatibility[concern];
              return (
                <div key={concern} style={{ 
                  display: "flex", 
                  flexWrap: "wrap",
                  gap: 8, 
                  alignItems: "center", 
                  borderBottom: "1px solid rgba(245,240,235,0.03)", 
                  paddingBottom: 8 
                }}>
                  <span style={{ 
                    fontSize: 10, 
                    fontFamily: "monospace", 
                    textTransform: "uppercase", 
                    color: THEME.violet, 
                    fontWeight: 600,
                    minWidth: 110
                  }}>
                    {concern.replace(/([A-Z])/g, " $1")}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleSkinChange(concern, "safe", true)}
                      style={{
                        padding: "4px 10px", fontSize: 8, borderRadius: 4, cursor: "pointer", border: "none",
                        background: current.safe ? "rgba(123,94,167,0.25)" : "rgba(245,240,235,0.04)",
                        color: current.safe ? THEME.offWhite : "rgba(245,240,235,0.3)",
                        fontWeight: 600
                      }}
                    >
                      SAFE
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkinChange(concern, "safe", false)}
                      style={{
                        padding: "4px 10px", fontSize: 8, borderRadius: 4, cursor: "pointer", border: "none",
                        background: !current.safe ? "rgba(255,62,127,0.2)" : "rgba(245,240,235,0.04)",
                        color: !current.safe ? THEME.acidRose : "rgba(245,240,235,0.3)",
                        fontWeight: 600
                      }}
                    >
                      AVOID
                    </button>
                  </div>
                  <input
                    type="text"
                    value={current.note}
                    onChange={(e) => handleSkinChange(concern, "note", e.target.value)}
                    placeholder="Compatibility info context note..."
                    style={{ ...inputStyle, padding: "6px 10px", fontSize: 10, flex: "1 1 200px" }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Notifications and Messaging */}
        <AnimatePresence mode="wait">
          {storeError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ fontSize: 11, color: THEME.acidRose, padding: "10px 12px", background: "rgba(255,62,127,0.08)", borderRadius: 8, marginBottom: 16 }}
            >
              ⚠ Error updating database: {storeError}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ fontSize: 11, color: "#22C55E", padding: "10px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, marginBottom: 16 }}
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Submission Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <motion.button
            whileHover={{ scale: isStoreLoading ? 1 : 1.02 }}
            whileTap={{ scale: isStoreLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isStoreLoading}
            style={{
              background: "rgba(123,94,167,0.15)",
              border: `1px solid ${THEME.violet}77`,
              borderRadius: 8,
              padding: "10px 24px",
              color: THEME.offWhite,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: isStoreLoading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: isStoreLoading ? 0.5 : 1,
              width: "100%",
              maxWidth: "200px"
            }}
          >
            {isStoreLoading ? "⚙ SYNCHRONIZING..." : "💾 COMMIT INGREDIENT"}
          </motion.button>
        </div>
      </form>
    </div>
    </div>
    
  );
}