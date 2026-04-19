import Airtable from 'airtable';
import { Client, Item, Contract, Sale } from '@/types';

// Airtable configuration
// Note: These will need to be set in environment variables
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';

if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
  console.warn('Airtable configuration missing. Please set NEXT_PUBLIC_AIRTABLE_BASE_ID and AIRTABLE_API_KEY environment variables.');
}

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Table names
export const TABLES = {
  CLIENTS: 'Clients',
  ITEMS: 'Items',
  CONTRACTS: 'Contracts',
  SALES: 'Sales'
} as const;

// Airtable service functions
export class AirtableService {
  // Client operations
  static async createClient(clientData: Omit<Client, 'id' | 'items' | 'totalEarnings'>): Promise<string> {
    try {
      const record = await base(TABLES.CLIENTS).create({
        'First Name': clientData.firstName,
        'Last Name': clientData.lastName,
        'Email': clientData.email,
        'Phone': clientData.phone,
        'Street': clientData.address.street,
        'City': clientData.address.city,
        'State': clientData.address.state,
        'Zip Code': clientData.address.zipCode,
        'Total Earnings': 0,
        'Created Date': new Date().toISOString()
      });
      
      return record.id;
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error('Failed to create client');
    }
  }

  static async getClient(clientId: string): Promise<Client | null> {
    try {
      const record = await base(TABLES.CLIENTS).find(clientId);
      
      return {
        id: record.id,
        firstName: record.fields['First Name'] as string,
        lastName: record.fields['Last Name'] as string,
        email: record.fields['Email'] as string,
        phone: record.fields['Phone'] as string,
        address: {
          street: record.fields['Street'] as string,
          city: record.fields['City'] as string,
          state: record.fields['State'] as string,
          zipCode: record.fields['Zip Code'] as string
        },
        items: [], // Will be populated separately
        totalEarnings: (record.fields['Total Earnings'] as number) || 0
      };
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  }

  // Item operations
  static async createItem(itemData: Omit<Item, 'id'>): Promise<string> {
    try {
      const record = await base(TABLES.ITEMS).create({
        'Title': itemData.title,
        'Description': itemData.description,
        'Estimated Value': itemData.estimatedValue,
        'Category': itemData.category,
        'Is Specialty': itemData.isSpecialty,
        'Photos': itemData.photos.map(photo => ({ url: photo })),
        'Status': itemData.status,
        'Consigned Date': itemData.consignedDate.toISOString(),
        'Sold Date': itemData.soldDate?.toISOString(),
        'Sold Price': itemData.soldPrice,
        'Commission': itemData.commission
      });
      
      return record.id;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error('Failed to create item');
    }
  }

  static async getItemsByClient(clientId: string): Promise<Item[]> {
    try {
      const records = await base(TABLES.ITEMS)
        .select({
          filterByFormula: `{Client} = '${clientId}'`,
          sort: [{ field: 'Consigned Date', direction: 'desc' }]
        })
        .all();

      return records.map(record => ({
        id: record.id,
        title: record.fields['Title'] as string,
        description: record.fields['Description'] as string,
        estimatedValue: record.fields['Estimated Value'] as number,
        category: record.fields['Category'] as string,
        isSpecialty: record.fields['Is Specialty'] as boolean || false,
        photos: (record.fields['Photos'] as any[] || []).map(photo => photo.url),
        status: record.fields['Status'] as Item['status'],
        consignedDate: new Date(record.fields['Consigned Date'] as string),
        soldDate: record.fields['Sold Date'] ? new Date(record.fields['Sold Date'] as string) : undefined,
        soldPrice: record.fields['Sold Price'] as number,
        commission: record.fields['Commission'] as number
      }));
    } catch (error) {
      console.error('Error fetching items:', error);
      return [];
    }
  }

  // Contract operations
  static async createContract(contractData: Omit<Contract, 'id'>): Promise<string> {
    try {
      const record = await base(TABLES.CONTRACTS).create({
        'Client': [contractData.clientId],
        'Items': contractData.itemIds,
        'Commission Rules': JSON.stringify(contractData.commissionRules),
        'Created Date': contractData.createdDate.toISOString(),
        'Signed Date': contractData.signedDate?.toISOString(),
        'Signature': contractData.signature,
        'PDF URL': contractData.pdfUrl
      });
      
      return record.id;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw new Error('Failed to create contract');
    }
  }

  // Sale operations
  static async createSale(saleData: Omit<Sale, 'id'>): Promise<string> {
    try {
      const record = await base(TABLES.SALES).create({
        'Item': [saleData.itemId],
        'Client': [saleData.clientId],
        'Sale Price': saleData.salePrice,
        'Commission': saleData.commission,
        'Client Payout': saleData.clientPayout,
        'Sale Date': saleData.saleDate.toISOString(),
        'Payment Status': saleData.paymentStatus
      });
      
      return record.id;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw new Error('Failed to create sale');
    }
  }

  static async getSalesByClient(clientId: string): Promise<Sale[]> {
    try {
      const records = await base(TABLES.SALES)
        .select({
          filterByFormula: `{Client} = '${clientId}'`,
          sort: [{ field: 'Sale Date', direction: 'desc' }]
        })
        .all();

      return records.map(record => ({
        id: record.id,
        itemId: (record.fields['Item'] as string[])[0],
        clientId: (record.fields['Client'] as string[])[0],
        salePrice: record.fields['Sale Price'] as number,
        commission: record.fields['Commission'] as number,
        clientPayout: record.fields['Client Payout'] as number,
        saleDate: new Date(record.fields['Sale Date'] as string),
        paymentStatus: record.fields['Payment Status'] as Sale['paymentStatus']
      }));
    } catch (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
  }
}

// Helper function to initialize Airtable tables (run once during setup)
export async function setupAirtableTables() {
  console.log('Airtable tables should be created manually in the Airtable interface with the following structure:');
  
  console.log(`
  CLIENTS Table:
  - First Name (Single line text)
  - Last Name (Single line text)
  - Email (Email)
  - Phone (Phone number)
  - Street (Single line text)
  - City (Single line text)
  - State (Single line text)
  - Zip Code (Single line text)
  - Total Earnings (Currency)
  - Created Date (Date)
  
  ITEMS Table:
  - Title (Single line text)
  - Description (Long text)
  - Estimated Value (Currency)
  - Category (Single line text)
  - Is Specialty (Checkbox)
  - Photos (Attachment)
  - Status (Single select: pending, active, sold, returned)
  - Consigned Date (Date)
  - Sold Date (Date)
  - Sold Price (Currency)
  - Commission (Currency)
  - Client (Link to Clients table)
  
  CONTRACTS Table:
  - Client (Link to Clients table)
  - Items (Link to Items table, allow multiple)
  - Commission Rules (Long text)
  - Created Date (Date)
  - Signed Date (Date)
  - Signature (Long text)
  - PDF URL (URL)
  
  SALES Table:
  - Item (Link to Items table)
  - Client (Link to Clients table)
  - Sale Price (Currency)
  - Commission (Currency)
  - Client Payout (Currency)
  - Sale Date (Date)
  - Payment Status (Single select: pending, paid, failed)
  `);
}