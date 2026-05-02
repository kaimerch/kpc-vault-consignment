import { NextRequest, NextResponse } from 'next/server';

function calcCommission(soldPrice: number, isSpecialty: boolean) {
  let rate = 0.33;
  if (isSpecialty) rate = 0.35;
  else if (soldPrice >= 500) rate = 0.25;
  else if (soldPrice < 100) rate = 0.40;
  const commission = soldPrice * rate;
  const clientPayout = soldPrice - commission;
  return { commission, clientPayout, rate };
}

export async function PATCH(request: NextRequest) {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { itemId, status, soldPrice, isSpecialty } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const fields: Record<string, unknown> = {};

    if (status) {
      const validStatuses = ['pending', 'listed', 'sold', 'returned'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      fields['Status'] = status;
    }

    if (soldPrice != null) {
      const { commission, clientPayout } = calcCommission(soldPrice, isSpecialty ?? false);
      fields['Sold Price'] = soldPrice;
      fields['Commission'] = commission;
      fields['Client Payout'] = clientPayout;
    }

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields, typecast: true })
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
