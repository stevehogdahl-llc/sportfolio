import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { League } from '@/api/types';
import { DEFAULT_SETTINGS } from './defaults';
import type { CardDensity, NotificationSettings, OpenTo, Settings, ThemePref } from './types';

const ALL_LEAGUES: League[] = ['mlb', 'nfl'];

type NotificationCategory = keyof NotificationSettings['categories'];

interface SettingsActions {
  setTheme: (theme: ThemePref) => void;
  setCardDensity: (density: CardDensity) => void;
  setShowRecords: (value: boolean) => void;
  setOpenTo: (openTo: OpenTo) => void;
  /** Empty or invalid input is coerced back to all leagues in canonical order. */
  setLeagues: (leagues: League[]) => void;
  setLastLeague: (league: League) => void;
  toggleFavorite: (key: string) => void;
  setMyTeamsFilter: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setNotificationScope: (scope: NotificationSettings['scope']) => void;
  setNotificationCategory: (category: NotificationCategory, value: boolean) => void;
}

export type SettingsState = Settings & SettingsActions;

/** Keep only known leagues, dedupe, preserve order; fall back to all of them. */
function sanitizeLeagues(leagues: League[]): League[] {
  const seen = new Set<League>();
  for (const l of leagues) {
    if (ALL_LEAGUES.includes(l)) seen.add(l);
  }
  return seen.size > 0 ? [...seen] : [...ALL_LEAGUES];
}

const PERSIST_VERSION = 1;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => set({ theme }),
      setCardDensity: (cardDensity) => set({ cardDensity }),
      setShowRecords: (showRecords) => set({ showRecords }),
      setOpenTo: (openTo) => set({ openTo }),
      setLeagues: (leagues) => set({ leagues: sanitizeLeagues(leagues) }),
      setLastLeague: (lastLeague) => set({ lastLeague }),

      toggleFavorite: (key) =>
        set((s) => ({
          favorites: s.favorites.includes(key)
            ? s.favorites.filter((k) => k !== key)
            : [...s.favorites, key],
        })),

      setMyTeamsFilter: (myTeamsFilter) => set({ myTeamsFilter }),

      setNotificationsEnabled: (enabled) =>
        set((s) => ({ notifications: { ...s.notifications, enabled } })),
      setNotificationScope: (scope) =>
        set((s) => ({ notifications: { ...s.notifications, scope } })),
      setNotificationCategory: (category, value) =>
        set((s) => ({
          notifications: {
            ...s.notifications,
            categories: { ...s.notifications.categories, [category]: value },
          },
        })),
    }),
    {
      name: 'sportfolio.settings',
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s): Settings => ({
        theme: s.theme,
        cardDensity: s.cardDensity,
        showRecords: s.showRecords,
        openTo: s.openTo,
        leagues: s.leagues,
        lastLeague: s.lastLeague,
        favorites: s.favorites,
        myTeamsFilter: s.myTeamsFilter,
        notifications: s.notifications,
      }),
      // Deep-merge persisted state onto defaults so a newly added field (including
      // nested notification categories) is never left undefined after an upgrade.
      merge: (persisted, current): SettingsState => {
        const saved = (persisted ?? {}) as Partial<Settings>;
        return {
          ...current,
          ...saved,
          leagues: sanitizeLeagues(saved.leagues ?? current.leagues),
          notifications: {
            ...current.notifications,
            ...saved.notifications,
            categories: {
              ...current.notifications.categories,
              ...saved.notifications?.categories,
            },
          },
        };
      },
      migrate: (persisted) => persisted as Settings,
    },
  ),
);

/** Re-renders once the persisted settings have been read back from storage. */
export function useSettingsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useSettingsStore.persist.hasHydrated());
  useEffect(() => {
    if (hydrated) return;
    const unsub = useSettingsStore.persist.onFinishHydration(() => setHydrated(true));
    // hasHydrated() may have flipped true between the initial render and this effect
    if (useSettingsStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);
  return hydrated;
}
