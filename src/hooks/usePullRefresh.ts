import { useState } from 'react';

/**
 * Drives a RefreshControl so its spinner shows only while the user's own
 * pull-to-refresh is in flight — never during background polling or
 * refetch-on-focus (which is what `query.isRefetching` would also catch).
 */
export function usePullRefresh(...refetch: (() => Promise<unknown>)[]) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    void Promise.allSettled(refetch.map((r) => r())).finally(() => setRefreshing(false));
  };

  return { refreshing, onRefresh };
}
