import type {
  Game,
  GameDetail,
  GameOdds,
  GameState,
  Leader,
  League,
  PeriodScore,
  TeamSide,
} from './types';

/**
 * Defensive mappers from raw ESPN JSON to the app's own types. Everything ESPN
 * hands back is treated as `unknown` and walked with the helpers below, so a
 * missing or renamed field degrades to a sensible default instead of throwing.
 */

type Dict = Record<string, unknown>;

const asDict = (v: unknown): Dict => (v !== null && typeof v === 'object' ? (v as Dict) : {});
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asStr = (v: unknown): string =>
  typeof v === 'string' ? v : typeof v === 'number' && Number.isFinite(v) ? String(v) : '';

const asNumOrNull = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
};

/** Walk a nested structure by keys (strings for objects, numbers for arrays). */
function dig(root: unknown, ...keys: (string | number)[]): unknown {
  let cur: unknown = root;
  for (const k of keys) {
    if (cur == null) return undefined;
    cur = typeof k === 'number' ? (Array.isArray(cur) ? cur[k] : undefined) : asDict(cur)[k];
  }
  return cur;
}

function coerceState(s: string): GameState {
  return s === 'in' || s === 'post' ? s : 'pre';
}

/** ESPN lists competitors home-first; the app always wants [away, home]. */
function orderedCompetitors(v: unknown): unknown[] {
  return asArr(v)
    .slice(0, 2)
    .sort((a) => (asStr(dig(a, 'homeAway')) === 'away' ? -1 : 1));
}

function normalizeCompetitor(c: unknown, state: GameState): TeamSide {
  const team = dig(c, 'team');
  const name =
    asStr(dig(team, 'shortDisplayName')) ||
    asStr(dig(team, 'displayName')) ||
    asStr(dig(team, 'name')) ||
    asStr(dig(team, 'abbreviation')) ||
    'TBD';
  const logo =
    asStr(dig(team, 'logo')) || asStr(dig(team, 'logos', 0, 'href')) || null;
  const record =
    asStr(dig(c, 'records', 0, 'summary')) ||
    asStr(dig(c, 'record', 0, 'summary')) ||
    asStr(dig(c, 'record')) ||
    null;

  return {
    id: asStr(dig(c, 'id')),
    name,
    abbrev: asStr(dig(team, 'abbreviation')) || name.slice(0, 3).toUpperCase(),
    logo,
    score: state === 'pre' ? null : asNumOrNull(dig(c, 'score')),
    record,
    isWinner: dig(c, 'winner') === true,
    homeAway: asStr(dig(c, 'homeAway')) === 'home' ? 'home' : 'away',
  };
}

function statusFields(statusType: unknown, startDate: string) {
  const detail = asStr(dig(statusType, 'detail'));
  const short = asStr(dig(statusType, 'shortDetail'));
  return {
    statusDetail: detail || short || startDate,
    shortDetail: short || detail || startDate,
  };
}

// --- scoreboard -----------------------------------------------------------

/** Display order: live games first, then upcoming, then finished. */
const STATE_ORDER: Record<GameState, number> = { in: 0, pre: 1, post: 2 };

export function normalizeScoreboard(league: League, raw: unknown): Game[] {
  return asArr(dig(raw, 'events'))
    .map((ev) => normalizeEvent(league, ev))
    .filter((g): g is Game => g !== null)
    .sort(
      (a, b) =>
        STATE_ORDER[a.state] - STATE_ORDER[b.state] || a.startDate.localeCompare(b.startDate),
    );
}

function normalizeEvent(league: League, ev: unknown): Game | null {
  const id = asStr(dig(ev, 'id'));
  const comp = dig(ev, 'competitions', 0);
  if (!id || comp == null) return null;

  const state = coerceState(asStr(dig(ev, 'status', 'type', 'state')));
  const startDate = asStr(dig(ev, 'date'));
  const { statusDetail, shortDetail } = statusFields(dig(ev, 'status', 'type'), startDate);

  const sides = orderedCompetitors(dig(comp, 'competitors')).map((c) =>
    normalizeCompetitor(c, state),
  );
  if (sides.length !== 2) return null;

  return {
    id,
    league,
    state,
    statusDetail,
    shortDetail,
    startDate,
    competitors: [sides[0], sides[1]],
    odds: state === 'pre' ? normalizeOdds(comp) : null,
  };
}

