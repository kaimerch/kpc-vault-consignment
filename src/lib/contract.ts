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

    // Terms and Conditions
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms and Conditions:', margin, yPosition);
    yPosition += 10;

    const terms = [
      '1. Items will be displayed for sale for up to 60 days unless otherwise agreed.',
      '2. KPC Vault reserves the right to set final selling prices in consultation with the consignor.',
      '3. Payment to consignor will be made within 30 days of item sale.',
      '4. Items not sold within the agreed timeframe may be returned to consignor or donated to charity.',
      '5. KPC Vault is not responsible for items lost, stolen, or damaged while in our possession.',
      '6. This agreement may be terminated by either party with 7 days written notice.',
      '7. All commission rates are as stated above and are non-negotiable unless marked as specialty items.'
    ];

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    terms.forEach(term => {
      const lines = doc.splitTextToSize(term, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 4;
      });
      yPosition += 2;
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
    return new Promise((resolve) => {
      pdf.output('blob', resolve as any);
    });
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