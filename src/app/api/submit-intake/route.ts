import { NextRequest, NextResponse } from 'next/server';
import { calculateCommission } from '@/lib/commission';

// Direct Airtable API functions
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

const createAirtableRecord = async (tableName: string, fields: any) => {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Airtable configuration missing');
  }
  
  // Clean the API key of any whitespace/newlines
  const cleanApiKey = AIRTABLE_API_KEY.trim().replace(/\s+/g, '');
  
  if (!cleanApiKey.startsWith('pat')) {
    throw new Error('Invalid API key format - should start with "pat"');
  }

  const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cleanApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.id;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.items || formData.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create client in Airtable
    const clientId = await createAirtableRecord('Clients', {
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
    });

    // Create items in Airtable
    const itemIds: string[] = [];
    for (const item of formData.items) {
      const commission = calculateCommission(item.estimatedValue, item.isSpecialty);
      
      const itemId = await createAirtableRecord('Items', {
        'Title': item.title,
        'Description': item.description,
        'Estimated Value': item.estimatedValue,
        'Category': item.category,
        'Is Specialty': item.isSpecialty,
        'Photos': '', // Will be handled separately
        'Status': 'pending',
        'Consigned Date': new Date().toISOString(),
        'Commission': commission.commission,
        'Client': [clientId]
      });
      
      itemIds.push(itemId);
    }

    // Create contract record
    const contractId = await createAirtableRecord('Contracts', {
      'Client': [clientId],
      'Items': itemIds,
      'Commission Rules': JSON.stringify(formData.items.map((item: any) => ({
        itemTitle: item.title,
        commission: calculateCommission(item.estimatedValue, item.isSpecialty)
      }))),
      'Created Date': new Date().toISOString(),
      'Signature': '',
      'PDF URL': ''
    });

    return NextResponse.json({
      success: true,
      clientId,
      itemIds,
      contractId
    });

  } catch (error) {
    console.error('Intake submission error:', error);
    
    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to submit intake form. Please try again.',
        debug: errorMessage,
        hasBaseId: !!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
        hasApiKey: !!process.env.AIRTABLE_API_KEY
      },
      { status: 500 }
    );
  }
}