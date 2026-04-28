import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
const { jsPDF } = require('jspdf');

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { 
      contractToken, 
      signatureData, 
      clientInfo,
      consentGiven,
      timestamp,
      ipAddress 
    } = await request.json();

    if (!contractToken || !signatureData || !consentGiven) {
      return NextResponse.json(
        { error: 'Missing required signature data' },
        { status: 400 }
      );
    }

    // Decode and validate contract token
    let tokenData;
    try {
      const decoded = Buffer.from(contractToken, 'base64').toString();
      tokenData = JSON.parse(decoded);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid contract token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (Date.now() > tokenData.expires) {
      return NextResponse.json(
        { error: 'Contract link has expired' },
        { status: 400 }
      );
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;

    // Fetch client data for PDF generation
    const clientResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Clients/${tokenData.clientId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    const clientData = await clientResponse.json();
    const client = clientData.fields;

    // Generate PDF contract
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text('KPC Vault Consignment Agreement', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text('Contact: 760-278-3132 | Dana@kpcvault.org', pageWidth / 2, yPos, { align: 'center' });
    yPos += 30;

    // Client Information
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text('Client Information', 20, yPos);
    yPos += 15;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Name: ${client['First Name']} ${client['Last Name']}`, 20, yPos);
    yPos += 8;
    pdf.text(`Phone: ${client['Phone']}`, 20, yPos);
    yPos += 8;
    pdf.text(`Email: ${client['Email']}`, 20, yPos);
    yPos += 8;
    pdf.text(`Address: ${client['Street']}, ${client['City']}, ${client['State']} ${client['Zip Code']}`, 20, yPos);
    yPos += 8;
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 20;

    // Contract Terms (abbreviated for PDF - full terms would be longer)
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text('Consignment Agreement Terms', 20, yPos);
    yPos += 15;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const terms = [
      'This agreement establishes a consignment relationship between the consignor and KPC Vault.',
      'Commission: KPC Vault retains 33% of gross sale price, consignor receives 67%.',
      'Payment: Within 30 days after sale completion and return window closure.',
      'The consignor confirms ownership and authenticity of all consigned items.',
      'California Electronic Transactions Act (Civil Code Section 1633) governs this digital signature.',
      '',
      'Full terms and conditions as detailed in the complete agreement are incorporated by reference.'
    ];

    terms.forEach(term => {
      if (term === '') {
        yPos += 5;
      } else {
        const lines = pdf.splitTextToSize(term, pageWidth - 40);
        pdf.text(lines, 20, yPos);
        yPos += lines.length * 5 + 3;
      }
    });

    // Signature Section
    yPos += 20;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('Digital Signature', 20, yPos);
    yPos += 15;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Signed by: ${client['First Name']} ${client['Last Name']}`, 20, yPos);
    yPos += 8;
    pdf.text(`Date: ${new Date(timestamp).toLocaleDateString()}`, 20, yPos);
    yPos += 8;
    pdf.text(`Time: ${new Date(timestamp).toLocaleTimeString()}`, 20, yPos);
    yPos += 8;
    pdf.text(`IP Address: ${ipAddress}`, 20, yPos);
    yPos += 8;
    pdf.text('Electronic consent given: Yes', 20, yPos);
    yPos += 15;

    // Add signature image if provided
    if (signatureData) {
      try {
        pdf.text('Digital Signature:', 20, yPos);
        yPos += 10;
        // Add signature image to PDF
        pdf.addImage(signatureData, 'PNG', 20, yPos, 120, 30);
      } catch (error) {
        console.error('Error adding signature to PDF:', error);
      }
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    const pdfBase64 = pdfBuffer.toString('base64');

    // Upload signed contract to Airtable
    await fetch(`https://api.airtable.com/v0/${baseId}/Clients/${tokenData.clientId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Contract Status': 'signed',
          'Contract Signed Date': new Date().toISOString().split('T')[0],
          'Signature Data': signatureData,
          'Contract PDF': [{
            filename: `contract_${client['First Name']}_${client['Last Name']}_${Date.now()}.pdf`,
            content: pdfBase64,
            contentType: 'application/pdf'
          }]
        }
      })
    });

    // Send email notifications
    const clientEmail = {
      from: 'contracts@kpcvault.org',
      to: client['Email'],
      subject: 'Your KPC Vault Consignment Agreement',
      html: `
        <h2>Thank you for signing your consignment agreement!</h2>
        <p>Dear ${client['First Name']},</p>
        <p>Your consignment agreement has been successfully signed and processed. Please find your copy attached.</p>
        <p>We'll keep you updated on the status of your items.</p>
        <p>Best regards,<br>KPC Vault Team<br>760-278-3132</p>
      `,
      attachments: [{
        filename: `KPC_Vault_Contract_${Date.now()}.pdf`,
        content: pdfBase64,
        contentType: 'application/pdf'
      }]
    };

    const adminEmail = {
      from: 'contracts@kpcvault.org',
      to: 'dana@kpcvault.org',
      subject: `New Contract Signed: ${client['First Name']} ${client['Last Name']}`,
      html: `
        <h2>Contract Signed</h2>
        <p>Client: ${client['First Name']} ${client['Last Name']}</p>
        <p>Email: ${client['Email']}</p>
        <p>Phone: ${client['Phone']}</p>
        <p>Signed at: ${new Date(timestamp).toLocaleString()}</p>
        <p>View client in Airtable or check your admin dashboard for details.</p>
      `,
      attachments: [{
        filename: `KPC_Vault_Contract_${Date.now()}.pdf`,
        content: pdfBase64,
        contentType: 'application/pdf'
      }]
    };

    // Send emails
    await Promise.all([
      resend.emails.send(clientEmail),
      resend.emails.send(adminEmail)
    ]);

    return NextResponse.json({
      success: true,
      message: 'Contract signed successfully! PDF copies have been sent to both parties.'
    });

  } catch (error) {
    console.error('Contract signing error:', error);
    return NextResponse.json(
      { error: 'Failed to process contract signature' },
      { status: 500 }
    );
  }
}