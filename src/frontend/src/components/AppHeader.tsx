import { useNavigate } from '@tanstack/react-router';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getAppName } from '@/lib/settings/appSettings';
import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import LoginButton from './auth/LoginButton';

export default function AppHeader() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [appName, setAppName] = useState(getAppName());

  useEffect(() => {
    const interval = setInterval(() => {
      setAppName(getAppName());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-3"
        >
          <img
            src="/assets/generated/app-icon.dim_512x512.png"
            alt="App Icon"
            className="h-10 w-10 rounded-lg"
          />
          <h1 className="text-xl font-bold text-foreground">{appName}</h1>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-amber-600" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
