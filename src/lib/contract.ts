import jsPDF from 'jspdf';
import { Client, Item, CommissionRule, Contract } from '@/types';
import { calculateCommission, formatCurrency, COMMISSION_RULES } from './commission';

interface ContractData {
  client: Client;
  items: Item[];
  contractDate: Date;
  signature?: string;
}

export class ContractGenerator {
  static generateContract(data: ContractData): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CONSIGNMENT AGREEMENT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Agreement Date: ${data.contractDate.toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Company Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('KPC Vault Consignment', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Consignment Services', margin, yPosition);
    yPosition += 5;
    doc.text('Email: contact@kpcvault.com', margin, yPosition);
    yPosition += 5;
    doc.text('Phone: (555) 123-4567', margin, yPosition);
    yPosition += 15;

    // Client Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Consignor Information:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${data.client.firstName} ${data.client.lastName}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Email: ${data.client.email}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Phone: ${data.client.phone}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Address: ${data.client.address.street}`, margin, yPosition);
    yPosition += 5;
    doc.text(`${data.client.address.city}, ${data.client.address.state} ${data.client.address.zipCode}`, margin, yPosition);
    yPosition += 20;

    // Commission Structure
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Commission Structure:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    COMMISSION_RULES.forEach(rule => {
      let ruleText = `• ${rule.description}: ${rule.percentage}%`;
      if (rule.minValue && rule.maxValue) {
        ruleText += ` (${formatCurrency(rule.minValue)} - ${formatCurrency(rule.maxValue)})`;
      } else if (rule.minValue) {
        ruleText += ` (${formatCurrency(rule.minValue)}+)`;
      } else if (rule.maxValue) {
        ruleText += ` (under ${formatCurrency(rule.maxValue)})`;
      }
      doc.text(ruleText, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Items
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Consigned Items:', margin, yPosition);
    yPosition += 10;

    let totalValue = 0;
    let totalCommission = 0;
    let totalPayout = 0;

    data.items.forEach((item, index) => {
      const calc = calculateCommission(item.estimatedValue, item.isSpecialty);
      totalValue += item.estimatedValue;
      totalCommission += calc.commission;
      totalPayout += calc.clientPayout;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${item.title}`, margin, yPosition);
      yPosition += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Category: ${item.category}`, margin + 5, yPosition);
      yPosition += 4;
      doc.text(`Estimated Value: ${formatCurrency(item.estimatedValue)}`, margin + 5, yPosition);
      yPosition += 4;
      doc.text(`Commission Rate: ${calc.percentage}% (${calc.rule.description})`, margin + 5, yPosition);
      yPosition += 4;
      doc.text(`KPC Vault Commission: ${formatCurrency(calc.commission)}`, margin + 5, yPosition);
      yPosition += 4;
      doc.text(`Your Payout if Sold: ${formatCurrency(calc.clientPayout)}`, margin + 5, yPosition);
      yPosition += 8;

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }
    });

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Estimated Value: ${formatCurrency(totalValue)}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Total Commission (if all items sell): ${formatCurrency(totalCommission)}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Total Payout to You (if all items sell): ${formatCurrency(totalPayout)}`, margin, yPosition);
    yPosition += 15;

    // Full Consignment Agreement Terms
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Full Consignment Agreement:', margin, yPosition);
    yPosition += 10;

    const terms = [
      '1. PURPOSE: Consignor appoints KPC Vault to market and sell the personal property described in this Agreement on a consignment basis.',
      
      '2. DESCRIPTION OF GOODS: This Agreement covers the items listed above, along with any accessories, parts, or related materials. By signing, you confirm that you are the rightful owner of these items, that no one else has a claim to them, that they are authentic to the best of your knowledge, and that you obtained them legally.',
      
      '3. TERM: This Agreement begins on the date signed and continues until the Goods are sold, returned, or this Agreement is otherwise terminated. The parties may extend the arrangement by written agreement.',
      
      '4. PRICING & SALES AUTHORITY: KPC Vault may determine the initial listing price, sales platform, listing format, and pricing adjustments based on market conditions unless specific pricing limits are selected. Consignor authorizes reasonable markdowns if discount permission or an automatic price-drop timeline is approved.',
      
      '5. COMMISSION & PAYMENT: KPC Vault shall retain 33% of the gross sale price as commission, and Consignor shall receive 67% of the gross sale price, less any agreed deductions such as approved shipping, handling, storage, or platform-related charges. Payment to Consignor will be issued no later than 30 days after the item sells, after the applicable buyer return window has closed and sale funds are secured.',
      
      '6. RETURNS & CHARGEBACKS: If a buyer returns the item, files a payment dispute, or initiates a chargeback, the sale will be treated as incomplete until resolved. KPC Vault may withhold, delay, adjust, or reverse any payout connected to that transaction. Consignor accepts the risk of buyer returns and platform disputes to the extent permitted by law.',
      
      '7. FEES: Storage fees may apply to unsold or unclaimed Goods remaining in KPC Vault\'s possession beyond a designated grace period. If storage fees apply, the grace period length, fee amount, and billing frequency will be specified in the Item Intake section. Storage fees not documented in the intake section do not apply. Consignor will be notified before storage charges begin.',
      
      '8. RISK OF LOSS & INSURANCE: KPC Vault will use reasonable care in handling the Goods. Risk of loss remains with Consignor unless loss or damage is caused by KPC Vault\'s gross negligence or willful misconduct. KPC Vault does not provide insurance unless explicitly agreed in writing.',
      
      '9. UNSOLD & UNCLAIMED PROPERTY: If the Goods remain unsold or if this Agreement is terminated, KPC Vault will notify the Consignor in writing that the Goods are available for pickup. Consignor must retrieve the Goods within 14 days of that notice. If Goods are not retrieved within the 14-day pickup window, storage fees may begin to apply. If Goods remain unclaimed for 30 or more days after the initial retrieval notice, KPC Vault may sell, donate, or dispose of the Goods to recover any outstanding costs, as permitted by applicable California law.',
      
      '10. TERMINATION: Either party may terminate this Agreement by written notice. Upon termination, unsold Goods must be retrieved within the stated pickup period, and any outstanding approved fees must be paid before release.',
      
      '11. LIMITATION OF LIABILITY: To the fullest extent permitted under California law, KPC Vault will not be liable for indirect, incidental, special, or consequential damages. Total liability, if any, will not exceed the expected net proceeds of the consigned item.',
      
      '12. INDEMNIFICATION: Consignor agrees to defend, indemnify, and hold harmless KPC Vault from claims, losses, liabilities, and expenses arising from ownership disputes, authenticity disputes, legal violations, or inaccuracies in Consignor\'s representations regarding the Goods.',
      
      '13. COMPLIANCE WITH CALIFORNIA LAW: Both parties agree to comply with applicable California laws, including consumer protection requirements, resale-related rules, and applicable tax reporting obligations.',
      
      '14. GOVERNING LAW & VENUE: This Agreement is governed by the laws of the State of California. Any dispute arising from this Agreement shall be resolved in the appropriate courts located in California, unless otherwise required by law.',
      
      '15. ENTIRE AGREEMENT: This agreement, including the intake selections and any attached inventory, constitutes the entire agreement between the parties and supersedes prior discussions regarding this consignment arrangement.'
    ];

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    terms.forEach(term => {
      // Check for new page before adding each term
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }
      
      const lines = doc.splitTextToSize(term, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 3.5;
      });
      yPosition += 4;
    });

    // Signature Section
    if (yPosition > 230) {
      doc.addPage();
      yPosition = margin;
    }

    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Signatures:', margin, yPosition);
    yPosition += 15;

    // Consignor signature
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Consignor:', margin, yPosition);
    doc.line(margin + 25, yPosition, margin + 100, yPosition);
    yPosition += 5;
    doc.text(`${data.client.firstName} ${data.client.lastName}`, margin + 25, yPosition);
    yPosition += 10;
    doc.text('Date: _______________', margin, yPosition);
    yPosition += 20;

    // Company signature
    doc.text('KPC Vault Representative:', margin, yPosition);
    doc.line(margin + 50, yPosition, margin + 125, yPosition);
    yPosition += 10;
    doc.text('Date: _______________', margin, yPosition);

    // Add signature if provided
    if (data.signature) {
      // Add signature image here if we have it as base64
      // For now, we'll add text indicating it was signed electronically
      yPosition += 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('This document was signed electronically.', margin, yPosition);
    }

    return doc;
  }

  static async generateAndSave(contractData: ContractData): Promise<Blob> {
    const pdf = this.generateContract(contractData);
    return pdf.output('blob') as Blob;
  }

  static previewContract(contractData: ContractData): void {
    const pdf = this.generateContract(contractData);
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  }

  static downloadContract(contractData: ContractData, filename?: string): void {
    const pdf = this.generateContract(contractData);
    const defaultFilename = `KPC_Vault_Contract_${contractData.client.lastName}_${contractData.contractDate.toISOString().split('T')[0]}.pdf`;
    pdf.save(filename || defaultFilename);
  }
}

export function generateContractId(): string {
  return `CONTRACT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}