export function validateCustomerName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Customer name is required';
  }
  if (name.trim().length < 2) {
    return 'Customer name must be at least 2 characters';
  }
  return null;
}

export function validateInvoiceNumber(invoiceNumber: string): string | null {
  if (!invoiceNumber || invoiceNumber.trim().length === 0) {
    return 'Invoice number is required';
  }
  return null;
}

export function validateInvoiceTotal(total: number): string | null {
  if (isNaN(total) || total < 0) {
    return 'Invoice total must be a positive number';
  }
  return null;
}
