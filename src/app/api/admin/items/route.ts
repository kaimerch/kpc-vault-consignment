import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { itemId, status } = await request.json();

    if (!itemId || !status) {
      return NextResponse.json({ error: 'Missing itemId or status' }, { status: 400 });
    }

    const validStatuses = ['pending', 'listed', 'sold', 'returned'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: { 'Status': status }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Airtable update failed:', err);
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, item: data });

  } catch (error) {
    console.error('Item update error:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
