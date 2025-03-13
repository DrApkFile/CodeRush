import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: 'code-rush-profiles',
  });
} 