import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 2. Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Create JWT token
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // 4. Return user data with token
    const response = {
      token,
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

    // 5. Set JWT token in HTTP-only cookie for security
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
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
