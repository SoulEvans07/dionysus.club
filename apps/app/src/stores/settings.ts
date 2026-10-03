import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccentColor, ThemeMode } from '~/utils/theme';

export type VolumeUnit = 'ml' | 'cl' | 'oz';

type SettingsState = {
  theme: ThemeMode;
  accent: AccentColor;
  volumeUnit: VolumeUnit;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setVolumeUnit: (volumeUnit: VolumeUnit) => void;
};

// Keep in sync with the inline theme script in index.html, which reads this key before first paint.
export const SETTINGS_STORAGE_KEY = 'dionysus-settings';

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      accent: 'default',
      volumeUnit: 'ml',
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setVolumeUnit: (volumeUnit) => set({ volumeUnit }),
    }),
    { name: SETTINGS_STORAGE_KEY, version: 1 }
  )
);
