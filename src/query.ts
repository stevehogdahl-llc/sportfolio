import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client. Short staleTime so background refetches feel live;
 * per-query `refetchInterval` (see the hooks in src/hooks) drives polling.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
