import { useActor } from '@/hooks/useActor';
import { exportAllData, importAllData } from '../offline/repository';
import { createBackupPayload, validateBackupPayload } from '../backup/backupFormat';
import { getAppName } from '../settings/appSettings';

export async function uploadBackupToCloud(actor: any): Promise<void> {
  try {
    const data = await exportAllData();
    const appName = getAppName();
    const payload = createBackupPayload(data.customers, data.invoices, data.images, appName);
    const json = JSON.stringify(payload);
    
    await actor.syncBackup(json);
  } catch (error) {
    console.error('Cloud upload failed:', error);
    throw new Error('Failed to upload backup to cloud');
  }
}

export async function downloadBackupFromCloud(actor: any): Promise<void> {
  try {
    const result = await actor.retrieveBackup();
    
    if (!result) {
      throw new Error('No backup found in cloud');
    }
    
    const data = JSON.parse(result);
    
    if (!validateBackupPayload(data)) {
      throw new Error('Invalid backup format from cloud');
    }
    
    await importAllData({
      customers: data.customers,
      invoices: data.invoices,
      images: data.images,
    });
  } catch (error) {
    console.error('Cloud download failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to download backup from cloud');
  }
}
