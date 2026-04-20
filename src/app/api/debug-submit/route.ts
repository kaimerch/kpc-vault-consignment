import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Log everything for debugging
    console.log('Form data received:', formData);
    
    const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    
    // Check environment variables
    if (!baseId || !apiKey) {
      return NextResponse.json({
        error: 'Environment variables missing',
        hasBaseId: !!baseId,
        hasApiKey: !!apiKey,
        baseIdValue: baseId,
        formData: formData
      });
    }
    
    // Test creating just a client record
    const clientResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim().replace(/\s+/g, '')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'First Name': formData.firstName || 'Test',
          'Last Name': formData.lastName || 'User',
          'Email': formData.email || 'test@example.com',
          'Phone': formData.phone || '555-1234',
          'Street': formData.address?.street || 'Test St',
          'City': formData.address?.city || 'Test City',
          'State': formData.address?.state || 'CA',
          'Zip Code': formData.address?.zipCode || '12345',
          'Total Earnings': 0,
          'Created Date': new Date().toISOString()
        }
      })
    });
    
    if (!clientResponse.ok) {
      const errorText = await clientResponse.text();
      return NextResponse.json({
        error: 'Client creation failed',
        status: clientResponse.status,
        errorText: errorText,
        requestBody: JSON.stringify({
          fields: {
            'First Name': formData.firstName,
            'Last Name': formData.lastName,
            'Email': formData.email
          }
        })
      });
    }
    
    const clientData = await clientResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      clientId: clientData.id,
      formDataReceived: !!formData
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Debug test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
  }
}