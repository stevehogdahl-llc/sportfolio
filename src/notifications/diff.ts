import type { Game, League } from '@/api/types';
import type { NotificationSettings } from '@/settings';
import type { GameSnapshot, Leader, LocalNotif, Snapshot } from './types';

/** Margin (points/runs) at or below which an in-progress game counts as "close". */
const CLOSE_MARGIN: Record<League, number> = { nfl: 8, mlb: 2 };

/** Loose "is it late enough for a close-game alert" check against the status text. */
function isLate(league: League, shortDetail: string): boolean {
  const s = shortDetail.toLowerCase();
  if (s.includes('ot')) return true;
  return league === 'nfl' ? s.includes('4th') : /\b(8th|9th|1[0-9]th)\b/.test(s);
}

function leaderOf(a: number | null, h: number | null): Leader {
  if (a == null || h == null || a === h) return 'tie';
  return a > h ? 'away' : 'home';
}

export function snapshotOf(g: Game): GameSnapshot {
  const [away, home] = g.competitors;
  return {
    state: g.state,
    awayScore: away.score,
    homeScore: home.score,
    leader: leaderOf(away.score, home.score),
    notifiedClose: false,
  };
}

/**
 * Pure diff of a fresh set of games against the previous snapshot. Returns the
 * notifications to present and the snapshot to persist. `games` must already be
 * filtered to the user's notification scope.
 */
export function diffGames(
  prev: Snapshot,
  games: Game[],
  prefs: NotificationSettings,
): { fire: LocalNotif[]; next: Snapshot } {
  const cats = prefs.categories;
  const fire: LocalNotif[] = [];
  const next: Snapshot = {};

  for (const g of games) {
    const key = `${g.league}:${g.id}`;
    const snap = snapshotOf(g);
    const before = prev[key];
    next[key] = snap;
    if (!before) continue; // first sighting — establish baseline silently

    const [away, home] = g.competitors;
    const matchup = `${away.abbrev} @ ${home.abbrev}`;
    const line = `${away.abbrev} ${away.score ?? 0}, ${home.abbrev} ${home.score ?? 0}`;
    const push = (suffix: string, title: string, body: string) =>
      fire.push({ id: `${key}:${suffix}`, title, body, data: { league: g.league, eventId: g.id } });

    // Final
    if (before.state === 'in' && snap.state === 'post' && cats.finalScore) {
      push('final', `Final · ${matchup}`, line);
    }

    if (snap.state === 'in') {
      const awayUp = (snap.awayScore ?? 0) > (before.awayScore ?? 0);
      const homeUp = (snap.homeScore ?? 0) > (before.homeScore ?? 0);

      // Scoring play
      if ((awayUp || homeUp) && cats.scoringPlay) {
        const who = awayUp ? away.abbrev : home.abbrev;
        push('score', `${who} scored`, line);
      }

      // Lead change (ignore ties and the opening score)
      if (
        cats.leadChange &&
        snap.leader !== 'tie' &&
        before.leader !== 'tie' &&
        snap.leader !== before.leader
      ) {
        const lead = snap.leader === 'away' ? away.abbrev : home.abbrev;
        push('lead', `${lead} take the lead`, line);
      }

      // Close game — once per game, only when it's late
      const margin = Math.abs((snap.awayScore ?? 0) - (snap.homeScore ?? 0));
      if (
        cats.closeGame &&
        !before.notifiedClose &&
        margin <= CLOSE_MARGIN[g.league] &&
        isLate(g.league, g.shortDetail)
      ) {
        push('close', `Close game · ${matchup}`, `${g.shortDetail} — ${line}`);
        snap.notifiedClose = true;
      } else {
        snap.notifiedClose = before.notifiedClose;
      }
    }
  }

  return { fire, next };
}
