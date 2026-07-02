"use client"

import React, { useState, useEffect } from "react";
import { useIngredientsStore } from "@/stores/useIngredientsStore"; 
import { useProductStore } from "@/stores/useProductStore";         

export default function AddProductForm() {
  const { ingredients, fetchIngredients, isLoading: ingredientsLoading } = useIngredientsStore();
  const { createProduct, isSaving, error: productError } = useProductStore();

  // Load backend ingredients on mount for database mapping
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Initial form state aligning perfectly with Mongoose fields
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    ingredients: [], // IDs array
    ingredientText: "",
    images: [""], // At least 1 input line initially
    buyLinks: [{ platform: "", url: "" }],
    suitableFor: { skinTypes: [], skinConcerns: [] },
    notSuitableFor: { skinTypes: [], skinConcerns: [] },
    whyToUse: "",
    howToUse: "",
    usageTime: "Both",
    category: "cleanser",
    benefits: [""],
    concerns: [""],
    safetyScore: 0,
    flags: [""],
    price: "",
    currency: "INR",
    isDermatologistRecommended: false,
    isVegan: false,
    isCrueltyFree: false,
  });

  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  // Standard inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Nested structures (suitableFor, notSuitableFor)
  const handleNestedArrayToggle = (parent, field, item) => {
    setFormData((prev) => {
      const currentArr = prev[parent][field];
      const updatedArr = currentArr.includes(item)
        ? currentArr.filter((i) => i !== item)
        : [...currentArr, item];
      return {
        ...prev,
        [parent]: { ...prev[parent], [field]: updatedArr },
      };
    });
  };

  // Custom text array inputs (Images, Benefits, Concerns, Flags)
  const handleTextArrayChange = (field, index, value) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const addTextArrayRow = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeTextArrayRow = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Key-value array elements (Buy Links)
  const handleBuyLinkChange = (index, key, value) => {
    setFormData((prev) => {
      const updated = [...prev.buyLinks];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, buyLinks: updated };
    });
  };

  // Multi-select for linking DB ingredients
  const handleIngredientSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, ingredients: selectedOptions }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "" });

    // Sanitize values (remove empty arrays/strings where applicable)
    const payload = {
      ...formData,
      price: formData.price ? Number(formData.price) : undefined,
      safetyScore: Number(formData.safetyScore),
      images: formData.images.filter((i) => i.trim() !== ""),
      benefits: formData.benefits.filter((b) => b.trim() !== ""),
      concerns: formData.concerns.filter((c) => c.trim() !== ""),
      flags: formData.flags.filter((f) => f.trim() !== ""),
      buyLinks: formData.buyLinks.filter((l) => l.platform.trim() && l.url.trim()),
    };

    const response = await createProduct(payload);
    if (response.success) {
      setSubmitStatus({ type: "success", message: "⚡ Product launched successfully into the database!" });
      // Reset form if desired
    } else {
      setSubmitStatus({ type: "error", message: response.error || "An error occurred." });
    }
  };

  return (
    <div style={styles.container}>
      {/* Dynamic Animated Core Accents */}
      <div style={styles.glowOrb1}></div>
      <div style={styles.glowOrb2}></div>

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <h1 style={styles.heading}>
          ADD <span style={{ color: "#FF3E7F" }}>NEW PRODUCT</span>
        </h1>
        <p style={styles.subheading}>Fill down parameters to update the ecosystem metadata catalog.</p>

        {/* Global Error/Success Banner */}
        {(submitStatus.message || productError) && (
          <div style={submitStatus.type === "success" ? styles.successBanner : styles.errorBanner}>
            {submitStatus.message || productError}
          </div>
        )}

        {/* SECTION 1: CORE METADATA */}
        <h2 style={styles.sectionTitle}>01. Core Identity</h2>
        <div style={styles.grid2Col}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Product Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} placeholder="e.g. Hydro-Plump Serum" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Brand Name</label>
            <input type="text" name="brand" value={formData.brand} onChange={handleChange} style={styles.input} placeholder="e.g. SkinLabs" />
          </div>
        </div>

        <div style={styles.grid3Col}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} style={styles.select}>
              {["cleanser", "serum", "moisturizer", "sunscreen", "toner", "exfoliant", "mask", "treatment"].map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} style={styles.input} placeholder="0.00" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Currency</label>
            <input type="text" name="currency" value={formData.currency} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" style={styles.textarea} placeholder="Write a summary..."></textarea>
        </div>

        <hr style={styles.divider} />

        {/* SECTION 2: INGREDIENTS COMPOSITION */}
        <h2 style={styles.sectionTitle}>02. Ingredient Engine</h2>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Linked Database Ingredients * (Hold Ctrl/Cmd to Multi-select)</label>
          {ingredientsLoading ? (
            <p style={{ color: "#7B5EA7" }}>Fetching database elements...</p>
          ) : (
            <select multiple value={formData.ingredients} onChange={handleIngredientSelection} style={{ ...styles.select, height: "140px" }} required>
              {ingredients.map((ing) => (
                <option key={ing._id} value={ing._id} style={{ background: "#0A0A1A", padding: "4px" }}>
                  🧬 {ing.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Raw Text Ingredients (Scanner / Fallback Copy)</label>
          <textarea name="ingredientText" value={formData.ingredientText} onChange={handleChange} rows="2" style={styles.textarea} placeholder="Paste unformatted ingredients label here..."></textarea>
        </div>

        <hr style={styles.divider} />

        {/* SECTION 3: SKIN TARGETING TARGETS & ENUMS */}
        <h2 style={styles.sectionTitle}>03. Biological Targeting Matrix</h2>
        <div style={styles.grid2Col}>
          {/* Suitable For */}
          <div style={styles.targetCard}>
            <h3 style={{ color: "#E8A838", marginBottom: "10px", fontSize: "14px" }}>🎯 SUITABLE FOR</h3>
            <label style={styles.labelSub}>Skin Types</label>
            <div style={styles.checkboxFlex}>
              {["oily", "dry", "combination", "normal", "sensitive"].map((type) => (
                <button type="button" key={type} onClick={() => handleNestedArrayToggle("suitableFor", "skinTypes", type)}
                  style={formData.suitableFor.skinTypes.includes(type) ? styles.badgeActive : styles.badgeInactive}>
                  {type}
                </button>
              ))}
            </div>
            <label style={styles.labelSub}>Skin Concerns</label>
            <div style={styles.checkboxFlex}>
              {["acne", "pigmentation", "dryness", "oil_control", "sensitivity", "fungal_acne", "aging", "dark_spots", "rosacea"].map((con) => (
                <button type="button" key={con} onClick={() => handleNestedArrayToggle("suitableFor", "skinConcerns", con)}
                  style={formData.suitableFor.skinConcerns.includes(con) ? styles.badgeActive : styles.badgeInactive}>
                  {con.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Not Suitable For */}
          <div style={styles.targetCard}>
            <h3 style={{ color: "#FF3E7F", marginBottom: "10px", fontSize: "14px" }}>⚠️ CONTRAINDICATIONS / NOT SUITABLE FOR</h3>
            <label style={styles.labelSub}>Exclusionary Types</label>
            <div style={styles.checkboxFlex}>
              {["oily", "dry", "combination", "normal", "sensitive"].map((type) => (
                <button type="button" key={type} onClick={() => handleNestedArrayToggle("notSuitableFor", "skinTypes", type)}
                  style={formData.notSuitableFor.skinTypes.includes(type) ? styles.badgeActiveDanger : styles.badgeInactive}>
                  {type}
                </button>
              ))}
            </div>
            <label style={styles.labelSub}>Exclusionary Concerns</label>
            <div style={styles.checkboxFlex}>
              {["acne", "pigmentation", "dryness", "oil_control", "sensitivity", "fungal_acne", "aging", "dark_spots", "rosacea"].map((con) => (
                <button type="button" key={con} onClick={() => handleNestedArrayToggle("notSuitableFor", "skinConcerns", con)}
                  style={formData.notSuitableFor.skinConcerns.includes(con) ? styles.badgeActiveDanger : styles.badgeInactive}>
                  {con.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* SECTION 4: INSTRUCTIONS & ANALYTICS */}
        <h2 style={styles.sectionTitle}>04. Instruction Blueprint & Score</h2>
        <div style={styles.grid2Col}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Why To Use</label>
            <textarea name="whyToUse" value={formData.whyToUse} onChange={handleChange} rows="2" style={styles.textarea}></textarea>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>How To Use</label>
            <textarea name="howToUse" value={formData.howToUse} rows="2" onChange={handleChange} style={styles.textarea}></textarea>
          </div>
        </div>

        <div style={styles.grid2Col}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Usage Timing Routine</label>
            <select name="usageTime" value={formData.usageTime} onChange={handleChange} style={styles.select}>
              {["AM", "PM", "Both"].map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>AI Safety Score (0 - 100): <span style={{ color: "#FF3E7F" }}>{formData.safetyScore}</span></label>
            <input type="range" name="safetyScore" min="0" max="100" value={formData.safetyScore} onChange={handleChange} style={styles.rangeSlider} />
          </div>
        </div>

        <hr style={styles.divider} />

        {/* SECTION 5: ARRAY DATA FEEDS */}
        <h2 style={styles.sectionTitle}>05. Dynamic Asset Arrays</h2>

        {/* Images Array Input */}
        <div style={styles.arrayBlock}>
          <label style={styles.label}>Images URLs (2–3 recommended)</label>
          {formData.images.map((img, i) => (
            <div key={i} style={styles.arrayRow}>
              <input type="text" value={img} onChange={(e) => handleTextArrayChange("images", i, e.target.value)} placeholder="https://domain.com/image.jpg" style={styles.input} />
              {formData.images.length > 1 && <button type="button" onClick={() => removeTextArrayRow("images", i)} style={styles.rowDelBtn}>✕</button>}
            </div>
          ))}
          <button type="button" onClick={() => addTextArrayRow("images")} style={styles.rowAddBtn}>+ Add Image Row</button>
        </div>

        {/* Buy Links Array Input */}
        <div style={styles.arrayBlock}>
          <label style={styles.label}>E-Commerce Vendor Overlays</label>
          {formData.buyLinks.map((link, i) => (
            <div key={i} style={styles.arrayRow}>
              <input type="text" value={link.platform} onChange={(e) => handleBuyLinkChange(i, "platform", e.target.value)} placeholder="Platform (e.g. Nykaa)" style={{ ...styles.input, flex: 1 }} />
              <input type="text" value={link.url} onChange={(e) => handleBuyLinkChange(i, "url", e.target.value)} placeholder="Product URL" style={{ ...styles.input, flex: 2 }} />
              {formData.buyLinks.length > 1 && <button type="button" onClick={() => removeTextArrayRow("buyLinks", i)} style={styles.rowDelBtn}>✕</button>}
            </div>
          ))}
          <button type="button" onClick={() => setFormData(prev => ({ ...prev, buyLinks: [...prev.buyLinks, { platform: "", url: "" }] }))} style={styles.rowAddBtn}>+ Add Buy Link Overlay</button>
        </div>

        {/* Toggle Tags Switchboxes */}
        <div style={styles.toggleRow}>
          <label style={styles.switchLabel}>
            <input type="checkbox" name="isDermatologistRecommended" checked={formData.isDermatologistRecommended} onChange={handleChange} style={styles.checkboxHidden} />
            <span style={formData.isDermatologistRecommended ? styles.switchActive : styles.switchInactive}>🩺 Derm Recommended</span>
          </label>
          <label style={styles.switchLabel}>
            <input type="checkbox" name="isVegan" checked={formData.isVegan} onChange={handleChange} style={styles.checkboxHidden} />
            <span style={formData.isVegan ? styles.switchActive : styles.switchInactive}>🌱 Vegan Formula</span>
          </label>
          <label style={styles.switchLabel}>
            <input type="checkbox" name="isCrueltyFree" checked={formData.isCrueltyFree} onChange={handleChange} style={styles.checkboxHidden} />
            <span style={formData.isCrueltyFree ? styles.switchActive : styles.switchInactive}>🐇 Cruelty Free</span>
          </label>
        </div>

        {/* SUBMIT */}
        <button type="submit" disabled={isSaving} style={isSaving ? styles.submitBtnDisabled : styles.submitBtn}>
          {isSaving ? "TRANSMITTING DATA..." : "CREATE CATALOG PRODUCT ENTITY"}
        </button>
      </form>
    </div>
  );
}

// Custom Styled Components JS Objects mapped to the requested layout theme palette
const styles = {
  container: {
    backgroundColor: "#0A0A1A", // Deep Navy background
    color: "#F5F0EB", // Off-white text
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
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(255,62,127,0.15) 0%, rgba(0,0,0,0) 70%)",
    top: "-100px",
    left: "-50px",
    pointerEvents: "none",
  },
  glowOrb2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(123,94,167,0.12) 0%, rgba(0,0,0,0) 70%)",
    bottom: "50px",
    right: "-100px",
    pointerEvents: "none",
  },
  formCard: {
    background: "rgba(245, 240, 235, 0.03)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(245, 240, 235, 0.08)",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "850px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    zIndex: 2,
  },
  heading: {
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "2px",
    margin: "0 0 8px 0",
  },
  subheading: {
    color: "#7B5EA7", // Muted violet
    fontSize: "14px",
    margin: "0 0 32px 0",
  },
  sectionTitle: {
    fontSize: "14px",
    color: "#E8A838", // Warm Amber
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: "18px",
  },
  divider: {
    border: "0",
    height: "1px",
    background: "linear-gradient(to right, rgba(123,94,167,0.3), transparent)",
    margin: "30px 0",
  },
  grid2Col: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "16px",
  },
  grid3Col: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
    marginBottom: "16px",
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
  labelSub: {
    fontSize: "11px",
    color: "#7B5EA7",
    margin: "8px 0 4px 0",
    display: "block",
  },
  input: {
    background: "rgba(10, 10, 26, 0.6)",
    border: "1px solid rgba(245, 240, 235, 0.15)",
    borderRadius: "8px",
    padding: "12px",
    color: "#F5F0EB",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s ease-in-out",
  },
  textarea: {
    background: "rgba(10, 10, 26, 0.6)",
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
  rangeSlider: {
    accentColor: "#FF3E7F", // Acid Rose track accents
    marginTop: "8px",
  },
  targetCard: {
    background: "rgba(10, 10, 26, 0.4)",
    border: "1px solid rgba(245, 240, 235, 0.05)",
    borderRadius: "10px",
    padding: "16px",
  },
  checkboxFlex: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "10px",
  },
  badgeInactive: {
    background: "transparent",
    border: "1px solid rgba(245,240,235, 0.15)",
    borderRadius: "20px",
    color: "#F5F0EB",
    padding: "5px 12px",
    fontSize: "11px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  badgeActive: {
    background: "#E8A838",
    border: "1px solid #E8A838",
    borderRadius: "20px",
    color: "#0A0A1A",
    padding: "5px 12px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
  badgeActiveDanger: {
    background: "#FF3E7F",
    border: "1px solid #FF3E7F",
    borderRadius: "20px",
    color: "#F5F0EB",
    padding: "5px 12px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
  arrayBlock: {
    marginBottom: "20px",
  },
  arrayRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "8px",
    alignItems: "center",
  },
  rowAddBtn: {
    background: "none",
    border: "none",
    color: "#7B5EA7",
    cursor: "pointer",
    fontSize: "12px",
    padding: "4px 0",
    fontWeight: "600",
  },
  rowDelBtn: {
    background: "rgba(255, 62, 127, 0.1)",
    border: "none",
    color: "#FF3E7F",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  toggleRow: {
    display: "flex",
    gap: "15px",
    margin: "24px 0",
  },
  checkboxHidden: {
    display: "none",
  },
  switchInactive: {
    background: "rgba(245, 240, 235, 0.03)",
    border: "1px solid rgba(245, 240, 235, 0.1)",
    padding: "10px 16px",
    borderRadius: "8px",
    color: "rgba(245, 240, 235, 0.5)",
    cursor: "pointer",
    display: "inline-block",
    fontSize: "13px",
  },
  switchActive: {
    background: "rgba(123, 94, 167, 0.2)",
    border: "1px solid #7B5EA7",
    padding: "10px 16px",
    borderRadius: "8px",
    color: "#F5F0EB",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-block",
    fontSize: "13px",
    boxShadow: "0 0 10px rgba(123, 94, 167, 0.3)",
  },
  submitBtn: {
    background: "linear-gradient(90deg, #FF3E7F 0%, #7B5EA7 100%)",
    color: "#F5F0EB",
    border: "none",
    borderRadius: "8px",
    padding: "16px",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "1px",
    width: "100%",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(255, 62, 127, 0.3)",
    transition: "transform 0.2s",
  },
  submitBtnDisabled: {
    background: "#222",
    color: "#666",
    border: "none",
    borderRadius: "8px",
    padding: "16px",
    width: "100%",
    textAlign: "center",
  },
  successBanner: {
    background: "rgba(40, 167, 69, 0.15)",
    border: "1px solid #28a745",
    color: "#28a745",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  errorBanner: {
    background: "rgba(255, 62, 127, 0.15)",
    border: "1px solid #FF3E7F",
    color: "#FF3E7F",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
  },
};