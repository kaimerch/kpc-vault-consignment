import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { clientId, itemIds } = await request.json();

    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch client data
    const clientResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Clients/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    if (!clientResponse.ok) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const clientData = await clientResponse.json();
    const client = clientData.fields;

    // Fetch items data
    const itemsData = [];
    for (const itemId of itemIds) {
      const itemResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });
      
      if (itemResponse.ok) {
        const itemData = await itemResponse.json();
        itemsData.push(itemData.fields);
      }
    }

    // Generate contract token for security
    const contractToken = Buffer.from(JSON.stringify({
      clientId,
      itemIds,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64');

    // Update client with contract token
    await fetch(`https://api.airtable.com/v0/${baseId}/Clients/${clientId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Contract Token': contractToken,
          'Contract Status': 'pending'
        }
      })
    });

    // Create contract URL
    const contractUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contract/${contractToken}`;

    return NextResponse.json({
      success: true,
      contractToken,
      contractUrl,
      clientData: {
        name: `${client['First Name']} ${client['Last Name']}`,
        email: client['Email'],
        phone: client['Phone'],
        address: `${client['Street']}, ${client['City']}, ${client['State']} ${client['Zip Code']}`,
      },
      itemsData: itemsData.map(item => ({
        title: item['Title'],
        description: item['Description'],
        estimatedValue: item['Estimated Value']
      }))
    });

  } catch (error) {
    console.error('Contract generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate contract' },
      { status: 500 }
    );
  }
}