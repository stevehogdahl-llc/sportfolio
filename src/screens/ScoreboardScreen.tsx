import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { type ReactNode, useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { League } from '@/api/types';
import { GameCard } from '@/components/GameCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { leagueLabel, usePalette } from '@/constants/theme';
import { useScoreboard } from '@/hooks/useScoreboard';
import { fmtUpdatedAgo } from '@/lib/time';
import { useSettingsStore } from '@/settings';

export function ScoreboardScreen({ league }: { league: League }) {
  const q = useScoreboard(league);
  const router = useRouter();
  const palette = usePalette();
  const label = leagueLabel[league];

  // Remember the league in view so "Open to: Last viewed" can return here.
  const setLastLeague = useSettingsStore((s) => s.setLastLeague);
  useFocusEffect(
    useCallback(() => {
      setLastLeague(league);
    }, [league, setLastLeague]),
  );

  const header = (
    <View className="flex-row items-start justify-between pb-3">
      <View>
        <Text className="font-display text-2xl uppercase tracking-wide text-ink">{label}</Text>
        <Text className="mt-1 font-mono-rg text-[11px] text-ink-faint">
          {q.isFetching && !q.isRefetching ? 'Refreshing…' : fmtUpdatedAgo(q.dataUpdatedAt)}
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

  if (q.isPending) {
    return frame(
      <View className="px-4 pt-2">
        {header}
        <LoadingState label={`Loading ${label} games…`} />
      </View>,
    );
  }

  if (q.isError) {
    return frame(
      <View className="px-4 pt-2">
        {header}
        <ErrorState label={`Couldn't load ${label} scores.`} onRetry={() => void q.refetch()} />
      </View>,
    );
  }

  return frame(
    <FlatList
      data={q.data}
      keyExtractor={(g) => g.id}
      renderItem={({ item }) => <GameCard game={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState label="No games scheduled today." />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => void q.refetch()}
          tintColor={palette.inkDim}
        />
      }
    />,
  );
}
