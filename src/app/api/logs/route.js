import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import DailyLog from "@/lib/models/DailyLogs";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/auth";

// 1. GET LOG FOR A SPECIFIC DATE
export async function GET(request) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value;
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Expected format: YYYY-MM-DD
    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    // Convert string to start and end of that specific calendar day
    const targetDate = new Date(dateParam);
    targetDate.setHours(0, 0, 0, 0);

    const log = await DailyLog.findOne({
      user_id: session.userId,
      log_date: targetDate,
    });

    return NextResponse.json({ success: true, data: log || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. CREATE OR UPDATE A LOG ENTRY (WITH STREAK MANAGEMENT)
export async function POST(request) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value;
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { 
      log_date,
      morning_done, 
      night_done, 
      habits_done, 
      mood, 
      skin_rating, 
      hydration_level, 
      breakout_count, 
      redness_level, 
      notes
    } = body;
    const streak = body.streak || 0; // Optional: Pass streak from client if needed
    const user = await User.findOne({ _id: session.userId });
    user.total_days_logged = (user.total_days_logged || 0) + 1;
    user.streak_count = streak;
    user.save();

    const targetDate = log_date ? new Date(log_date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Check if entry already exists for the requested date
    let log = await DailyLog.findOne({ user_id: session.userId, log_date: targetDate });

    let isNewLog = false;
    if (!log) {
      isNewLog = true;
      log = new DailyLog({
        user_id: session.userId,
        log_date: targetDate, //  FIXED: Changed 'today' to 'targetDate'
      });
    }

    // Map incoming parameters dynamically
    if (morning_done !== undefined) log.morning_done = morning_done;
    if (night_done !== undefined) log.night_done = night_done;
    if (habits_done !== undefined) log.habits_done = habits_done;
    if (mood !== undefined) log.mood = mood;
    if (skin_rating !== undefined) log.skin_rating = skin_rating;
    if (hydration_level !== undefined) log.hydration_level = hydration_level;
    if (breakout_count !== undefined) log.breakout_count = breakout_count;
    if (redness_level !== undefined) log.redness_level = redness_level;
    if (notes !== undefined) log.notes = notes;

    await log.save();

    // STREAK & ANALYTICS UPDATES ON USER RECORD
    if (isNewLog) {
      const user = await User.findById(session.userId);
      if (user) {
        user.total_days_logged = (user.total_days_logged || 0) + 1;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Only advance streak when logging the current day or yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (targetDate.getTime() === today.getTime()) {
          const loggedYesterday = await DailyLog.exists({ user_id: session.userId, log_date: yesterday });
          if (loggedYesterday) {
            user.streak_count = (user.streak_count || 0) + 1;
          } else {
            user.streak_count = 1;
          }
        } else if (targetDate.getTime() === yesterday.getTime()) {
          const dayBeforeYesterday = new Date(yesterday);
          dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);
          const loggedDayBeforeYesterday = await DailyLog.exists({ user_id: session.userId, log_date: dayBeforeYesterday });
          if (loggedDayBeforeYesterday) {
            user.streak_count = (user.streak_count || 0) + 1;
          } else {
            user.streak_count = 1;
          }
        }

        await user.save();
      }
    }

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("Daily log error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || "Failed to save daily log",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}