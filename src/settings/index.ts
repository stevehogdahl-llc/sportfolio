import { useShallow } from 'zustand/react/shallow';

import type { League } from '@/api/types';
import { DENSITY, type DensityTokens } from './density';
import { useSettingsStore } from './store';
import { isLeagueTab } from './types';
import type { CardDensity, NotificationSettings, TabKey, ThemePref } from './types';

export { DEFAULT_SETTINGS } from './defaults';
export type { DensityTokens } from './density';
export { useSettingsHydrated, useSettingsStore } from './store';
export type {
  CardDensity,
  NotificationCategory,
  NotificationSettings,
  OpenTo,
  Settings,
  TabKey,
  ThemePref,
} from './types';
export { ALL_TABS, favoriteKey, isLeagueTab } from './types';

export function useTheme(): ThemePref {
  return useSettingsStore((s) => s.theme);
}

export function useCardDensity(): CardDensity {
  return useSettingsStore((s) => s.cardDensity);
}

/** Resolved spacing/size tokens for the current card density. */
export function useDensityTokens(): DensityTokens {
  return DENSITY[useSettingsStore((s) => s.cardDensity)];
}

/** Whether to show win–loss records next to team names. */
export function useShowRecords(): boolean {
  return useSettingsStore((s) => s.showRecords);
}

/** Bottom tabs (leagues + Favorites) in display order. */
export function useTabs(): TabKey[] {
  return useSettingsStore((s) => s.tabs);
}

/** Enabled leagues, in tab order — the subset of `tabs` that are leagues. */
export function useEnabledLeagues(): League[] {
  return useSettingsStore(useShallow((s) => s.tabs.filter(isLeagueTab)));
}

export function useFavorites(): string[] {
  return useSettingsStore((s) => s.favorites);
}

export function useIsFavorite(key: string): boolean {
  return useSettingsStore((s) => s.favorites.includes(key));
}

export function useNotificationSettings(): NotificationSettings {
  return useSettingsStore((s) => s.notifications);
}
