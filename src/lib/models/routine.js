import mongoose from "mongoose";

const routineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 🌅 Morning routine
    morning: [
      {
        step: Number,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        instruction: String
      }
    ],

    // 🌙 Night routine
    night: [
      {
        step: Number,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        instruction: String
      }
    ],

    // 📅 Weekly treatments
    weekly: [
      {
        day: String, // Monday, Sunday
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        instruction: String
      }
    ],

    // 🤖 AI recommended products
    recommendedProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        reason: String // “Good for acne + oily skin”
      }
    ],

    // 📊 adherence tracking
    adherence: {
      completedDays: {
        type: Number,
        default: 0
      },
      streak: {
        type: Number,
        default: 0
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Routine", routineSchema);