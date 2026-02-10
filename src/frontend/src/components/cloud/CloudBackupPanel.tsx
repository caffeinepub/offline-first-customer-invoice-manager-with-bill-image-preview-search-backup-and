import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActor } from '@/hooks/useActor';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { uploadBackupToCloud, downloadBackupFromCloud } from '@/lib/cloudSync/cloudSync';
import { Cloud, CloudOff, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CloudBackupPanelProps {
  onRestoreComplete: () => void;
}

export default function CloudBackupPanel({ onRestoreComplete }: CloudBackupPanelProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const isOnline = useOnlineStatus();
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isEnabled = !!identity && isOnline && !!actor;

  const handleUpload = async () => {
    if (!actor) return;
    
    setIsUploading(true);
    try {
      await uploadBackupToCloud(actor);
      toast.success('Backup uploaded to cloud successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload backup');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!actor) return;
    
    setIsDownloading(true);
    try {
      await downloadBackupFromCloud(actor);
      toast.success('Backup restored from cloud successfully');
      onRestoreComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download backup');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEnabled ? <Cloud className="h-5 w-5" /> : <CloudOff className="h-5 w-5 text-muted-foreground" />}
          Cloud Backup
        </CardTitle>
        <CardDescription>
          {!identity && 'Login to enable cloud backup sync'}
          {identity && !isOnline && 'You are offline. Cloud backup is unavailable.'}
          {identity && isOnline && 'Sync your backup with the Internet Computer'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={handleUpload}
          disabled={!isEnabled || isUploading}
          className="w-full gap-2"
          variant="outline"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Backup to Cloud'}
        </Button>
        <Button
          onClick={handleDownload}
          disabled={!isEnabled || isDownloading}
          className="w-full gap-2"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Restore from Cloud'}
        </Button>
      </CardContent>
    </Card>
  );
}
