import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';

function getBase() {
  return new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
}

export async function POST(request: NextRequest) {
  try {
    const { notificationId } = await request.json();
    if (!notificationId) return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });

    const base = getBase();
    await base('Notifications').update(notificationId, { 'Read': true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
