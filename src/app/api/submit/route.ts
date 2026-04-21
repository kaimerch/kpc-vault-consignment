import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create client record
    const clientResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'First Name': formData.firstName,
          'Last Name': formData.lastName,
          'Email': formData.email,
          'Phone': formData.phone,
          'Street': formData.address?.street || '',
          'City': formData.address?.city || ''
        },
        typecast: true
      })
    });

    if (!clientResponse.ok) {
      const errorText = await clientResponse.text();
      console.error('Client creation failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to create client record' },
        { status: 500 }
      );
    }

    const clientData = await clientResponse.json();
    const clientId = clientData.id;

    // Create items
    const itemIds: string[] = [];
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];

      // Calculate commission
      const estimatedValue = item.estimatedValue || 0;
      let commissionRate = 0.33;
      if (item.isSpecialty) {
        commissionRate = 0.35;
      } else if (estimatedValue >= 500) {
        commissionRate = 0.25;
      } else if (estimatedValue < 100) {
        commissionRate = 0.40;
      }
      const commission = estimatedValue * commissionRate;

      const itemResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Title': item.title,
            'Description': item.description,
            'Estimated Value': estimatedValue,
            'Commission': commission,
            'Is Specialty': item.isSpecialty || false,
            'Status': 'pending',
            'Consigned Date': new Date().toISOString().split('T')[0],
            'Client': [clientId]
          },
          typecast: true
        })
      });

      if (!itemResponse.ok) {
        const errorText = await itemResponse.text();
        console.error(`Item ${i + 1} creation failed:`, errorText);
        return NextResponse.json(
          { error: `Failed to create item ${i + 1}` },
          { status: 500 }
        );
      }

      const itemData = await itemResponse.json();
      itemIds.push(itemData.id);
    }

    return NextResponse.json({
      success: true,
      clientId,
      itemIds,
      message: 'Application submitted successfully!'
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}