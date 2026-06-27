import { GoogleGenAI } from "@google/genai"; // Standard Gemini 2.5 SDK

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The strict response schema matching your system architecture
const responseSchema = {
  type: "OBJECT",
  properties: {
    overall_score: { type: "INTEGER" },
    estimated_skin_age: { type: "INTEGER" },
    verdict_title: { type: "STRING" },
    summary_paragraph: { type: "STRING" },
    metrics: {
      type: "OBJECT",
      properties: {
        acne: { type: "INTEGER" },
        wrinkles: { type: "INTEGER" },
        pigmentation: { type: "INTEGER" },
        redness: { type: "INTEGER" },
        pores: { type: "INTEGER" },
        dark_circles: { type: "INTEGER" }
      }
    },
    detected_problems: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          issue_type: { type: "STRING", description: "Must be: acne, dark_spot, wrinkle, or redness" },
          label_name: { type: "STRING", description: "e.g., Acne (Pustule)" },
          location_text: { type: "STRING", description: "e.g., Cheek region — upper right" },
          confidence_percentage: { type: "INTEGER" },
          box_top: { type: "INTEGER", description: "Percentage value from top (0-100)" },
          box_left: { type: "INTEGER", description: "Percentage value from left (0-100)" },
          box_width: { type: "INTEGER", description: "Percentage width box layout (0-100)" },
          box_height: { type: "INTEGER", description: "Percentage height box layout (0-100)" }
        }
      }
    },
    ai_recommendations: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Actionable skincare advice array items"
    }
  },
  required: ["overall_score", "estimated_skin_age", "metrics", "detected_problems", "ai_recommendations"]
};

export async function analyzeSkinWithAI(imageBase64Clean, userSkinProblem) {
  const prompt = `Perform an advanced skin analysis on this face profile. 
  Focus closely on the user's reported problem: "${userSkinProblem || 'General checkup'}".
  Identify specific problem regions. Calculate bounding boxes as exact percentage values integers (0-100) relative to the image dimensions.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64Clean,
        },
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  // Natively returns parsed structured JSON object matching our schema layout
  return JSON.parse(response.text);
}