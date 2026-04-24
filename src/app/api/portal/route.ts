import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';

function getBase() {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Airtable not configured');
  }
  return new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
  }

  try {
    const base = getBase();

    // Fetch client
    let client = null;
    try {
      const record = await base('Clients').find(clientId);
      client = {
        id: record.id,
        firstName: ((record.fields['First Name'] as string) || '').trim(),
        lastName: ((record.fields['Last Name'] as string) || '').trim(),
        email: (record.fields['Email'] as string) || '',
        phone: (record.fields['Phone'] as string) || '',
        address: {
          street: ((record.fields['Street'] as string) || '').trim(),
          city: (record.fields['City'] as string) || '',
          state: (record.fields['State'] as string) || '',
          zipCode: (record.fields['Zip Code'] as string) || ''
        },
        items: [],
        totalEarnings: (record.fields['Total Earnings'] as number) || 0
      };
    } catch {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Fetch items for this client
    let items: any[] = [];
    try {
      const itemRecords = await base('Items')
        .select({
          filterByFormula: `FIND('${clientId}', ARRAYJOIN({Client}))`,
          sort: [{ field: 'Consigned Date', direction: 'desc' }]
        })
        .all();

      items = itemRecords.map((record: any) => ({
        id: record.id,
        title: (record.fields['Title'] as string) || '',
        description: (record.fields['Description'] as string) || '',
        estimatedValue: (record.fields['Estimated Value'] as number) || 0,
        category: (record.fields['Category'] as string) || '',
        isSpecialty: (record.fields['Is Specialty'] as boolean) || false,
        photos: record.fields['Photos']
          ? (record.fields['Photos'] as string).split(', ').filter((url: string) => url.trim())
          : [],
        status: (record.fields['Status'] as string) || 'pending',
        consignedDate: record.fields['Consigned Date'] || null,
        soldDate: record.fields['Sold Date'] || null,
        soldPrice: (record.fields['Sold Price'] as number) || undefined,
        commission: (record.fields['Commission'] as number) || undefined
      }));
    } catch (e) {
      console.error('Error fetching items:', e);
    }

    // Fetch sales for this client
    let sales: any[] = [];
    try {
      const saleRecords = await base('Sales')
        .select({
          filterByFormula: `FIND('${clientId}', ARRAYJOIN({Client}))`,
          sort: [{ field: 'Sale Date', direction: 'desc' }]
        })
        .all();

      sales = saleRecords.map((record: any) => ({
        id: record.id,
        itemId: (record.fields['Item'] as string[])?.[0] || '',
        clientId: (record.fields['Client'] as string[])?.[0] || '',
        salePrice: (record.fields['Sale Price'] as number) || 0,
        commission: (record.fields['Commission'] as number) || 0,
        clientPayout: (record.fields['Client Payout'] as number) || 0,
        saleDate: record.fields['Sale Date'] || null,
        paymentStatus: (record.fields['Payment Status'] as string) || 'pending'
      }));
    } catch (e) {
      console.error('Error fetching sales:', e);
    }

    return NextResponse.json({ client, items, sales });
  } catch (error) {
    console.error('Portal API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
