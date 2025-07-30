import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    wahaUrl: process.env.NEXT_PUBLIC_WAHA_BASE_URL,
    wahaSession: process.env.NEXT_PUBLIC_WAHA_SESSION,
    openaiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'SET' : 'NOT_SET',
    geminiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'SET' : 'NOT_SET',
    devMode: process.env.NEXT_PUBLIC_DEV_MODE,
    timestamp: new Date().toISOString()
  });
} 