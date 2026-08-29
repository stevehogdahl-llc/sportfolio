import * as Notifications from 'expo-notifications';

import type { Game } from '@/api/types';
import type { LocalNotif } from './types';

const START_PREFIX = 'start:';

/** Show notifications while the app is foregrounded, too. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function hasPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/** Returns true if permission is granted (requesting it if needed). */
export async function requestPermission(): Promise<boolean> {
  if (await hasPermission()) return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function presentNow(notif: LocalNotif): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: notif.id,
    content: { title: notif.title, body: notif.body, data: notif.data },
    trigger: null,
  });
}

/**
 * Reconcile the scheduled "game starting" notifications: clear the old set and
 * re-schedule one per upcoming game in `games` (already scope-filtered). This
 * tier works offline once scheduled, so it's the reliable path for game starts.
 */
export async function reconcileGameStarts(games: Game[], enabled: boolean): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((s) => s.identifier.startsWith(START_PREFIX))
      .map((s) => Notifications.cancelScheduledNotificationAsync(s.identifier)),
  );

  if (!enabled) return;

  const now = Date.now();
  for (const g of games) {
    if (g.state !== 'pre') continue;
    const at = new Date(g.startDate).getTime();
    if (!Number.isFinite(at) || at <= now + 60_000) continue;
    const [away, home] = g.competitors;
    await Notifications.scheduleNotificationAsync({
      identifier: `${START_PREFIX}${g.league}:${g.id}`,
      content: {
        title: `${away.abbrev} @ ${home.abbrev}`,
        body: 'Starting now',
        data: { league: g.league, eventId: g.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  }
}

export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
