import mongoose from "mongoose";

const RoutineItemSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  usage_time: {
    type: String,
    enum: ["morning", "night", "both"],
    default: "both",
  },
  is_active: { type: Boolean, default: true }
});

const SkincareRoutineSchema = new mongoose.Schema({
  routine_name: { type: String, default: "Custom Routine" },
  total_days: { type: Number, default: 30 },
  current_day: { type: Number, default: 1 },
  items: { type: [RoutineItemSchema], default: [] },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date },
});

// New sub-schema for fine-grained skin metrics shown in your UI bars
const SkinMetricsSchema = new mongoose.Schema({
  hydration: { type: Number, default: 50 },
  elasticity: { type: Number, default: 50 },
  barrier: { type: Number, default: 50 },
  sebum_control: { type: Number, default: 50 },
  pigmentation: { type: Number, default: 50 },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  
  // Basic & Contact Info
  full_name: { type: String, default: "" },
  first_name: { type: String, default: "" },
  last_name: { type: String, default: "" },
  phone_number: { type: String, default: "" },
  location: { type: String, default: "" },
  bio: { type: String, default: "" },
  avatar_url: { type: String, default: "" },
  
  // Core Skin Profile Elements
  skin_type: { type: String, enum: ["Combination", "Oily", "Dry", "Normal"], default: "Combination" },
  fitzpatrick_type: { type: String, enum: ["Type I", "Type II", "Type III", "Type IV", "Type V", "Type VI"], default: "Type III" },
  primary_concerns: { type: [String], default: [] }, // Stores multiple concerns like ["Hyperpigmentation", "Fine lines"]
  known_sensitivities: { type: String, default: "" },
  
  // Metrics Tracked
  skin_health_metrics: { type: SkinMetricsSchema, default: () => ({}) },
  skin_score: { type: Number, default: 0 },
  streak_count: { type: Number, default: 0 },
  total_days_logged: { type: Number, default: 0 },

  // Access Control & Affiliates
  is_premium_user: { type: Boolean, default: false },
  purchase_verified: { type: Boolean, default: false },
  premium_expires_at: { type: Date, default: null },
  free_scans_remaining: { type: Number, default: 3 },
  
  // Cleanly structured nested affiliate tracking object
  affiliate_proof: {
    order_id: { type: String, default: "" },
    receipt_image_url: { type: String, default: "" },
    submitted_at: { type: Date, default: null }
  },
  
  role: { type: String, enum: ["user", "admin"], default: "user" },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);