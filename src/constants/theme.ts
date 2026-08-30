import '@/global.css';

import { useColorScheme } from 'nativewind';

import type { League } from '@/api/types';
import type { TabKey } from '@/settings';

/**
 * Raw color values for both themes — hex mirrors of the CSS custom properties in
 * src/global.css. Use the Tailwind classes (bg-surface, text-ink-dim, …) in
 * components; reach for these only where a raw string is required (navigation
 * theming, StatusBar, the Animated color interpolation in ScoreText).
 */
export const darkPalette = {
  background: '#0e1117',
  surface: '#171c26',
  surface2: '#1f2530',
  line: '#2a3040',
  ink: '#eef1f6',
  inkDim: '#8b93a6',
  inkFaint: '#565e70',
  mlb: '#e0a83e',
  nfl: '#4fa8e0',
  live: '#e5484d',
} as const;

export type Palette = Record<keyof typeof darkPalette, string>;

export const lightPalette: Palette = {
  background: '#f6f7f9',
  surface: '#ffffff',
  surface2: '#eef0f4',
  line: '#d9dee6',
  ink: '#14181f',
  inkDim: '#5b6472',
  inkFaint: '#8a93a2',
  mlb: '#b0761a',
  nfl: '#1f7fc0',
  live: '#c82d29',
};

/** Raw palette for the currently resolved color scheme. */
export function usePalette(): Palette {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'light' ? lightPalette : darkPalette;
}

export const leagueLabel: Record<League, string> = {
  mlb: 'MLB',
  nfl: 'NFL',
};

/** Display names for every bottom tab, leagues + Favorites. */
export const tabLabel: Record<TabKey, string> = {
  ...leagueLabel,
  favorites: 'Favorites',
};
