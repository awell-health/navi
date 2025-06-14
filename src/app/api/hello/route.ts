import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  console.log('Hello from Edge Runtime!', request.headers);
  return NextResponse.json({
    message: 'Hello from Edge Runtime!',
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION || 'development',
  });
} 