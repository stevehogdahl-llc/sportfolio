import { useQuery } from '@tanstack/react-query';

import { fetchSummary } from '@/api/espn';
import { normalizeSummary } from '@/api/normalize';
import type { GameDetail, League } from '@/api/types';

const LIVE_POLL_MS = 15_000;

export function useGameDetail(league: League, eventId: string) {
  return useQuery<GameDetail>({
    queryKey: ['summary', league, eventId],
    queryFn: async () => normalizeSummary(league, eventId, await fetchSummary(league, eventId)),
    enabled: eventId.length > 0,
    // poll only while the game is in progress
    refetchInterval: (query) => (query.state.data?.state === 'in' ? LIVE_POLL_MS : false),
  });
}
