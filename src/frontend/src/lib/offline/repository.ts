import { db } from './db';
import { Customer, Invoice, StoredImage } from './models';

// Customer operations
export async function createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
  const newCustomer: Customer = {
    ...customer,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.put('customers', newCustomer);
  return newCustomer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  const existing = await db.get<Customer>('customers', id);
  if (!existing) throw new Error('Customer not found');
  
  const updated: Customer = {
    ...existing,
    ...updates,
    id,
    updatedAt: Date.now(),
  };
  await db.put('customers', updated);
  return updated;
}

export async function deleteCustomer(id: string): Promise<void> {
  // Delete customer's invoices and images
  const invoices = await getInvoicesByCustomer(id);
  for (const invoice of invoices) {
    await deleteInvoice(invoice.id);
  }
  await db.delete('customers', id);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  return db.get<Customer>('customers', id);
}

export async function getAllCustomers(): Promise<Customer[]> {
  const customers = await db.getAll<Customer>('customers');
  return customers.sort((a, b) => b.updatedAt - a.updatedAt);
}

// Invoice operations
export async function createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  const newInvoice: Invoice = {
    ...invoice,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.put('invoices', newInvoice);
  return newInvoice;
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  const existing = await db.get<Invoice>('invoices', id);
  if (!existing) throw new Error('Invoice not found');
  
  const updated: Invoice = {
    ...existing,
    ...updates,
    id,
    updatedAt: Date.now(),
  };
  await db.put('invoices', updated);
  return updated;
}

export async function deleteInvoice(id: string): Promise<void> {
  const invoice = await db.get<Invoice>('invoices', id);
  if (invoice) {
    // Delete associated images
    for (const imageId of invoice.imageIds) {
      await db.delete('images', imageId);
    }
  }
  await db.delete('invoices', id);
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  return db.get<Invoice>('invoices', id);
}

export async function getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
  const allInvoices = await db.getAll<Invoice>('invoices');
  return allInvoices
    .filter(inv => inv.customerId === customerId)
    .sort((a, b) => b.date - a.date);
}

// Image operations
export async function saveImage(invoiceId: string, blob: Blob, filename: string): Promise<string> {
  const imageId = crypto.randomUUID();
  const storedImage: StoredImage = {
    id: imageId,
    invoiceId,
    blob,
    filename,
    createdAt: Date.now(),
  };
  await db.put('images', storedImage);
  return imageId;
}

export async function getImage(id: string): Promise<StoredImage | null> {
  return db.get<StoredImage>('images', id);
}

export async function deleteImage(id: string): Promise<void> {
  await db.delete('images', id);
}

// Backup operations
export async function exportAllData(): Promise<{ customers: Customer[]; invoices: Invoice[]; images: { id: string; invoiceId: string; filename: string; data: string }[] }> {
  const customers = await db.getAll<Customer>('customers');
  const invoices = await db.getAll<Invoice>('invoices');
  const images = await db.getAll<StoredImage>('images');
  
  // Convert blobs to base64 and include invoiceId
  const imageData = await Promise.all(
    images.map(async (img) => ({
      id: img.id,
      invoiceId: img.invoiceId,
      filename: img.filename,
      data: await blobToBase64(img.blob),
    }))
  );
  
  return { customers, invoices, images: imageData };
}

export async function importAllData(data: { customers: Customer[]; invoices: Invoice[]; images: { id: string; invoiceId: string; filename: string; data: string }[] }): Promise<void> {
  // Clear existing data
  await db.clear('customers');
  await db.clear('invoices');
  await db.clear('images');
  
  // Import customers
  for (const customer of data.customers) {
    await db.put('customers', customer);
  }
  
  // Import invoices
  for (const invoice of data.invoices) {
    await db.put('invoices', invoice);
  }
  
  // Import images
  for (const img of data.images) {
    const blob = base64ToBlob(img.data);
    const storedImage: StoredImage = {
      id: img.id,
      invoiceId: img.invoiceId,
      blob,
      filename: img.filename,
      createdAt: Date.now(),
    };
    await db.put('images', storedImage);
  }
}

// Helper functions
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/jpeg' });
}
