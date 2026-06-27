import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/lib/models/User";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    await connectToDatabase();
    const token = request.cookies.get("token")?.value;
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { imageBase64 } = await request.json();
    const user = await User.findById(session.userId);

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
      You are a cosmetic chemistry AI expert. Analyze the ingredient list on this product packaging text image.
      Cross reference these ingredients with the user's skin profile:
      - Skin Type: ${user?.skin_type || "Combination"}
      - Primary Skin Issue: ${user?.skin_problem || "Acne"}

      Provide a strict JSON response format:
      {
        "is_safe": boolean,
        "clogging_ingredients": ["ingredient 1", "ingredient 2"],
        "beneficial_ingredients": ["ingredient A"],
        "verdict_summary": "Short 1-2 sentence explanation of why this product fits or conflicts with their skin problem."
      }
      Do not include markdown or \`\`\`json blocks.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt, { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } }],
    });

    return NextResponse.json({ success: true, analysis: JSON.parse(response.text.trim()) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}