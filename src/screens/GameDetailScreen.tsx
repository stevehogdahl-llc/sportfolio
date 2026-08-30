import { Stack, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { League } from '@/api/types';
import { LeaderRow } from '@/components/LeaderRow';
import { LinescoreTable } from '@/components/LinescoreTable';
import { SituationStrip } from '@/components/SituationStrip';
import { ErrorState, LoadingState } from '@/components/States';
import { StatusPill } from '@/components/StatusPill';
import { TeamRow } from '@/components/TeamRow';
import { useGameDetail } from '@/hooks/useGameDetail';

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
  const awayDim = g.state === 'post' && home.isWinner;
  const homeDim = g.state === 'post' && away.isWinner;

  return frame(
    <>
      <View className="rounded-[12px] border border-line bg-surface p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <StatusPill state={g.state} shortDetail={g.shortDetail} startDate={g.startDate} />
          {g.venue ? (
            <Text numberOfLines={1} className="ml-3 flex-1 text-right font-mono-rg text-[10px] text-ink-faint">
              {g.venue}
            </Text>
          ) : null}
        </View>
        <TeamRow side={away} dim={awayDim} scoreSize={30} />
        <TeamRow side={home} dim={homeDim} scoreSize={30} />
      </View>

      {g.state === 'in' && g.situation ? (
        <SituationStrip league={g.league} situation={g.situation} />
      ) : null}

      {g.periods.length > 0 ? (
        <Section title="Line Score">
          <LinescoreTable
            periods={g.periods}
            periodLabel={g.periodLabel}
            away={away}
            home={home}
            currentPeriod={g.currentPeriod}
          />
        </Section>
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
