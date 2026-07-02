import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import {createToken, verifyToken } from "@/lib/auth";

export async function PATCH(request) {
  try {
    await connectToDatabase();
    
    // Auth validation layer check (Admins only)
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { targetUserId, isApproved, daysToGrant } = await request.json();

    let updateFields = {};
    if (isApproved) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + (daysToGrant || 30)); // default 30 days reward

      updateFields = {
        purchase_verified: true,
        premium_expires_at: expirationDate
      };
    } else {
      updateFields = { purchase_verified: false };
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser.toObject(),
        id: updatedUser._id.toString()
      }
    });
  } catch (error) {
    console.error("Affiliate verification error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || "Failed to verify affiliate",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}