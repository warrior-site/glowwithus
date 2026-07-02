import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Banner from "@/lib/models/banner";

export async function GET() {
  try {
    await connectToDatabase();
    const banners = await Banner.find({}).sort({ priority: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const banner = await Banner.create(body);
    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
