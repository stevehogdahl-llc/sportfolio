import type { League } from '@/api/types';

export type ThemePref = 'system' | 'light' | 'dark';
export type CardDensity = 'comfortable' | 'compact';
/** Which league the app lands on at launch. */
export type OpenTo = 'last' | League;

export interface NotificationSettings {
  /** Master switch; also gated by the OS permission. */
  enabled: boolean;
  /** 'all' is further filtered by `Settings.leagues`. */
  scope: 'favorites' | 'all';
  categories: {
    gameStart: boolean;
    finalScore: boolean;
    leadChange: boolean;
    scoringPlay: boolean;
    closeGame: boolean;
  };
}

export interface Settings {
  theme: ThemePref;
  cardDensity: CardDensity;
  showRecords: boolean;
  openTo: OpenTo;
  /** Ordered, non-empty subset of ['mlb', 'nfl']. */
  leagues: League[];
  /** Internal — last scoreboard tab the user viewed, drives `openTo: 'last'`. */
  lastLeague: League;
  /** Favorited teams as `${league}:${teamId}` keys. */
  favorites: string[];
  /** Internal — persisted state of the scoreboard "My Teams" filter toggle. */
  myTeamsFilter: boolean;
  notifications: NotificationSettings;
}

/** `${league}:${teamId}` key used throughout the favorites code. */
export function favoriteKey(league: League, teamId: string): string {
  return `${league}:${teamId}`;
}
