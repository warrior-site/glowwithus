import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    aliases: [
      {
        type: String,
        uppercase: true,
        trim: true
      }
    ],

    comedogenicity: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    irritancy: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    safetyFlag: {
      type: String,
      enum: ["danger", "warning", "info", null],
      default: null
    },

    note: String,

    category: {
      type: String,
      enum: [
        "humectant",
        "emollient",
        "occlusive",
        "active",
        "surfactant",
        "preservative",
        "fragrance",
        "solvent",
        "uv_filter",
        "other"
      ],
      default: "other"
    },

    // ⭐ CORE FEATURE: Skin Concern Compatibility
    skinCompatibility: {
      acne: {
        safe: { type: Boolean, default: true },
        note: String
      },

      oily: {
        safe: { type: Boolean, default: true },
        note: String
      },

      dry: {
        safe: { type: Boolean, default: true },
        note: String
      },

      sensitive: {
        safe: { type: Boolean, default: true },
        note: String
      },

      combination: {
        safe: { type: Boolean, default: true },
        note: String
      },

      fungalAcne: {
        safe: { type: Boolean, default: true },
        note: String
      },

      pigmentation: {
        safe: { type: Boolean, default: true },
        note: String
      },

      rosacea: {
        safe: { type: Boolean, default: true },
        note: String
      }
    },

    pregnancySafe: {
      type: Boolean,
      default: true
    },

    description: String,

    benefits: [String], // e.g. ["hydration", "brightening"]

    concerns: [String], // e.g. ["irritation", "clogging"]

    researchLinks: [String]
  },
  { timestamps: true }
);

export default mongoose.models.Ingredient || mongoose.model("Ingredient", ingredientSchema);