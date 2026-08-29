import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { League } from '@/api/types';
import { DEFAULT_SETTINGS } from './defaults';
import {
  ALL_TABS,
  isLeagueTab,
  type CardDensity,
  type NotificationSettings,
  type OpenTo,
  type Settings,
  type TabKey,
  type ThemePref,
} from './types';

type NotificationCategory = keyof NotificationSettings['categories'];

interface SettingsActions {
  setTheme: (theme: ThemePref) => void;
  setCardDensity: (density: CardDensity) => void;
  setShowRecords: (value: boolean) => void;
  setOpenTo: (openTo: OpenTo) => void;
  /** Invalid input is coerced; always keeps at least one league. */
  setTabs: (tabs: TabKey[]) => void;
  setLastLeague: (league: League) => void;
  toggleFavorite: (key: string) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setNotificationScope: (scope: NotificationSettings['scope']) => void;
  setNotificationCategory: (category: NotificationCategory, value: boolean) => void;
}

export type SettingsState = Settings & SettingsActions;

/** Keep only known tabs, dedupe, preserve order; guarantee at least one league. */
function sanitizeTabs(tabs: readonly TabKey[]): TabKey[] {
  const seen = new Set<TabKey>();
  for (const t of tabs) {
    if (ALL_TABS.includes(t)) seen.add(t);
  }
  const result = [...seen];
  return result.some(isLeagueTab) ? result : [...ALL_TABS];
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
      setTabs: (tabs) =>
        set((s) => {
          const next = sanitizeTabs(tabs);
          // Drop "Open to" back to Last viewed if it pointed at a now-hidden tab.
          const openTo =
            s.openTo !== 'last' && !next.includes(s.openTo) ? 'last' : s.openTo;
          return { tabs: next, openTo };
        }),
      setLastLeague: (lastLeague) => set({ lastLeague }),

      toggleFavorite: (key) =>
        set((s) => ({
          favorites: s.favorites.includes(key)
            ? s.favorites.filter((k) => k !== key)
            : [...s.favorites, key],
        })),

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
        tabs: s.tabs,
        lastLeague: s.lastLeague,
        favorites: s.favorites,
        notifications: s.notifications,
      }),
      // Deep-merge persisted state onto defaults so a newly added field (including
      // nested notification categories) is never left undefined after an upgrade.
      merge: (persisted, current): SettingsState => {
        const { leagues, ...saved } = (persisted ?? {}) as Partial<Settings> & {
          leagues?: TabKey[];
        };
        // Migrate the pre-favorites `leagues` field into `tabs`.
        const rawTabs = saved.tabs ?? (leagues ? [...leagues, 'favorites'] : current.tabs);
        return {
          ...current,
          ...saved,
          tabs: sanitizeTabs(rawTabs),
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
