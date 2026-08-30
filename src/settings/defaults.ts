import type { Settings } from './types';

/** Initial settings for a fresh install; also the fallback for a failed migration. */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  cardDensity: 'comfortable',
  showRecords: true,
  showOdds: false,
  openTo: 'last',
  tabs: ['mlb', 'nfl', 'favorites'],
  lastLeague: 'mlb',
  favorites: [],
  notifications: {
    enabled: false,
    scope: 'favorites',
    categories: {
      gameStart: true,
      finalScore: true,
      leadChange: true,
      scoringPlay: true,
      closeGame: true,
    },
  },
};
