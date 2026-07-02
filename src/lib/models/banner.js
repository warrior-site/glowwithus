import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
  // 🎯 Who sees this
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },

  // 🧠 Banner Content
  title: { type: String, required: true },
  message: { type: String, required: true },

  // 🎬 Action (what happens on click)
  action_type: {
    type: String,
    enum: [
      "navigate",
      "open_modal",
      "trigger_analysis",
      "start_routine",
      "log_today"
    ],
    required: true
  },

  action_payload: {
    // flexible for frontend use
    route: String,       // e.g. "/analysis"
    modal_name: String,  // e.g. "upload_face"
  },

  // 🎨 UI control
  banner_type: {
    type: String,
    enum: ["info", "warning", "success", "premium"],
    default: "info"
  },

  priority: { type: Number, default: 1 }, // higher = show first

  // ⏳ Lifecycle
  is_active: { type: Boolean, default: true },
  expires_at: { type: Date, default: null },

  // 📊 Tracking (VERY IMPORTANT)
  is_dismissed: { type: Boolean, default: false },
  dismissed_at: { type: Date },

  is_clicked: { type: Boolean, default: false },
  clicked_at: { type: Date },

  // 🔁 Smart conditions (for personalization later)
  trigger_condition: {
    type: String,
    enum: [
      "no_analysis",
      "no_routine",
      "low_streak",
      "inactive_user",
      "new_user"
    ],
    default: "new_user"
  }

}, { timestamps: true });

export default mongoose.models.Banner || mongoose.model("Banner", BannerSchema);