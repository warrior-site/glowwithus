import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Ingredient from "@/lib/models/ingredients";

// 1. FETCH ALL INGREDIENTS
export async function GET() {
  try {
    await connectToDatabase();

    // Fetch ingredients sorted alphabetically by name
    const ingredients = await Ingredient.find({}).sort({ name: 1 });

    return NextResponse.json({ success: true, data: ingredients });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ADD A NEW INGREDIENT
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Basic Validation: Schema requires name
    if (!body.name) {
      return NextResponse.json({ error: "Ingredient name is required" }, { status: 400 });
    }

    // Check if ingredient already exists (Name is unique and uppercase)
    const existingIngredient = await Ingredient.findOne({ 
      name: body.name.trim().toUpperCase() 
    });
    
    if (existingIngredient) {
      return NextResponse.json({ error: "An ingredient with this name already exists" }, { status: 409 });
    }

    // Create new instance (Mongoose schema defaults handle the nested structures)
    const newIngredient = new Ingredient(body);
    await newIngredient.save();

    return NextResponse.json({ success: true, data: newIngredient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}