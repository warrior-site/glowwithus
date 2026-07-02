import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectToDatabase();

    // 1. Read token string out of incoming cookies header
    const token = request.cookies.get("token")?.value;
    
    // 2. Verify token validity or expiry status
    const decodedSession = verifyToken(token);
    if (!decodedSession) {
      return NextResponse.json({ authenticated: false, error: "Session expired or invalid" }, { status: 401 });
    }

    // 3. Locate the target user data profile (Omit the password hash for safety)
    const user = await User.findById(decodedSession.userId).select("-password");
    if (!user) {
      return NextResponse.json({ authenticated: false, error: "User profile no longer exists" }, { status: 404 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user.toObject(),
        id: user._id.toString()
      }
    }, { status: 200 }); 

  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { 
        authenticated: false,
        message: error.message || "Failed to fetch user data",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}