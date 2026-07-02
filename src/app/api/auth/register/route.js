import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { createToken } from "@/lib/auth";
import { validateEmail, validatePassword, validateName, checkRateLimit } from "@/lib/validation";
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
      avatarUrl,
      age,
      gender,
    } = await request.json();
    console.log("Incoming body:", {
  email,
  password,
  full_name,
  skin_problem,
  skin_type,
  avatarUrl,
  age,
  gender,
});

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.error },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name: full_name || "",
      skin_problem: skin_problem || "acne",
      skin_type: skin_type ? skin_type.toLowerCase() : "combination",
      avatar_url: avatarUrl || "",
      age: age ? Number(age) : null,
      gender: gender || "male",

      purchase_verified: false,
      is_premium_user: false,
      role: "user",
    });

    const token = createToken({ userId: newUser._id });

    const res = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id,
          email: newUser.email,
          full_name: newUser.full_name,
        },
      },
      { status: 201 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err) {
    console.log(err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}