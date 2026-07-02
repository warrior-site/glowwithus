import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // 👤 Who receives this
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // 🔔 Notification type (VERY IMPORTANT)
    type: {
      type: String,
      enum: [
        "analysis_complete",
        "recommendation",
        "product_alert",
        "routine_reminder",
        "ingredient_warning",
        "price_drop",
        "new_product",
        "system",
        "achievement"
      ],
      required: true
    },

    // 🧾 Title & message
    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    // 🔗 Optional action link (frontend routing)
    actionLink: {
      type: String // e.g. /product/123 or /analysis/456
    },

    // 📦 Related data (dynamic reference)
    related: {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient"
      },
      analysisId: {
        type: mongoose.Schema.Types.ObjectId
      }
    },

    // 🎯 Personalization context
    context: {
      skinType: String,
      skinConcern: String
    },

    // 📊 Priority (for sorting / UI)
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    // 👁 Read status
    isRead: {
      type: Boolean,
      default: false
    },

    // 🗑 Soft delete
    isDeleted: {
      type: Boolean,
      default: false
    },

    // ⏳ Expiry (optional)
    expiresAt: {
      type: Date
    },

    // 🔄 Trigger source
    triggeredBy: {
      type: String,
      enum: ["system", "ml_engine", "admin", "user_action"],
      default: "system"
    },

    // 📌 Extra metadata (flexible)
    metadata: {
      type: Object
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);