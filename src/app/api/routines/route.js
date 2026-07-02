import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Routine from "@/lib/models/routine";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const query = userId ? { user: userId } : {};
    const routine = await Routine.findOne(query).populate(["morning.product", "night.product", "weekly.product", "recommendedProducts.product"]);
    return NextResponse.json({ success: true, data: routine });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { userId, ...rest } = body;

    const routine = await Routine.findOneAndUpdate(
      { user: userId },
      { $set: { ...rest, user: userId } },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: routine });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 500 });

    const routine = await Routine.findOneAndDelete({ user: userId });
    return NextResponse.json({ success: true, data: routine });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
