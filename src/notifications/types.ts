import type { GameState, League } from '@/api/types';

export type Leader = 'away' | 'home' | 'tie';

/** Minimal per-game state we retain between polls to detect what changed. */
export interface GameSnapshot {
  state: GameState;
  awayScore: number | null;
  homeScore: number | null;
  leader: Leader;
  /** a close-game alert has already been sent for this game */
  notifiedClose: boolean;
}

/** Keyed by `${league}:${eventId}`. */
export type Snapshot = Record<string, GameSnapshot>;

/** A notification ready to be presented; `id` is the OS dedupe identifier. */
export interface LocalNotif {
  id: string;
  title: string;
  body: string;
  data: { league: League; eventId: string };
}
