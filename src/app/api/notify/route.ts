import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import Airtable from 'airtable';

const resend = new Resend(process.env.RESEND_API_KEY);
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const NOTIFY_SECRET = process.env.NOTIFY_SECRET || '';

function getBase() {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Airtable not configured');
  }
  return new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export async function POST(request: NextRequest) {
  try {
    // Validate secret to prevent unauthorized calls
    const secret = request.headers.get('x-notify-secret');
    if (NOTIFY_SECRET && secret !== NOTIFY_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, itemTitle, soldPrice, clientPayout, commission, clientId, event } = body;

    if (!clientId || !event) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const base = getBase();

    // Look up client
    const clientRecord = await base('Clients').find(clientId);
    const firstName = (clientRecord.fields['First Name'] as string) || '';
    const lastName = (clientRecord.fields['Last Name'] as string) || '';
    const email = (clientRecord.fields['Email'] as string) || '';

    if (!email) {
      return NextResponse.json({ error: 'Client has no email' }, { status: 400 });
    }

    // Build notification message
    let subject = '';
    let notificationTitle = '';
    let notificationMessage = '';
    let emailHtml = '';

    if (event === 'item_sold') {
      subject = `Great news! Your item sold — ${formatCurrency(clientPayout || 0)} is yours`;
      notificationTitle = `"${itemTitle}" has sold!`;
      notificationMessage = `Your item sold for ${formatCurrency(soldPrice || 0)}. After commission, your payout is ${formatCurrency(clientPayout || 0)}.`;

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; margin: 0;">KPC Vault</h1>
            <p style="color: #6b7280; margin: 5px 0;">Premier Consignment Services</p>
          </div>

          <div style="background: #f0fdf4; padding: 30px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <h2 style="color: #15803d; margin-top: 0;">🎉 Your item just sold, ${firstName}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Great news — <strong>${itemTitle}</strong> has been sold. Here's your breakdown:
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Sale Price</td>
                  <td style="padding: 8px 0; text-align: right; color: #1f2937;">${formatCurrency(soldPrice || 0)}</td>
                </tr>
                <tr style="border-top: 1px solid #f3f4f6;">
                  <td style="padding: 8px 0; color: #6b7280;">Commission</td>
                  <td style="padding: 8px 0; text-align: right; color: #dc2626;">-${formatCurrency(commission || 0)}</td>
                </tr>
                <tr style="border-top: 2px solid #22c55e;">
                  <td style="padding: 12px 0; font-weight: bold; color: #15803d; font-size: 16px;">Your Payout</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #15803d; font-size: 18px;">${formatCurrency(clientPayout || 0)}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kpc-vault-consignment.vercel.app'}/portal"
                 style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 14px 28px;
                        text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View My Portal
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; text-align: center;">
              Questions? Contact us at <a href="mailto:support@kpcvault.org" style="color: #3b82f6;">support@kpcvault.org</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} KPC Vault. All rights reserved.</p>
          </div>
        </div>
      `;
    }

    // Send email
    await resend.emails.send({
      from: 'KPC Vault <noreply@contact.kpcvault.org>',
      to: [email],
      subject,
      html: emailHtml
    });

    // Log notification to Airtable Notifications table
    try {
      await base('Notifications').create([{
        fields: {
          'Title': notificationTitle,
          'Message': notificationMessage,
          'Client': [clientId],
          'Event Type': event,
          'Read': false
        }
      }]);
    } catch (e) {
      // Don't fail if Notifications table doesn't exist yet
      console.warn('Could not log notification to Airtable:', e);
    }

    return NextResponse.json({ success: true, message: `Notification sent to ${email}` });

  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
