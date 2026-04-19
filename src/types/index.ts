// Core types for KPC Vault Consignment App

export type CommissionTier = 'high-value' | 'standard' | 'low-value' | 'specialty';

export interface CommissionRule {
  tier: CommissionTier;
  percentage: number;
  minValue?: number;
  maxValue?: number;
  description: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  estimatedValue: number;
  category: string;
  isSpecialty: boolean;
  photos: string[];
  status: 'pending' | 'active' | 'sold' | 'returned';
  consignedDate: Date;
  soldDate?: Date;
  soldPrice?: number;
  commission?: number;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: Item[];
  totalEarnings: number;
}

export interface Contract {
  id: string;
  clientId: string;
  itemIds: string[];
  commissionRules: CommissionRule[];
  createdDate: Date;
  signedDate?: Date;
  signature?: string;
  pdfUrl?: string;
}

export interface Sale {
  id: string;
  itemId: string;
  clientId: string;
  salePrice: number;
  commission: number;
  clientPayout: number;
  saleDate: Date;
  paymentStatus: 'pending' | 'paid' | 'failed';
}