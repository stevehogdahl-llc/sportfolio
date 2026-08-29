import { useQuery } from '@tanstack/react-query';

import { fetchScoreboard } from '@/api/espn';
import { normalizeScoreboard } from '@/api/normalize';
import type { Game, League } from '@/api/types';

const POLL_MS = 30_000;

export function useScoreboard(league: League) {
  return useQuery<Game[]>({
    queryKey: ['scoreboard', league],
    queryFn: async () => normalizeScoreboard(league, await fetchScoreboard(league)),
    refetchInterval: POLL_MS,
  });
}
