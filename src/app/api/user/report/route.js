import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import DailyLog from "@/lib/models/DailyLogs";
import FacialAnalysis from "@/lib/models/facialAnalysis";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectToDatabase();

    // 1. Authenticate request session
    const token = request.cookies.get("token")?.value;
    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized session. Please login." }, { status: 401 });
    }

    // 2. Fetch parallel database operations concurrently to minimize load lag
    const [userProfile, logHistory, scanHistory] = await Promise.all([
      User.findById(session.userId).select("-password"),
      DailyLog.find({ user_id: session.userId }).sort({ log_date: -1 }), // Newest logs first
      FacialAnalysis.find({ user_id: session.userId, status: "completed" }).sort({ analysis_date: -1 })
    ]);

    if (!userProfile) {
      return NextResponse.json({ error: "User context matching token data not found" }, { status: 404 });
    }

    // 3. Consolidate a comprehensive health report snapshot
    const comprehensiveReport = {
      generated_at: new Date(),
      account_summary: {
        full_name: userProfile.full_name,
        email: userProfile.email,
        declared_skin_problem: userProfile.skin_problem,
        evaluated_skin_type: userProfile.skin_type,
        active_consistency_streak: userProfile.streak_count,
        total_days_monitored: userProfile.total_days_logged,
        membership_tier: userProfile.purchase_verified ? "Verified Affiliate Partner" : "Standard Tier"
      },
      assigned_treatment_plan: userProfile.skincare_routine || { routine_name: "No routine assigned yet", items: [] },
      historical_metrics: {
        total_logged_entries: logHistory.length,
        logs: logHistory,
      },
      ai_facial_scans: {
        total_scans_completed: scanHistory.length,
        scans: scanHistory
      }
    };

    return NextResponse.json({
      success: true,
      report: comprehensiveReport
    }, { status: 200 });

  } catch (error) {
    console.error("User report error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || "Failed to generate user report",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}