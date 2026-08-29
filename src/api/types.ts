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

export interface GameDetail extends Game {
  periods: PeriodScore[];
  /** header word for the period column: "Q" (NFL) or "Inn" (MLB) */
  periodLabel: string;
  leaders: Leader[];
  venue: string | null;
}
