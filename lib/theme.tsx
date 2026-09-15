import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export type ThemeName = 'classic' | 'sakura' | 'blossom' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'lavender';

export type Theme = {
  name: ThemeName;
  label: string;
  emoji: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  muted: string;
  primary: string;
  primaryDark: string;
  soft: string;
  line: string;
  white: string;
};

export const themes: Theme[] = [
  { name: 'classic', label: 'Classic', emoji: '✦', bg: '#F6F7FB', surface: '#FFFFFF', surfaceAlt: '#F8F8FC', ink: '#172033', muted: '#667085', primary: '#5B5CE2', primaryDark: '#292C63', soft: '#EEEFFF', line: '#E7E9F0', white: '#FFFFFF' },
  { name: 'sakura', label: 'Sakura', emoji: '🌸', bg: '#FFF7FA', surface: '#FFFFFF', surfaceAlt: '#FFF0F5', ink: '#3A2230', muted: '#856779', primary: '#D85C8A', primaryDark: '#7D3152', soft: '#FBE0EA', line: '#F2D3DE', white: '#FFFFFF' },
  { name: 'blossom', label: 'Blossom', emoji: '🌷', bg: '#FFF9F3', surface: '#FFFFFF', surfaceAlt: '#FFF2E8', ink: '#3D2A22', muted: '#806A5F', primary: '#E58A57', primaryDark: '#8D4D2D', soft: '#FFE2CF', line: '#F1D9C8', white: '#FFFFFF' },
  { name: 'ocean', label: 'Ocean', emoji: '🌊', bg: '#F3FAFC', surface: '#FFFFFF', surfaceAlt: '#EAF7FA', ink: '#17313A', muted: '#617A83', primary: '#169BB3', primaryDark: '#0B5665', soft: '#D8F1F5', line: '#D0E6EB', white: '#FFFFFF' },
  { name: 'forest', label: 'Forest', emoji: '🌿', bg: '#F4F9F5', surface: '#FFFFFF', surfaceAlt: '#ECF6EE', ink: '#1D3023', muted: '#66766A', primary: '#3D9461', primaryDark: '#23563A', soft: '#DDF0E3', line: '#D3E4D7', white: '#FFFFFF' },
  { name: 'sunset', label: 'Sunset', emoji: '🌅', bg: '#FFF7F0', surface: '#FFFFFF', surfaceAlt: '#FFF0E4', ink: '#3A261E', muted: '#80695F', primary: '#E36B4B', primaryDark: '#8E3C2B', soft: '#FFE0D4', line: '#F1D7CD', white: '#FFFFFF' },
  { name: 'midnight', label: 'Midnight', emoji: '🌙', bg: '#101522', surface: '#171E2E', surfaceAlt: '#20283A', ink: '#F5F7FF', muted: '#AAB4C9', primary: '#8B8DF8', primaryDark: '#30336F', soft: '#30345E', line: '#2B3448', white: '#FFFFFF' },
  { name: 'lavender', label: 'Lavender', emoji: '💜', bg: '#F8F5FC', surface: '#FFFFFF', surfaceAlt: '#F2ECF8', ink: '#2D2437', muted: '#766B80', primary: '#9564C7', primaryDark: '#5B397D', soft: '#EADCF5', line: '#E3D8EB', white: '#FFFFFF' },
];

const STORAGE_KEY = 'lingua.theme.v1';
const ThemeContext = createContext<{ theme: Theme; themeName: ThemeName; setTheme: (name: ThemeName) => void }>({
  theme: themes[0],
  themeName: 'classic',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('classic');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
        if (saved && themes.some((item) => item.name === saved)) setThemeName(saved);
      } catch {}
    }
  }, []);

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.setItem(STORAGE_KEY, name); } catch {}
    }
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = themes.find((item) => item.name === name)?.bg || '#F6F7FB';
      document.body.style.backgroundColor = themes.find((item) => item.name === name)?.bg || '#F6F7FB';
    }
  };

  const value = useMemo(() => ({ theme: themes.find((item) => item.name === themeName) || themes[0], themeName, setTheme }), [themeName]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
