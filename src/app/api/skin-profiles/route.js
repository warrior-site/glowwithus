import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import SkinProfile from "@/lib/models/skinprofile";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const query = userId ? { user: userId } : {};
    const skinProfile = await SkinProfile.findOne(query).populate("currentProducts");
    return NextResponse.json({ success: true, data: skinProfile });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { userId, ...rest } = body;

    const skinProfile = await SkinProfile.findOneAndUpdate(
      { user: userId },
      { $set: { ...rest, user: userId } },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: skinProfile });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    const skinProfile = await SkinProfile.findOneAndDelete({ user: userId });
    return NextResponse.json({ success: true, data: skinProfile });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
