// Simple form submission API
export default async function handler(req, res) {
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
        debug: `BaseID: ${!!baseId}, ApiKey: ${!!apiKey}`
      });
    }

    // Create client in Airtable
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
        error: 'Airtable client creation failed',
        status: clientResponse.status,
        details: errorText
      });
    }

    const clientData = await clientResponse.json();
    
    return res.status(200).json({
      success: true,
      clientId: clientData.id,
      message: 'Form submitted successfully!'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
}