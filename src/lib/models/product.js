import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    brand: {
      type: String,
      trim: true
    },

    description: {
      type: String
    },

    // 🔗 Connect with Ingredient DB
    ingredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true
      }
    ],

    // 📝 Raw ingredient text (for scanner / fallback)
    ingredientText: {
      type: String
    },

    // 🖼 Images (2–3 or more)
    images: [
      {
        type: String // URL
      }
    ],

    // 🛒 Buy links (multiple platforms)
    buyLinks: [
      {
        platform: String, // Amazon, Nykaa, Flipkart
        url: String
      }
    ],

    // 🎯 Skin targeting
    suitableFor: {
      skinTypes: [
        {
          type: String,
          enum: ["oily", "dry", "combination", "normal", "sensitive"]
        }
      ],

      skinConcerns: [
        {
          type: String,
          enum: [
            "acne",
            "pigmentation",
            "dryness",
            "oil_control",
            "sensitivity",
            "fungal_acne",
            "aging",
            "dark_spots",
            "rosacea"
          ]
        }
      ]
    },

    // ❌ Not suitable (very useful for warnings)
    notSuitableFor: {
      skinTypes: [String],
      skinConcerns: [String]
    },

    // ⭐ Why to use
    whyToUse: {
      type: String
    },

    // 📖 How to use
    howToUse: {
      type: String
    },

    // ⏰ When to use
    usageTime: {
      type: String,
      enum: ["AM", "PM", "Both"]
    },

    // 🔬 Product category
    category: {
      type: String,
      enum: [
        "cleanser",
        "serum",
        "moisturizer",
        "sunscreen",
        "toner",
        "exfoliant",
        "mask",
        "treatment"
      ]
    },

    // 💪 Key benefits
    benefits: [
      {
        type: String // hydration, brightening, acne control
      }
    ],

    // ⚠️ Potential concerns
    concerns: [
      {
        type: String // irritation, clogging, dryness
      }
    ],

    // 🧠 AI/Analyzer Output (VERY IMPORTANT)
    safetyScore: {
      type: Number, // 0–100
      default: 0
    },

    flags: [
      {
        type: String // danger, warning, fragrance-heavy, etc.
      }
    ],

    // 💰 Pricing
    price: {
      type: Number
    },

    currency: {
      type: String,
      default: "INR"
    },

    // ⭐ Ratings (future feature)
    averageRating: {
      type: Number,
      default: 0
    },

    totalReviews: {
      type: Number,
      default: 0
    },

    // 📦 Extra metadata
    isDermatologistRecommended: {
      type: Boolean,
      default: false
    },

    isVegan: {
      type: Boolean,
      default: false
    },

    isCrueltyFree: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);