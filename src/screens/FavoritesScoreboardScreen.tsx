import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { type ReactNode, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Game, GameState } from '@/api/types';
import { GameCard } from '@/components/GameCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { usePalette } from '@/constants/theme';
import { usePullRefresh } from '@/hooks/usePullRefresh';
import { useScoreboard } from '@/hooks/useScoreboard';
import { gameHasFavorite } from '@/lib/favorites';
import { fmtUpdatedAgo } from '@/lib/time';
import { useSettingsStore } from '@/settings';

/** Live first, then upcoming, then finished — matches the per-league scoreboard. */
const STATE_ORDER: Record<GameState, number> = { in: 0, pre: 1, post: 2 };

/** Cross-league scoreboard limited to games featuring a favorited team. */
export function FavoritesScoreboardScreen() {
  const router = useRouter();
  const palette = usePalette();
  const mlb = useScoreboard('mlb');
  const nfl = useScoreboard('nfl');
  const favorites = useSettingsStore((s) => s.favorites);

  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const games = useMemo(() => {
    const all: Game[] = [...(mlb.data ?? []), ...(nfl.data ?? [])];
    return all
      .filter((g) => gameHasFavorite(g, favSet))
      .sort(
        (a, b) =>
          STATE_ORDER[a.state] - STATE_ORDER[b.state] || a.startDate.localeCompare(b.startDate),
      );
  }, [mlb.data, nfl.data, favSet]);

  // Show blocking states only when there's nothing to display — partial data
  // (one league loaded, the other still fetching) renders straight away.
  const isInitialLoading = games.length === 0 && (mlb.isPending || nfl.isPending);
  const isError = games.length === 0 && mlb.isError && nfl.isError;
  const updatedAt = Math.max(mlb.dataUpdatedAt || 0, nfl.dataUpdatedAt || 0);
  const pull = usePullRefresh(mlb.refetch, nfl.refetch);

  const header = (
    <View className="flex-row items-start justify-between pb-3">
      <View>
        <Text className="font-display text-2xl uppercase tracking-wide text-ink">Favorites</Text>
        <Text className="mt-1 font-mono-rg text-[11px] text-ink-faint">
          {fmtUpdatedAgo(updatedAt)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Settings"
        hitSlop={10}
        onPress={() => router.push('/settings')}
        style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
        className="p-1"
      >
        <Ionicons name="settings-outline" size={22} color={palette.inkDim} />
      </Pressable>
    </View>
  );

  // top edge only — the bottom is covered by the tab bar, which insets itself
  const frame = (children: ReactNode) => (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      {children}
    </SafeAreaView>
  );

  if (favSet.size === 0) {
    return frame(
      <View className="px-4 pt-2">
        {header}
        <Pressable
          onPress={() => router.push('/settings/favorites')}
          style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
          className="items-center gap-2 rounded-[10px] border border-dashed border-line bg-surface px-4 py-6"
        >
          <Ionicons name="star-outline" size={24} color={palette.inkFaint} />
          <Text className="text-center text-[13px] text-ink-dim">
            Follow teams to see all their games here.
          </Text>
          <Text className="font-mono-md text-[12px] uppercase tracking-wide text-nfl">
            Pick favorites
          </Text>
        </Pressable>
      </View>,
    );
  }

  if (isInitialLoading) {
    return frame(
      <View className="px-4 pt-2">
        {header}
        <LoadingState label="Loading your teams…" />
      </View>,
    );
  }

  if (isError) {
    return frame(
      <View className="px-4 pt-2">
        {header}
        <ErrorState label="Couldn't load scores." onRetry={pull.onRefresh} />
      </View>,
    );
  }

  return frame(
    <FlatList
      data={games}
      keyExtractor={(g) => `${g.league}:${g.id}`}
      renderItem={({ item }) => <GameCard game={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState label="No games for your teams today." />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={pull.refreshing}
          onRefresh={pull.onRefresh}
          tintColor={palette.inkDim}
        />
      }
    />,
  );
}
