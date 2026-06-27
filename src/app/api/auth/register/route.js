import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();

    const {
      email,
      password,
      full_name,
      skin_problem,
      skin_type,
      affiliate_order_id, // e.g., "AMZN-123456" 
      affiliate_receipt_url,
      avatarUrl // e.g., Image URL from ImageKit proof upload
    } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Check if email is already taken
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 2. Hash password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Prepare initial verification state if they submitted proof
    const submittedProof = !!(affiliate_order_id || affiliate_receipt_url);

    // 4. Create User document
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name: full_name || "",
      skin_problem: skin_problem || "acne",
      skin_type: skin_type || "combination",
      avatar_url: avatarUrl || "", // Matches schema string perfectly!

      // --- MATCHING THE FLATTENED SCHEMA STRUCTURING ---
      affiliate_order_id: affiliate_order_id || "",
      affiliate_receipt_url: affiliate_receipt_url || "",

      // Keep access controls aligned with schema defaults
      purchase_verified: false,
      is_premium_user: false,
      role: "user"
    });

    // 5. Create secure JWT session
    const token = createToken({ userId: newUser._id, role: newUser.role });

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      user: { id: newUser._id, email: newUser.email, full_name: newUser.full_name }
    }, { status: 201 });

    // 6. Inject secure HTTP-Only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 Days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}