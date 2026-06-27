import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { evaluateUserAccess } from "@/lib/checkAccess";
import { uploadToImageKit } from "@/lib/imagekit";
import { analyzeSkinWithAI } from "@/lib/gemini";
import FacialAnalysis from "@/lib/models/facialAnalysis";
import User from "@/lib/models/User";

export async function POST(request) {
  try {
    await connectToDatabase();
    const { userId, imageBase64 } = await request.json();

    if (!userId || !imageBase64) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch user status profile
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User profile missing" }, { status: 404 });
    }

    // 2. Evaluate if they have permission (Free, Paid, or Affiliate)
    const accessStatus = evaluateUserAccess(user);
    if (!accessStatus.allowed) {
      return NextResponse.json({ 
        success: false, 
        error: accessStatus.reason,
        requiresUpgrade: true 
      }, { status: 403 });
    }

    // 3. Clean base64 and upload raw file to ImageKit
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const uploadResult = await uploadToImageKit(cleanBase64, `scan-${userId}-${Date.now()}.jpg`);
    
    // 4. Execute Structured AI pipeline
    const aiResults = await analyzeSkinWithAI(cleanBase64, user.skin_problem);

    // 5. Map and sanitize JSON data arrays into strict Mongoose enum formats
    const mappedConcerns = (aiResults.detected_problems || []).map((prob) => {
      // Direct sanitization layer to protect against schema enum crashes
      let dynamicType = prob.issue_type?.toLowerCase() || "";
      if (dynamicType === "wrinkles") dynamicType = "wrinkle";
      if (dynamicType === "pigmentation" || dynamicType === "dark_spots") dynamicType = "dark_spot";

      return {
        concern_type: dynamicType,
        confidence: (prob.confidence_percentage || 0) / 100, 
        concern_location: prob.location_text || '',
        location_text: prob.location_text || '',
        location_box: {
          top: prob.box_top || 0,
          left: prob.box_left || 0,
          bottom: (prob.box_top || 0) + (prob.box_height || 0), 
          right: (prob.box_left || 0) + (prob.box_width || 0)  
        }
      };
    });

    // 6. Deduct a token ONLY after confirming a complete, successful pipeline pipeline run
    if (accessStatus.tier === "free") {
      // Native Mongoose atomic reduction prevents dirty reads and concurrency race exploits
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, free_scans_remaining: { $gt: 0 } },
        { $inc: { free_scans_remaining: -1 } },
        { new: true }
      );
      
      if (!updatedUser) {
        return NextResponse.json({ success: false, error: "Scan limit exceeded during processing pipeline." }, { status: 403 });
      }
      user.free_scans_remaining = updatedUser.free_scans_remaining; 
    }

    // 7. Store parameters inside the MongoDB Framework 
    const newAnalysis = await FacialAnalysis.create({
      user_id: userId,
      image_url: uploadResult.url,
      ai_metrics: {
        acne_score: aiResults.metrics?.acne || 0,
        wrinkle_score: aiResults.metrics?.wrinkles || 0,
        pigmentation_score: aiResults.metrics?.pigmentation || 0,
        redness_score: aiResults.metrics?.redness || 0,
        pores_score: aiResults.metrics?.pores || 0,
        dark_circles_score: aiResults.metrics?.dark_circles || 0, // FIXED: Now mapped correctly for frontend usage
        skin_age_estimate: aiResults.estimated_skin_age
      },
      detected_concerns: mappedConcerns,
      ai_summary: aiResults.summary_paragraph || aiResults.verdict_title || "",
      ai_recommendations: aiResults.ai_recommendations || [],
      overall_health_score: aiResults.overall_score || 70,
      status: "completed"
    });

    // 8. Return data back cleanly to Frontend UI
    return NextResponse.json({ 
      success: true, 
      tierUsed: accessStatus.tier,
      freeScansLeft: user.free_scans_remaining,
      data: newAnalysis 
    });

  } catch (error) {
    console.error("API Pipeline Core Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}