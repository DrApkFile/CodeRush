// app/api/test-cloudinary/route.ts
import { NextResponse } from "next/server";
import cloudinary from "../../../lib/cloudinary";

export async function GET() {
  try {
    const result = await cloudinary.api.ping();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message });
  }
}