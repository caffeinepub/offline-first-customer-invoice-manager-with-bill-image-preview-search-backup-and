import { importAllData } from '../offline/repository';
import { validateBackupPayload } from './backupFormat';

export async function importBackup(file: File): Promise<void> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!validateBackupPayload(data)) {
      throw new Error('Invalid backup file format');
    }
    
    await importAllData({
      customers: data.customers,
      invoices: data.invoices,
      images: data.images,
    });
  } catch (error) {
    console.error('Import failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to import backup');
  }
}
