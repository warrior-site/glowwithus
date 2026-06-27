import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/auth";

export async function PUT(request) {
  try {
    await connectToDatabase();

    // 1. Check for active login session
    const token = request.cookies.get("token")?.value;
    const decodedSession = verifyToken(token);
    if (!decodedSession) {
      return NextResponse.json({ error: "Unauthorized access: Please login" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      first_name, 
      last_name, 
      full_name, 
      phone_number, 
      location, 
      bio, 
      avatar_url,
      skin_type, 
      fitzpatrick_type, 
      primary_concerns, 
      known_sensitivities,
      affiliate_order_id, 
      affiliate_receipt_url 
    } = body;

    // 2. Prepare atomic update parameters (Strict Whitelisting Guardrail)
    let updateData = {};
    
    // Core Identity/Contact Data
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    // Skin Analytics Engine Fields
    if (skin_type !== undefined) updateData.skin_type = skin_type;
    if (fitzpatrick_type !== undefined) updateData.fitzpatrick_type = fitzpatrick_type;
    if (known_sensitivities !== undefined) updateData.known_sensitivities = known_sensitivities;
    if (primary_concerns !== undefined) {
      updateData.primary_concerns = Array.isArray(primary_concerns) ? primary_concerns : [primary_concerns];
    }

    // 3. Handle structural submission of affiliate validation details safely
    if (affiliate_order_id || affiliate_receipt_url) {
      updateData["affiliate_proof.order_id"] = affiliate_order_id || "";
      updateData["affiliate_proof.receipt_image_url"] = affiliate_receipt_url || "";
      updateData["affiliate_proof.submitted_at"] = new Date();
    }

    // 4. Update MongoDB data cleanly using explicit whitelisted parameters
    const updatedUser = await User.findByIdAndUpdate(
      decodedSession.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}