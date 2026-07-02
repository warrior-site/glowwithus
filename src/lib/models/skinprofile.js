import mongoose from "mongoose";

const skinProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true
    },

    skinType: {
      type: String,
      enum: ["oily", "dry", "combination", "normal", "sensitive"]
    },

    concerns: [
      {
        type: String,
        enum: [
          "acne",
          "pigmentation",
          "dark_spots",
          "dryness",
          "oil_control",
          "sensitivity",
          "fungal_acne",
          "aging",
          "rosacea"
        ]
      }
    ],

    sensitivityLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    goals: [
      {
        type: String // clear skin, glow, reduce acne etc.
      }
    ],

    allergies: [String],

    currentProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

    environment: {
      humidity: Number,
      uvIndex: Number,
      pollutionLevel: Number,
      city: String
    },

    lifestyle: {
      sleepHours: Number,
      waterIntake: Number,
      stressLevel: {
        type: String,
        enum: ["low", "medium", "high"]
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("SkinProfile", skinProfileSchema);