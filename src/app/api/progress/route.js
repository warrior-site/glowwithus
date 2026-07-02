import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Progress from "@/lib/models/progress";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const query = userId ? { user_id: userId } : {};
    const progress = await Progress.findOne(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { userId, ...rest } = body;

    const progress = await Progress.findOneAndUpdate(
      { user_id: userId },
      { $set: { ...rest, user_id: userId } },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: progress });
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

    const progress = await Progress.findOneAndDelete({ user_id: userId });
    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
