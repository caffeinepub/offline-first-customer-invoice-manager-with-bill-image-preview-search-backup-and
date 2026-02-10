import { Customer, Invoice } from '../offline/models';

export interface BackupPayload {
  version: string;
  appName: string;
  timestamp: number;
  customers: Customer[];
  invoices: Invoice[];
  images: {
    id: string;
    invoiceId: string;
    filename: string;
    data: string;
  }[];
}

export function createBackupPayload(
  customers: Customer[],
  invoices: Invoice[],
  images: { id: string; invoiceId: string; filename: string; data: string }[],
  appName: string
): BackupPayload {
  return {
    version: '1.0',
    appName,
    timestamp: Date.now(),
    customers,
    invoices,
    images,
  };
}

export function validateBackupPayload(data: any): data is BackupPayload {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.version === 'string' &&
    Array.isArray(data.customers) &&
    Array.isArray(data.invoices) &&
    Array.isArray(data.images)
  );
}
