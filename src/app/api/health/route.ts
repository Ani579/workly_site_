import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ ok: true, db: "connected" });
  } catch (error: any) {
    console.error("Health check error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

