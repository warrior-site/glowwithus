import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") || "28.61"; // Default location coords
    const lon = searchParams.get("lon") || "77.20";

    // Fetch live climate conditions via Open-Meteo free API
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&current=temperature_2m,relative_humidity_2m`);
    const weatherData = await weatherRes.json();

    const temp = weatherData.current.temperature_2m;
    const humidity = weatherData.current.relative_humidity_2m;
    const uvIndex = weatherData.daily.uv_index_max[0];

    const prompt = `
      Write a short, professional, motivating 1-sentence skincare insight alert based on these current weather metrics:
      Temperature: ${temp}°C, Humidity: ${humidity}%, UV Index: ${uvIndex}.
      Keep it direct, actionable (e.g. advising more hydration or reminding about sunscreen application frequency).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
    });

    return NextResponse.json({
      success: true,
      metrics: { temp, humidity, uvIndex },
      ai_tip: response.text.trim()
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}