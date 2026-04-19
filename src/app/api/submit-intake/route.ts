import { NextRequest, NextResponse } from 'next/server';
import { AirtableService } from '@/lib/airtable';
import { calculateCommission } from '@/lib/commission';

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
    const clientId = await AirtableService.createClient({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address
    });

    // Create items in Airtable
    const itemIds: string[] = [];
    for (const item of formData.items) {
      const commission = calculateCommission(item.estimatedValue, item.isSpecialty);
      
      const itemData = {
        title: item.title,
        description: item.description,
        estimatedValue: item.estimatedValue,
        category: item.category,
        isSpecialty: item.isSpecialty,
        photos: [], // Photos will be handled separately
        status: 'pending' as const,
        consignedDate: new Date(),
        commission: commission.commission
      };

      const itemId = await AirtableService.createItem(itemData, clientId);
      itemIds.push(itemId);
    }

    // Create contract record
    const contractId = await AirtableService.createContract({
      clientId,
      itemIds,
      commissionRules: formData.items.map((item: any) => ({
        itemTitle: item.title,
        commission: calculateCommission(item.estimatedValue, item.isSpecialty)
      })),
      createdDate: new Date(),
      signature: '',
      pdfUrl: ''
    });

    return NextResponse.json({
      success: true,
      clientId,
      itemIds,
      contractId
    });

  } catch (error) {
    console.error('Intake submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit intake form. Please try again.' },
      { status: 500 }
    );
  }
}