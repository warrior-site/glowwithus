import mongoose from "mongoose";

const AiMetricsSchema = new mongoose.Schema({
  acne_score: { type: Number, default: 0 },
  wrinkle_score: { type: Number, default: 0 },
  pigmentation_score: { type: Number, default: 0 },
  redness_score: { type: Number, default: 0 },
  pores_score: { type: Number, default: 0 },
  dark_circles_score: { type: Number, default: 0 },
  skin_age_estimate: { type: Number }
}, { _id: false }); // Safe to keep false here; these aren't mapped over in an array

const DetectedConcernSchema = new mongoose.Schema({
  // Note: Added an internal ID back so your React frontend key={box.id} gets a stable ID
  concern_type: { 
    type: String, 
    enum: ["acne", "dark_spot", "wrinkle", "redness"], // Ensure your model outputs match these strings
    required: true 
  },
  confidence: { type: Number, default: 0 },
  location_box: {
    top: { type: Number, required: true },
    left: { type: Number, required: true },
    bottom: { type: Number, required: true },
    right: { type: Number, required: true },
  }
}, { _id: true }); // Changed to true for flawless React reconciliation keys!

const FacialAnalysisSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },
  image_url: { type: String, required: true },
  analysis_date: { type: Date, default: Date.now, index: true },

  ai_metrics: { type: AiMetricsSchema, default: () => ({}) },
  detected_concerns: { type: [DetectedConcernSchema], default: [] },

  ai_summary: { type: String, default: "" },
  ai_recommendations: { type: [String], default: [] },
  overall_health_score: { type: Number, min: 0, max: 100, default: 70 },

  status: { 
    type: String, 
    enum: ["processing", "completed", "failed"], 
    default: "processing",
    index: true // Highly recommended if you plan to filter for dashboard records where status: "completed"
  }
}, { timestamps: true });

export default mongoose.models.FacialAnalysis || mongoose.model("FacialAnalysis", FacialAnalysisSchema);