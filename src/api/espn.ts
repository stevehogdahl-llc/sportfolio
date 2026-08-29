import type { League } from './types';

/**
 * Thin client for ESPN's free, unauthenticated JSON feed.
 *
 * These endpoints are undocumented and can change without notice — see
 * docs/espn-api-reference.md. This is the seam where a licensed provider
 * (API-Sports, etc.) would slot in later; screens only ever see the
 * normalized types from ./normalize.
 */

const SITE = 'https://site.api.espn.com/apis/site/v2/sports';
const CORE = 'https://sports.core.api.espn.com/v2/sports';

/** "<sport>/<league>" path segment ESPN uses in every URL. */
const SPORT_PATH: Record<League, string> = {
  mlb: 'baseball/mlb',
  nfl: 'football/nfl',
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`ESPN ${res.status} — ${url}`);
  return (await res.json()) as T;
}

export function scoreboardUrl(league: League): string {
  return `${SITE}/${SPORT_PATH[league]}/scoreboard`;
}

export function summaryUrl(league: League, eventId: string): string {
  return `${SITE}/${SPORT_PATH[league]}/summary?event=${encodeURIComponent(eventId)}`;
}

/** Core API play-by-play. Note EVENT_ID appears twice (event + competition). */
export function playsUrl(league: League, eventId: string, limit = 300): string {
  const [sport, lg] = SPORT_PATH[league].split('/');
  return (
    `${CORE}/${sport}/leagues/${lg}/events/${eventId}` +
    `/competitions/${eventId}/plays?limit=${limit}`
  );
}

// Raw ESPN payloads are deeply nested and undocumented; the normalizer does the
// defensive field-picking, so `unknown` is the honest type to hand it.
export function fetchScoreboard(league: League): Promise<unknown> {
  return getJson<unknown>(scoreboardUrl(league));
}

export function fetchSummary(league: League, eventId: string): Promise<unknown> {
  return getJson<unknown>(summaryUrl(league, eventId));
}
