export type League = 'mlb' | 'nfl';

/** ESPN status.type.state values. */
export type GameState = 'pre' | 'in' | 'post';

export interface TeamSide {
  id: string;
  /** short display name, e.g. "Yankees" / "Chiefs" */
  name: string;
  abbrev: string;
  logo: string | null;
  /** null before first pitch / kickoff */
  score: number | null;
  /** e.g. "82-54" or "2-1"; null when unavailable */
  record: string | null;
  isWinner: boolean;
  homeAway: 'home' | 'away';
  /** MLB game total — hits; null for NFL and before the feed carries it */
  hits: number | null;
  /** MLB game total — errors; null for NFL and before the feed carries it */
  errors: number | null;
}

export interface GameOdds {
  /** ESPN's preformatted spread, e.g. "CHI -1.5" or "EVEN"; null when not a usable line */
  details: string | null;
  /** over/under total, e.g. 36.5 */
  overUnder: number | null;
}

export interface Game {
  id: string;
  league: League;
  state: GameState;
  /** long status text, e.g. "Top 5th", "Final/10", "Sun, Sep 7 · 1:00 PM" */
  statusDetail: string;
  /** short status text, e.g. "Final", "3rd", "1:00 - 2nd" */
  shortDetail: string;
  /** ISO start time */
  startDate: string;
  /** always ordered [away, home] */
  competitors: [TeamSide, TeamSide];
  /** pregame betting line; null when the feed has none (always null once a game starts) */
  odds?: GameOdds | null;
  /**
   * Live bases/count (MLB) or down & distance (NFL). Only the scoreboard feed
   * carries the full block, so this is populated by `normalizeScoreboard`;
   * null unless `state === 'in'`.
   */
  situation: Situation | null;
}

export interface PeriodScore {
  /** period number as shown: "1", "2", … */
  label: string;
  away: string;
  home: string;
}

export interface Leader {
  /** e.g. "Passing", "Hitting" */
  category: string;
  athlete: string;
  teamAbbrev: string;
  /** formatted stat line, e.g. "18/24, 245 YDS, 2 TD" */
  statLine: string;
}

/** The batter or pitcher in the current MLB matchup. */
export interface PlayerBrief {
  /** full name, e.g. "Aaron Judge" */
  name: string;
  /** ESPN headshot URL; null when the feed omits it */
  headshot: string | null;
  /** roster position, e.g. "RF" / "SP" */
  position: string | null;
  /** jersey number as a string, e.g. "99" */
  jersey: string | null;
  /** today's line so far, e.g. "0-1, BB, K" or "5.2 IP, 0 ER, 2 H, 6 K" */
  line: string | null;
}

/**
 * Live game state, present only while `state === 'in'`. One shape covers both
 * sports; the `kind` field says which half is meaningful.
 */
export interface Situation {
  kind: 'baseball' | 'football';
  /** text of the most recent play, when the feed carries it */
  lastPlay: string | null;

  // baseball — null between half-innings / when not sent
  balls: number | null;
  strikes: number | null;
  outs: number | null;
  onFirst: boolean;
  onSecond: boolean;
  onThird: boolean;
  /** batter at the plate; null between innings */
  batter: PlayerBrief | null;
  /** current pitcher; null between innings */
  pitcher: PlayerBrief | null;

  // football
  /** e.g. "2nd & 7"; null on kickoffs / extra points */
  downDistance: string | null;
  /** e.g. "KC 45" — ball spot */
  ballSpot: string | null;
  /** abbrev of the team with possession, e.g. "KC"; null if unknown */
  possessionAbbrev: string | null;
  isRedZone: boolean;
  homeTimeouts: number | null;
  awayTimeouts: number | null;
}

export interface GameDetail extends Game {
  periods: PeriodScore[];
  /** header word for the period column: "Q" (NFL) or "Inn" (MLB) */
  periodLabel: string;
  /** period (inning / quarter) currently in progress; null unless `state === 'in'` */
  currentPeriod: number | null;
  leaders: Leader[];
  venue: string | null;
}

/** A team as listed in ESPN's league directory — used for the favorites picker. */
export interface TeamRef {
  id: string;
  league: League;
  /** short display name, e.g. "Yankees" / "Chiefs" */
  name: string;
  /** full display name, e.g. "New York Yankees" — used for search/sort */
  fullName: string;
  abbrev: string;
  logo: string | null;
}
