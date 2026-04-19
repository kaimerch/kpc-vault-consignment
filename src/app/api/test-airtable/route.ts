import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    
    if (!baseId || !apiKey) {
      return NextResponse.json({
        error: 'Environment variables missing',
        hasBaseId: !!baseId,
        hasApiKey: !!apiKey
      });
    }

    // Test direct Airtable API call
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Clients?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'Airtable API error',
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Airtable connection working',
      recordCount: data.records?.length || 0,
      baseId: baseId,
      hasApiKey: !!apiKey
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}