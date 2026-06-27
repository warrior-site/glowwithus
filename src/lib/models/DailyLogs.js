import mongoose from "mongoose";

const DailyLogSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },
  log_date: { type: Date, required: true }, // Stripped of time (YYYY-MM-DD) for clean charting

  morning_done: { type: Boolean, default: false },
  night_done: { type: Boolean, default: false },
  habits_done: { type: [String], default: [] },

  mood: { type: Number, min: 1, max: 5, default: 3 },
  skin_rating: { type: Number, min: 1, max: 5, default: 3 }, // User self-rating
  
  // Tracked numerical parameters for SaaS metric graphs
  hydration_level: { type: Number, min: 1, max: 5, default: 3 },
  breakout_count: { type: Number, default: 0 },
  redness_level: { type: Number, min: 1, max: 5, default: 3 },

  notes: { type: String, default: "", trim: true },
  ai_daily_remark: { type: String, default: "" }, // Quick dynamic AI feedback text

  created_at: { type: Date, default: Date.now },
});

// Enforces one single entry per user, per calendar day
DailyLogSchema.index({ user_id: 1, log_date: 1 }, { unique: true });

export default mongoose.models.DailyLog || mongoose.model("DailyLog", DailyLogSchema);