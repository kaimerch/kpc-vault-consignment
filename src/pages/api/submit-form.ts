import { NextApiRequest, NextApiResponse } from 'next';

// Direct Airtable submission using Pages API (old format that works)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // Environment variables
    const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    
    if (!baseId || !apiKey) {
      return res.status(500).json({
        error: 'Environment variables missing',
        hasBaseId: !!baseId,
        hasApiKey: !!apiKey
      });
    }

    // Create client record
    const clientResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'First Name': formData.firstName,
          'Last Name': formData.lastName,
          'Email': formData.email,
          'Phone': formData.phone,
          'Street': formData.address.street,
          'City': formData.address.city,
          'State': formData.address.state,
          'Zip Code': formData.address.zipCode,
          'Total Earnings': 0,
          'Created Date': new Date().toISOString()
        }
      })
    });

    if (!clientResponse.ok) {
      const errorText = await clientResponse.text();
      return res.status(500).json({
        error: 'Failed to create client',
        details: errorText,
        status: clientResponse.status
      });
    }

    const clientData = await clientResponse.json();
    const clientId = clientData.id;

    // Create items
    const itemIds = [];
    for (const item of formData.items) {
      // Calculate commission
      const estimatedValue = item.estimatedValue || 0;
      const isSpecialty = item.isSpecialty || false;
      
      let commissionRate = 0.33; // default 33%
      if (isSpecialty) {
        commissionRate = 0.35; // 35% for specialty
      } else if (estimatedValue >= 500) {
        commissionRate = 0.25; // 25% for high value
      } else if (estimatedValue < 100) {
        commissionRate = 0.40; // 40% for low value
      }
      
      const commission = estimatedValue * commissionRate;
      
      const itemResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Title': item.title,
            'Description': item.description,
            'Estimated Value': estimatedValue,
            'Category': item.category,
            'Is Specialty': isSpecialty,
            'Photos': '',
            'Status': 'pending',
            'Consigned Date': new Date().toISOString(),
            'Commission': commission,
            'Client': [clientId]
          }
        })
      });

      if (!itemResponse.ok) {
        const errorText = await itemResponse.text();
        return res.status(500).json({
          error: 'Failed to create item',
          details: errorText,
          status: itemResponse.status
        });
      }

      const itemData = await itemResponse.json();
      itemIds.push(itemData.id);
    }

    // Success
    return res.status(200).json({
      success: true,
      clientId,
      itemIds,
      message: 'Application submitted successfully!'
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}