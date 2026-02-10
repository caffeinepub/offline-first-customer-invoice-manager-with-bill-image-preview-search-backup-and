import { exportAllData } from '../offline/repository';
import { createBackupPayload } from './backupFormat';
import { getAppName } from '../settings/appSettings';

export async function exportBackup(): Promise<void> {
  try {
    const data = await exportAllData();
    const appName = getAppName();
    const payload = createBackupPayload(data.customers, data.invoices, data.images, appName);
    
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${appName.replace(/\s+/g, '_')}_backup_${timestamp}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export backup');
  }
}
