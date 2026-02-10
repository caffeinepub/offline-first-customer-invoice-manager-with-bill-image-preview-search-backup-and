import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export default function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-amber-600" />
          <span className="text-muted-foreground">Offline</span>
        </>
      )}
    </div>
  );
}