/** ESPN's featured line lives at `competition.odds[0]`; empty once a game starts. */
function normalizeOdds(comp: unknown): GameOdds | null {
  const o = dig(comp, 'odds', 0);
  if (o == null) return null;

  const rawDetails = asStr(dig(o, 'details')).trim();
  // ESPN uses "OFF" (line pulled) and "" for "no usable spread"; "EVEN" is a real pick'em.
  const details = rawDetails && rawDetails.toUpperCase() !== 'OFF' ? rawDetails : null;
  const overUnder = asNumOrNull(dig(o, 'overUnder'));

  return details == null && overUnder == null ? null : { details, overUnder };
}

// --- summary (game detail) ---------------------------------------------------

export function normalizeSummary(league: League, eventId: string, raw: unknown): GameDetail {
  const comp = dig(raw, 'header', 'competitions', 0);
  const state = coerceState(asStr(dig(comp, 'status', 'type', 'state')));
  const startDate = asStr(dig(comp, 'date'));
  const { statusDetail, shortDetail } = statusFields(dig(comp, 'status', 'type'), startDate);

  const rawCompetitors = orderedCompetitors(dig(comp, 'competitors'));
  const sides = rawCompetitors.map((c) => normalizeCompetitor(c, state));
  if (sides.length !== 2) throw new Error(`ESPN summary for ${eventId} is missing competitors`);

  const awayLs = asArr(dig(rawCompetitors[0], 'linescores'));
  const homeLs = asArr(dig(rawCompetitors[1], 'linescores'));
  const periods: PeriodScore[] = [];
  for (let i = 0; i < Math.max(awayLs.length, homeLs.length); i++) {
    periods.push({ label: String(i + 1), away: lineValue(awayLs[i]), home: lineValue(homeLs[i]) });
  }

  const venue =
    asStr(dig(raw, 'gameInfo', 'venue', 'fullName')) ||
    asStr(dig(comp, 'venue', 'fullName')) ||
    null;

  return {
    id: eventId,
    league,
    state,
    statusDetail,
    shortDetail,
    startDate,
    competitors: [sides[0], sides[1]],
    periods,
    periodLabel: league === 'nfl' ? 'Q' : 'Inn',
    leaders: normalizeLeaders(dig(raw, 'leaders')),
    venue,
  };
}

function lineValue(ls: unknown): string {
  return asStr(dig(ls, 'displayValue')) || asStr(dig(ls, 'value')) || '–';
}

function normalizeLeaders(v: unknown): Leader[] {
  const out: Leader[] = [];
  for (const teamBlock of asArr(v)) {
    const teamAbbrev = asStr(dig(teamBlock, 'team', 'abbreviation'));
    for (const cat of asArr(dig(teamBlock, 'leaders'))) {
      const top = dig(cat, 'leaders', 0);
      const athlete =
        asStr(dig(top, 'athlete', 'displayName')) || asStr(dig(top, 'athlete', 'shortName'));
      if (!athlete) continue;
      out.push({
        category: prettyCategory(
          asStr(dig(cat, 'shortDisplayName')) ||
            asStr(dig(cat, 'displayName')) ||
            asStr(dig(cat, 'name')),
        ),
        athlete,
        teamAbbrev,
        statLine: asStr(dig(top, 'displayValue')),
      });
    }
  }
  const seen = new Set<string>();
  return out.filter((l) => {
    const key = `${l.category}|${l.athlete}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function prettyCategory(s: string): string {
  if (!s) return 'Leader';
  const cleaned = s.replace(/ leader$/i, '').trim();
  const firstWord = cleaned.split(/(?=[A-Z])|\s+/)[0] || cleaned;
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
}
