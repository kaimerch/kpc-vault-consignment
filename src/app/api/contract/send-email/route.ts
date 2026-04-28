import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { clientData, contractUrl } = await request.json();

    if (!clientData || !contractUrl) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Send contract email to client
    const clientEmail = {
      from: 'noreply@contact.kpcvault.org',
      to: clientData.email,
      subject: 'Your KPC Vault Consignment Agreement - Ready to Sign',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <!-- Header -->
          <div style="text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">KPC Vault</h1>
            <p style="color: #666; margin: 5px 0 0 0;">760-278-3132 | Dana@kpcvault.org</p>
          </div>

          <!-- Main Content -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Your Consignment Agreement is Ready!</h2>
            
            <p>Dear ${clientData.name.split(' ')[0]},</p>
            
            <p>Thank you for choosing KPC Vault for your consignment needs. Your personalized consignment agreement is now ready for your digital signature.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2563eb;">Quick Reminder - Our Terms:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>33% commission</strong> to KPC Vault, <strong>67% to you</strong></li>
                <li>Payment within <strong>30 days</strong> after your item sells</li>
                <li>Professional photography and marketing included</li>
                <li>Regular updates on pricing and sales progress</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${contractUrl}" 
                 style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                📝 Review & Sign Contract
              </a>
            </div>
            
            <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #065f46;">🔒 Secure Digital Signing</h4>
              <p style="margin-bottom: 0; color: #065f46; font-size: 14px;">Your contract uses California-compliant electronic signatures. The process takes just 2-3 minutes and you'll receive a PDF copy immediately after signing.</p>
            </div>
          </div>

          <!-- What's Next Section -->
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <h3 style="color: #333;">What happens after you sign?</h3>
            <ol style="color: #666; line-height: 1.6;">
              <li><strong>Item Processing:</strong> We'll photograph and research your items</li>
              <li><strong>Market Listing:</strong> Items go live on appropriate platforms</li>
              <li><strong>Sales Updates:</strong> Regular communication about pricing and interest</li>
              <li><strong>Fast Payment:</strong> Money in your account within 30 days of sale</li>
            </ol>
          </div>

          <!-- Questions Section -->
          <div style="background-color: #fef7ed; border: 1px solid #fb923c; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #c2410c;">Questions? We're Here to Help!</h4>
            <p style="margin-bottom: 0; color: #c2410c;">
              📞 <a href="tel:760-278-3132" style="color: #c2410c;">760-278-3132</a><br>
              📧 <a href="mailto:dana@kpcvault.org" style="color: #c2410c;">dana@kpcvault.org</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
            <p><strong>Important:</strong> This contract link expires in 24 hours for security. If you need a new link, just give us a call.</p>
            <p style="margin-top: 15px;">
              <strong>KPC Vault</strong><br>
              Professional Consignment Services<br>
              Licensed • Insured • Trusted
            </p>
          </div>
        </div>
      `
    };

    // Send notification to admin
    const adminEmail = {
      from: 'noreply@contact.kpcvault.org',
      to: 'dana@kpcvault.org',
      subject: `📧 Contract Sent: ${clientData.name}`,
      html: `
        <h3>Contract Email Sent</h3>
        <p><strong>Client:</strong> ${clientData.name}</p>
        <p><strong>Email:</strong> ${clientData.email}</p>
        <p><strong>Phone:</strong> ${clientData.phone}</p>
        <p><strong>Contract URL:</strong> <a href="${contractUrl}">${contractUrl}</a></p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        
        <hr>
        <p><em>The client has 24 hours to sign before the link expires. You can generate a new contract from the admin dashboard if needed.</em></p>
      `
    };

    // Send both emails with detailed logging
    console.log('Sending client email to:', clientData.email);
    console.log('From address:', clientEmail.from);
    
    const [clientResult, adminResult] = await Promise.all([
      resend.emails.send(clientEmail),
      resend.emails.send(adminEmail)
    ]);
    
    console.log('Client email result:', clientResult);
    console.log('Admin email result:', adminResult);

    return NextResponse.json({
      success: true,
      message: 'Contract email sent successfully',
      clientResult,
      adminResult
    });

  } catch (error) {
    console.error('Email sending error details:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        error: 'Failed to send contract email',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}