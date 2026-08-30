import type {
  Game,
  GameDetail,
  GameOdds,
  GameState,
  Leader,
  League,
  PeriodScore,
  Situation,
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
    hits: state === 'pre' ? null : asNumOrNull(dig(c, 'hits')),
    errors: state === 'pre' ? null : asNumOrNull(dig(c, 'errors')),
  };
}

/** Leading ordinal in a status string: "Top 7th" → 7, "2nd Quarter" → 2. */
function parseOrdinalPeriod(text: string): number | null {
  const m = text.match(/(\d+)\s*(?:st|nd|rd|th)/i);
  return m ? Number(m[1]) : null;
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
    situation: state === 'in' ? normalizeSituation(league, dig(comp, 'situation'), sides) : null,
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
  // MLB box scores always show a full 9-inning grid once play starts; innings not
  // yet played render as blank cells. Extra innings extend past 9 as usual.
  const minPeriods = league === 'mlb' && state !== 'pre' ? 9 : 0;
  const periodCount = Math.max(awayLs.length, homeLs.length, minPeriods);
  const periods: PeriodScore[] = [];
  for (let i = 0; i < periodCount; i++) {
    periods.push({
      label: String(i + 1),
      away: i < awayLs.length ? lineValue(awayLs[i]) : '',
      home: i < homeLs.length ? lineValue(homeLs[i]) : '',
    });
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
    currentPeriod: state === 'in' ? parseOrdinalPeriod(statusDetail || shortDetail) : null,
    leaders: normalizeLeaders(dig(raw, 'leaders')),
    venue,
    // The summary feed's `situation` is a stripped-down stub (no base state, no
    // player names); the live strip reads the full block from the scoreboard feed.
    situation: null,
  };
}

const ORDINAL = ['', '1st', '2nd', '3rd', '4th'];

/**
 * Live `competition.situation` block from the scoreboard feed (the summary feed
 * only carries a stub). Shape differs by sport, so both halves of
 * {@link Situation} are filled defensively.
 */
function normalizeSituation(league: League, raw: unknown, sides: TeamSide[]): Situation | null {
  if (raw == null || typeof raw !== 'object') return null;
  const s = raw as Dict;

  const lastPlay = asStr(dig(s, 'lastPlay', 'text')) || null;

  const athleteName = (who: 'batter' | 'pitcher'): string | null =>
    asStr(dig(s, who, 'athlete', 'shortName')) ||
    asStr(dig(s, who, 'athlete', 'displayName')) ||
    null;

  if (league === 'nfl') {
    const possId = asStr(dig(s, 'possession')) || asStr(dig(s, 'lastPlay', 'team', 'id'));
    const holder = sides.find((t) => t.id && t.id === possId) ?? null;
    const down = asNumOrNull(dig(s, 'down'));
    const distance = asNumOrNull(dig(s, 'distance'));
    const downDistance =
      asStr(dig(s, 'shortDownDistanceText')) ||
      (down != null && down >= 1 && down <= 4
        ? `${ORDINAL[down]} & ${distance ?? 10}`
        : '') ||
      null;

    return {
      kind: 'football',
      lastPlay,
      balls: null,
      strikes: null,
      outs: null,
      onFirst: false,
      onSecond: false,
      onThird: false,
      batter: null,
      pitcher: null,
      downDistance,
      ballSpot: asStr(dig(s, 'possessionText')) || null,
      possessionAbbrev: holder?.abbrev ?? null,
      isRedZone: dig(s, 'isRedZone') === true,
      homeTimeouts: asNumOrNull(dig(s, 'homeTimeouts')),
      awayTimeouts: asNumOrNull(dig(s, 'awayTimeouts')),
    };
  }

  return {
    kind: 'baseball',
    lastPlay,
    balls: asNumOrNull(dig(s, 'balls')),
    strikes: asNumOrNull(dig(s, 'strikes')),
    outs: asNumOrNull(dig(s, 'outs')),
    onFirst: dig(s, 'onFirst') === true,
    onSecond: dig(s, 'onSecond') === true,
    onThird: dig(s, 'onThird') === true,
    batter: athleteName('batter'),
    pitcher: athleteName('pitcher'),
    downDistance: null,
    ballSpot: null,
    possessionAbbrev: null,
    isRedZone: false,
    homeTimeouts: null,
    awayTimeouts: null,
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
