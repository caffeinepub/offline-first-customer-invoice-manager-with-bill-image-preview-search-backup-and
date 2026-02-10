import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getAppSettings, saveAppSettings } from '@/lib/settings/appSettings';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useQueries';
import ErrorBanner from '@/components/common/ErrorBanner';
import { toast } from 'sonner';
import { User } from 'lucide-react';

export default function SettingsPage() {
  const [appName, setAppName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    const settings = getAppSettings();
    setAppName(settings.appName);
  }, []);

  useEffect(() => {
    if (identity && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [identity, profileLoading, isFetched, userProfile]);

  const handleSaveAppName = () => {
    setError(null);
    
    if (!appName.trim()) {
      setError('App name cannot be empty');
      return;
    }

    try {
      saveAppSettings({ appName: appName.trim() });
      toast.success('App name saved successfully');
    } catch (err) {
      setError('Failed to save app name');
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await saveProfile.mutateAsync({ name: profileName.trim() });
      toast.success('Profile saved successfully');
      setShowProfileSetup(false);
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  return (
    <div className="container max-w-2xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      {error && <ErrorBanner message={error} />}

      <Card>
        <CardHeader>
          <CardTitle>App Name</CardTitle>
          <CardDescription>
            Customize the name displayed in the header and backup files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">App Name</Label>
            <Input
              id="appName"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Invoice Manager"
            />
          </div>
          <Button onClick={handleSaveAppName}>Save App Name</Button>
        </CardContent>
      </Card>

      {identity && userProfile && (
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{userProfile.name}</p>
                <p className="text-sm text-muted-foreground">Logged in</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Version 1.0</p>
          <p>
            Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs">© {new Date().getFullYear()}</p>
        </CardContent>
      </Card>

      <Sheet open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader>
            <SheetTitle>Welcome! Set up your profile</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Your Name</Label>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
