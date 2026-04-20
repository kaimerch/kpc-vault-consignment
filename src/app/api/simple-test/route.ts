import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Simple test working',
    timestamp: new Date().toISOString(),
    baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
    hasApiKey: !!process.env.AIRTABLE_API_KEY
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'POST test working',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'POST test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}