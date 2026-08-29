import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';

import type { League } from '@/api/types';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useNotificationSettings, useSettingsStore } from '@/settings';
import { syncBackgroundTask } from './backgroundTask';
import { cancelAllScheduled, configureNotificationHandler } from './notifier';
import { processGames, type NotifInput } from './sync';

if (Platform.OS !== 'web') {
  configureNotificationHandler();
}

/** Opens the relevant game when a notification is tapped. */
function useNotificationTaps(): void {
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        league?: League;
        eventId?: string;
      };
      if (data?.league && data?.eventId) {
        router.push({
          pathname: '/game/[league]/[id]',
          params: { league: data.league, id: data.eventId },
        });
      }
    });
    return () => sub.remove();
  }, [router]);
}

/** Foreground polling + diffing, and background-task registration. */
function ActiveSync(): null {
  const notifications = useNotificationSettings();
  const favorites = useSettingsStore((s) => s.favorites);
  const tabs = useSettingsStore((s) => s.tabs);
  const mlb = useScoreboard('mlb');
  const nfl = useScoreboard('nfl');

  const input: NotifInput = useMemo(
    () => ({ notifications, favorites, tabs }),
    [notifications, favorites, tabs],
  );

  useEffect(() => {
    const games = [...(mlb.data ?? []), ...(nfl.data ?? [])];
    if (games.length > 0) void processGames(games, input);
  }, [mlb.data, nfl.data, input]);

  useEffect(() => {
    void syncBackgroundTask(true);
    return () => {
      // Notifications were turned off — stop polling and drop pending alerts.
      void syncBackgroundTask(false);
      void cancelAllScheduled();
    };
  }, []);

  return null;
}

export function NotificationsProvider(): React.ReactElement | null {
  const enabled = useNotificationSettings().enabled;
  useNotificationTaps();
  if (Platform.OS === 'web') return null;
  return enabled ? <ActiveSync /> : null;
}
