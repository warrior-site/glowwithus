import mongoose from "mongoose";

const ConcernProgressSchema = new mongoose.Schema({
  concern_type: {
    type: String,
    enum: ["acne", "dark_spot", "wrinkle", "redness"],
    required: true
  },

  // Track how this concern changes over time
  history: [
    {
      date: { type: Date, default: Date.now },

      confidence: { type: Number, default: 0 },

      location_box: {
        top: Number,
        left: Number,
        bottom: Number,
        right: Number
      },

      image_url: String // snapshot reference for visual comparison
    }
  ]
}, { _id: false });


const ProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
      index: true
    },

    // 📊 Aggregated Trends (for charts)
    trends: {
      acne: [{ value: Number, date: Date }],
      oil: [{ value: Number, date: Date }],
      hydration: [{ value: Number, date: Date }],
      redness: [{ value: Number, date: Date }]
    },

    // 📸 Image Timeline (for before/after slider UI)
    image_history: [
      {
        image_url: { type: String, required: true },
        date: { type: Date, default: Date.now },
        analysis_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FacialAnalysis"
        }
      }
    ],

    // 🧠 Concern Evolution (VERY POWERFUL FEATURE)
    concern_progress: {
      type: [ConcernProgressSchema],
      default: []
    },

    // ⭐ Overall Improvement
    improvement_score: { type: Number, default: 0 }, // %

    // 🔥 Streak & consistency (moved from User)
    streak_count: { type: Number, default: 0 },
    total_days_logged: { type: Number, default: 0 },

    last_updated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);