import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import Airtable from 'airtable';
import { generateMagicToken, createMagicLinkUrl } from '@/lib/auth';

const resend = new Resend(process.env.RESEND_API_KEY);
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';

function getBase() {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Airtable not configured');
  }
  return new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find client by email in Airtable
    const base = getBase();
    const records = await base('Clients')
      .select({
        filterByFormula: `LOWER({Email}) = '${email.toLowerCase()}'`,
        maxRecords: 1
      })
      .all();

    if (records.length === 0) {
      return NextResponse.json({ 
        error: 'No account found with this email address. Please contact KPC Vault to set up your account.' 
      }, { status: 404 });
    }

    const clientRecord = records[0];
    const clientId = clientRecord.id;
    const firstName = (clientRecord.fields['First Name'] as string) || '';
    const lastName = (clientRecord.fields['Last Name'] as string) || '';

    // Generate magic token
    const token = generateMagicToken(clientId, email);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';
    const magicLink = createMagicLinkUrl(token, baseUrl);

    // Send magic link email
    try {
      await resend.emails.send({
        from: 'KPC Vault <noreply@kpcvault.com>',
        to: [email],
        subject: 'Access Your KPC Vault Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e3a8a; margin: 0;">KPC Vault</h1>
              <p style="color: #6b7280; margin: 5px 0;">Premier Consignment Services</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 8px; border-left: 4px solid #d4af37;">
              <h2 style="color: #1f2937; margin-top: 0;">Welcome back, ${firstName}!</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                Click the link below to securely access your KPC Vault consignment portal. 
                You'll be able to view your items, track sales, and see your earnings.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" 
                   style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 14px 28px; 
                          text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Access My Account
                </a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border: 1px solid #f59e0b; margin-top: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Security Notice:</strong> This link expires in 15 minutes and can only be used once. 
                  If you didn't request this login, please ignore this email.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                Having trouble? Contact us at 
                <a href="mailto:support@kpcvault.com" style="color: #3b82f6;">support@kpcvault.com</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} KPC Vault. All rights reserved.</p>
            </div>
          </div>
        `
      });

      return NextResponse.json({ 
        success: true, 
        message: `Magic link sent to ${email}. Check your inbox!` 
      });
      
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json({ 
        error: 'Failed to send email. Please try again.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Magic link request error:', error);
    return NextResponse.json({ 
      error: 'Server error. Please try again.' 
    }, { status: 500 });
  }
}