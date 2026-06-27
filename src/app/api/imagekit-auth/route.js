// src/app/api/imagekit-auth/route.js
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "", // ⚠️ KEEP THIS PRIVATE (No NEXT_PUBLIC_)
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function GET() {
  try {
    // Generate fresh ephemeral upload parameters
    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate auth tokens" }, { status: 500 });
  }
}