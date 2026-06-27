import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import FacialAnalysis from "@/lib/models/facialAnalysis";

export async function GET(request) {
  try {
    await connectToDatabase();

    // 1. Extract userId from the search params query string
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

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
    console.error("GET Report Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}