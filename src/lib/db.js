import mongoose from "mongoose";

// Create a global cache variable to preserve the connection across hot-reloads
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  // If we already have an active connection, reuse it
  if (cached.conn) {
    return cached.conn;
  }

  // Check if our environment variable exists
  if (!process.env.MONGO_URI) {
    throw new Error("Please define the MONGO_URI environment variable inside .env.local");
  }

  // If a connection isn't already in progress, start one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongooseInstance) => {
      console.log("🚀 Connected cleanly to MongoDB");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset cache on failure so we can try again
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }

  return cached.conn;
};