import type { League } from '@/api/types';

export type ThemePref = 'system' | 'light' | 'dark';
export type CardDensity = 'comfortable' | 'compact';
/** A bottom-tab identity — the two leagues plus the cross-league Favorites tab. */
export type TabKey = League | 'favorites';
/** Which tab the app lands on at launch. */
export type OpenTo = 'last' | TabKey;

export const ALL_TABS: TabKey[] = ['mlb', 'nfl', 'favorites'];

export function isLeagueTab(tab: TabKey): tab is League {
  return tab === 'mlb' || tab === 'nfl';
}

export interface NotificationCategories {
  gameStart: boolean;
  finalScore: boolean;
  leadChange: boolean;
  scoringPlay: boolean;
  closeGame: boolean;
}

export type NotificationCategory = keyof NotificationCategories;

export interface NotificationSettings {
  /** Master switch; also gated by the OS permission. */
  enabled: boolean;
  /** 'all' is further filtered by the enabled leagues in `Settings.tabs`. */
  scope: 'favorites' | 'all';
  categories: NotificationCategories;
}

export interface Settings {
  theme: ThemePref;
  cardDensity: CardDensity;
  showRecords: boolean;
  /** Show the pregame spread / over-under on scoreboard cards. */
  showOdds: boolean;
  openTo: OpenTo;
  /** Bottom tabs in display order. Always contains at least one league. */
  tabs: TabKey[];
  /** Internal — last scoreboard tab the user viewed, drives `openTo: 'last'`. */
  lastLeague: League;
  /** Favorited teams as `${league}:${teamId}` keys. */
  favorites: string[];
  notifications: NotificationSettings;
}

/** `${league}:${teamId}` key used throughout the favorites code. */
export function favoriteKey(league: League, teamId: string): string {
  return `${league}:${teamId}`;
}
