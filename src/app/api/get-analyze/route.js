import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import FacialAnalysis from "@/lib/models/facialAnalysis";

export async function GET(request) {
  try {
    await connectToDatabase();

    // 1. Extract userId from JWT token (never trust frontend)
    const token = request.cookies.get("token")?.value;
    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = session.userId;

    // 2. Query historical logs for this user sorted chronologically (Newest First)
    // We filter for "completed" scans to avoid pulling half-baked items
    const history = await FacialAnalysis.find({ 
      user_id: userId, 
      status: "completed" 
    })
    .sort({ createdAt: -1 })
    .lean(); // .lean() optimizes performance by returning raw JSON instead of heavy Mongoose instances

    // 3. Return payload structure expected by your FacialAnalysisDashboard
    return NextResponse.json({
      success: true,
      count: history.length,
      history: history, // Used via result.history[0] on your dashboard front
      data: history[0] || null // Fallback assignment
    });

  } catch (error) {
    console.error("Get analysis history error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || "Failed to fetch analysis history",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}