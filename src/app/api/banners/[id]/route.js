import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Banner from "@/lib/models/banner";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const banner = await Banner.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const banner = await Banner.findByIdAndDelete(params.id);
    if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
