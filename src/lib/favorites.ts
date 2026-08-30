import type { Game } from '@/api/types';
import { favoriteKey } from '@/settings';

/** True if either competitor in the game is a favorited team. */
export function gameHasFavorite(game: Game, favorites: Set<string>): boolean {
  if (favorites.size === 0) return false;
  return game.competitors.some((c) => favorites.has(favoriteKey(game.league, c.id)));
}

/**
 * Stable partition: games with a favorited team float to the top, everything
 * else keeps its incoming order (which already encodes state + start time).
 */
export function sortWithFavorites(games: Game[], favorites: Set<string>): Game[] {
  if (favorites.size === 0) return games;
  const fav: Game[] = [];
  const rest: Game[] = [];
  for (const g of games) (gameHasFavorite(g, favorites) ? fav : rest).push(g);
  return fav.length ? [...fav, ...rest] : games;
}
