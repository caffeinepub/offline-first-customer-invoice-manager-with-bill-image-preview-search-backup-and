const SETTINGS_KEY = 'app_settings';

export interface AppSettings {
  appName: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Invoice Manager',
};

export function getAppSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load app settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save app settings:', error);
    throw new Error('Failed to save settings');
  }
}

export function getAppName(): string {
  return getAppSettings().appName;
}

export function setAppName(name: string): void {
  const settings = getAppSettings();
  settings.appName = name;
  saveAppSettings(settings);
}
