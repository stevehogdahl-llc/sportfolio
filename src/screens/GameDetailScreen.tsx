import { Stack, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { League } from '@/api/types';
import { GameHeaderCard } from '@/components/GameHeaderCard';
import { LeaderRow } from '@/components/LeaderRow';
import { SituationStrip } from '@/components/SituationStrip';
import { ErrorState, LoadingState } from '@/components/States';
import { useGameDetail } from '@/hooks/useGameDetail';
import { useScoreboard } from '@/hooks/useScoreboard';

const isLeague = (v: unknown): v is League => v === 'mlb' || v === 'nfl';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-4">
      <Text className="mb-1.5 font-display-md text-[12px] uppercase tracking-wider text-ink-dim">
        {title}
      </Text>
      <View className="rounded-[12px] border border-line bg-surface p-3">{children}</View>
    </View>
  );
}

export function GameDetailScreen() {
  const params = useLocalSearchParams<{ league: string; id: string }>();
  const insets = useSafeAreaInsets();
  const league = isLeague(params.league) ? params.league : 'nfl';
  const id = typeof params.id === 'string' ? params.id : '';

  const q = useGameDetail(league, id);
  // The live bases/count block only comes on the scoreboard feed; pull it from
  // the same (polling) query the league tab uses and match this game by id.
  const sb = useScoreboard(league);
  const liveSituation = sb.data?.find((game) => game.id === id)?.situation ?? null;

  const frame = (children: ReactNode, title = 'Game') => (
    <>
      <Stack.Screen options={{ title }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      >
        {children}
      </ScrollView>
    </>
  );

  if (q.isPending) return frame(<LoadingState label="Loading game…" />);
  if (q.isError || !q.data) {
    return frame(
      <ErrorState label="Couldn't load this game." onRetry={() => void q.refetch()} />,
    );
  }

  const g = q.data;
  const [away, home] = g.competitors;

  return frame(
    <>
      <GameHeaderCard game={g} situation={liveSituation} />

      {g.state === 'in' && liveSituation ? (
        <SituationStrip league={g.league} situation={liveSituation} />
      ) : null}

      {g.leaders.length > 0 ? (
        <Section title="Leaders">
          {g.leaders.map((leader, i) => (
            <LeaderRow
              key={`${leader.category}-${leader.athlete}-${i}`}
              leader={leader}
              last={i === g.leaders.length - 1}
            />
          ))}
        </Section>
      ) : null}
    </>,
    `${away.abbrev} @ ${home.abbrev}`,
  );
}
