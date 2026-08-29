import { ScrollView, Text, View } from 'react-native';

import type { PeriodScore, TeamSide } from '@/api/types';

type Props = {
  periods: PeriodScore[];
  /** "Q" (NFL) or "Inn" (MLB) — only used to pick the total-column header */
  periodLabel: string;
  away: TeamSide;
  home: TeamSide;
};

const numCell = 'w-8 text-center font-mono-md text-[13px] text-ink';
const headCell = 'w-8 text-center font-mono-rg text-[11px] uppercase text-ink-faint';

export function LinescoreTable({ periods, periodLabel, away, home }: Props) {
  if (periods.length === 0) return null;
  const totalHeader = periodLabel === 'Q' ? 'T' : 'R';

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View className="flex-row items-center border-b border-line pb-1.5">
          <Text className="w-12"> </Text>
          {periods.map((p) => (
            <Text key={p.label} className={headCell}>
              {p.label}
            </Text>
          ))}
          <Text className={`${headCell} w-10 text-ink-dim`}>{totalHeader}</Text>
        </View>

        {[away, home].map((side, rowIdx) => (
          <View key={side.id || rowIdx} className="flex-row items-center py-1.5">
            <Text className="w-12 font-mono-md text-[12px] uppercase text-ink-dim">{side.abbrev}</Text>
            {periods.map((p) => (
              <Text key={p.label} className={numCell}>
                {rowIdx === 0 ? p.away : p.home}
              </Text>
            ))}
            <Text className={`${numCell} w-10 font-mono`}>{side.score ?? '–'}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
