import React, { createContext, useContext, useMemo, useState } from 'react';

export type ThemeName = 'classic' | 'sakura' | 'blossom' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'lavender';

type Theme = { name: ThemeName; label: string; emoji: string; bg: string; surface: string; surfaceAlt: string; ink: string; muted: string; primary: string; soft: string; line: string };

export const themes: Theme[] = [
  { name: 'classic', label: 'Classic', emoji: '✦', bg: '#F6F7FB', surface: '#FFFFFF', surfaceAlt: '#F8F8FC', ink: '#172033', muted: '#667085', primary: '#5B5CE2', soft: '#EEEFFF', line: '#E7E9F0' },
  { name: 'sakura', label: 'Sakura', emoji: '🌸', bg: '#FFF5F8', surface: '#FFFFFF', surfaceAlt: '#FFF0F5', ink: '#321B27', muted: '#846777', primary: '#D94F83', soft: '#FFE1EC', line: '#F1C9D8' },
  { name: 'blossom', label: 'Blossom', emoji: '🌷', bg: '#FFF8F1', surface: '#FFFFFF', surfaceAlt: '#FFF1E3', ink: '#35251D', muted: '#806B5F', primary: '#E2774D', soft: '#FFE4D5', line: '#F0D2C2' },
  { name: 'ocean', label: 'Ocean', emoji: '🌊', bg: '#F2FAFF', surface: '#FFFFFF', surfaceAlt: '#EAF7FF', ink: '#102A43', muted: '#627D98', primary: '#168AAD', soft: '#D9F1FA', line: '#C5E4EF' },
  { name: 'forest', label: 'Forest', emoji: '🌿', bg: '#F4FAF5', surface: '#FFFFFF', surfaceAlt: '#EAF6ED', ink: '#193126', muted: '#657B6E', primary: '#31805A', soft: '#DDF1E4', line: '#C9E2D1' },
  { name: 'sunset', label: 'Sunset', emoji: '🌅', bg: '#FFF8F3', surface: '#FFFFFF', surfaceAlt: '#FFF0E5', ink: '#382017', muted: '#876B5D', primary: '#E45F3A', soft: '#FFE1D4', line: '#F0CFC0' },
  { name: 'midnight', label: 'Midnight', emoji: '🌙', bg: '#111525', surface: '#191E31', surfaceAlt: '#222840', ink: '#F5F7FF', muted: '#A9B2CC', primary: '#8B8DFF', soft: '#2D3156', line: '#343A55' },
  { name: 'lavender', label: 'Lavender', emoji: '💜', bg: '#F8F5FF', surface: '#FFFFFF', surfaceAlt: '#F0EAFF', ink: '#29213D', muted: '#756A8F', primary: '#8A63D2', soft: '#E9DFFF', line: '#DDD0F4' },
];

type ThemeContextValue = { theme: Theme; themeName: ThemeName; setTheme: (name: ThemeName) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('lingua.theme');
      if (themes.some((t) => t.name === saved)) return saved as ThemeName;
    }
    return 'classic';
  });
  const theme = useMemo(() => themes.find((t) => t.name === themeName) ?? themes[0], [themeName]);
  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    if (typeof window !== 'undefined') window.localStorage.setItem('lingua.theme', name);
  };
  return <ThemeContext.Provider value={{ theme, themeName, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
