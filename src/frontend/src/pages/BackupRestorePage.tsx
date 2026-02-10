import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { exportBackup } from '@/lib/backup/exportBackup';
import { importBackup } from '@/lib/backup/importBackup';
import CloudBackupPanel from '@/components/cloud/CloudBackupPanel';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function BackupRestorePage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportBackup();
      toast.success('Backup exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowImportConfirm(true);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      await importBackup(selectedFile);
      toast.success('Backup restored successfully');
      setShowImportConfirm(false);
      setSelectedFile(null);
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to restore backup');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container max-w-2xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Backup & Restore</h1>

      <Card>
        <CardHeader>
          <CardTitle>Local Backup</CardTitle>
          <CardDescription>
            Export and import your data as a file on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Backup'}
          </Button>

          <div>
            <input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => document.getElementById('backup-file')?.click()}
              className="w-full gap-2"
              variant="outline"
            >
              <Upload className="h-4 w-4" />
              Import Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <CloudBackupPanel onRestoreComplete={() => window.location.reload()} />

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Restore Backup?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all existing data with the backup file. All current customers, invoices, and images will be overwritten. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Restoring...' : 'Restore Backup'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
