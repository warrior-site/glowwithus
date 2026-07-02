import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Ingredient from "@/lib/models/ingredients";

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { names } = body; // Expected: ["SALICYLIC ACID", "Niacinamide", "Water"]

    if (!names || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json(
        { error: "An array of ingredient 'names' is required" },
        { status: 400 }
      );
    }

    // Clean up strings (trim only — do NOT rely on client-side uppercasing
    // to match the DB, since seed data may not have gone through the
    // schema's `uppercase: true` setter, e.g. if it was inserted via
    // insertMany() or a raw driver call).
    const cleanedNames = names.map((name) => String(name).trim()).filter(Boolean);

    // Case-insensitive exact-match regexes so we match regardless of how
    // the name was actually stored in Mongo.
    const patterns = cleanedNames.map(
      (n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
    );

    // .lean() returns plain JS objects instead of Mongoose Documents —
    // faster to serialize and avoids surprises with subdocuments (like
    // skinCompatibility) when JSON-stringifying the response.
    const matchedIngredients = await Ingredient.find({
      $or: [{ name: { $in: patterns } }, { aliases: { $in: patterns } }],
    }).lean();

    return NextResponse.json({
      success: true,
      count: matchedIngredients.length,
      data: matchedIngredients,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}