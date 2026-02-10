// Frontend-only types for offline data
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  date: number;
  description?: string;
  lineItems: InvoiceLineItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  imageIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface StoredImage {
  id: string;
  invoiceId: string;
  blob: Blob;
  filename: string;
  createdAt: number;
}
