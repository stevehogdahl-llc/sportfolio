import type { League } from '@/api/types';
import { DENSITY, type DensityTokens } from './density';
import { useSettingsStore } from './store';
import type { CardDensity, NotificationSettings, ThemePref } from './types';

export { DEFAULT_SETTINGS } from './defaults';
export type { DensityTokens } from './density';
export { useSettingsHydrated, useSettingsStore } from './store';
export type {
  CardDensity,
  NotificationSettings,
  OpenTo,
  Settings,
  ThemePref,
} from './types';
export { favoriteKey } from './types';

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

/** Leagues to surface as tabs, in the user's chosen order. */
export function useEnabledLeagues(): League[] {
  return useSettingsStore((s) => s.leagues);
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
