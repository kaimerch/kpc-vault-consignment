import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch clients
    const clientsResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Clients`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    if (!clientsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      );
    }

    const clientsData = await clientsResponse.json();

    // Fetch items
    const itemsResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Items`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    if (!itemsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch items' },
        { status: 500 }
      );
    }

    const itemsData = await itemsResponse.json();

    return NextResponse.json({
      success: true,
      clients: clientsData.records,
      items: itemsData.records
    });

  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}

// Simple password protection for demo
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // In production, use proper authentication
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If password is correct, return the same data as GET
    return GET(request);

  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}