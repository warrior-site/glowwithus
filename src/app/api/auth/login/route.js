import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { createToken } from "@/lib/auth";
import { validateEmail, checkRateLimit } from "@/lib/validation";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    // 1. Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // 2. Rate limiting (max 5 login attempts per 15 minutes per IP)
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `login:${ipAddress}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: rateLimit.error },
        { status: 429, headers: { "Retry-After": rateLimit.retryAfter } }
      );
    }

    // 3. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 5. Create JWT token
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // 6. Return user data with token
    const response = {
      token,
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        primary_concerns: user.primary_concerns, 
        skin_type: user.skin_type,
        is_premium_user: user.is_premium_user,
        purchase_verified: user.purchase_verified,
        free_scans_remaining: user.free_scans_remaining,
        streak_count: user.streak_count,
        total_days_logged: user.total_days_logged,
        role: user.role,
        created_at: user.created_at,
      },
    };

    // 7. Set JWT token in HTTP-only cookie for security
    const res = NextResponse.json(response, { status: 200 });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || "Login failed",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
