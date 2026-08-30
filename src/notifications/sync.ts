import { fetchScoreboard } from '@/api/espn';
import { normalizeScoreboard } from '@/api/normalize';
import type { Game, League } from '@/api/types';
import { gameHasFavorite } from '@/lib/favorites';
import { isLeagueTab, type Settings } from '@/settings';
import { diffGames } from './diff';
import { presentNow, reconcileGameStarts } from './notifier';
import { loadSnapshot, saveSnapshot } from './snapshot';

/** The slice of settings the notification pipeline needs. */
export type NotifInput = Pick<Settings, 'notifications' | 'favorites' | 'tabs'>;

/** Games in the user's chosen notification scope. */
export function scopedGames(games: Game[], input: NotifInput): Game[] {
  const { notifications, favorites, tabs } = input;
  if (notifications.scope === 'favorites') {
    const favSet = new Set(favorites);
    return games.filter((g) => gameHasFavorite(g, favSet));
  }
  const leagues = new Set(tabs.filter(isLeagueTab));
  return games.filter((g) => leagues.has(g.league));
}

/** Diff `games` against the stored snapshot, present anything new, persist. */
export async function processGames(games: Game[], input: NotifInput): Promise<void> {
  if (!input.notifications.enabled) return;
  const scoped = scopedGames(games, input);
  const prev = await loadSnapshot();
  const { fire, next } = diffGames(prev, scoped, input.notifications);
  for (const notif of fire) {
    await presentNow(notif);
  }
  await saveSnapshot(next);
  await reconcileGameStarts(scoped, input.notifications.categories.gameStart);
}

/** Fetch both leagues and run the pipeline — used by the background task. */
export async function pollAndProcess(input: NotifInput): Promise<void> {
  if (!input.notifications.enabled) return;
  const leagues: League[] = ['mlb', 'nfl'];
  const results = await Promise.allSettled(
    leagues.map(async (lg) => normalizeScoreboard(lg, await fetchScoreboard(lg))),
  );
  const games = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  if (games.length > 0) await processGames(games, input);
}
