import { ScrollView, Text, View } from 'react-native';

import type { PeriodScore, TeamSide } from '@/api/types';

type Props = {
  periods: PeriodScore[];
  /** "Q" (NFL) or "Inn" (MLB) — picks the total-column header and gates H/E */
  periodLabel: string;
  away: TeamSide;
  home: TeamSide;
  /** inning / quarter in progress — its column gets highlighted */
  currentPeriod?: number | null;
};

const numCell = 'w-8 text-center font-mono-md text-[13px] text-ink';
const headCell = 'w-8 text-center font-mono-rg text-[11px] uppercase text-ink-faint';
const totCell = 'w-9 text-center font-mono-md text-[13px]';

export function LinescoreTable({ periods, periodLabel, away, home, currentPeriod }: Props) {
  if (periods.length === 0) return null;

  const isNfl = periodLabel === 'Q';
  const totalHeader = isNfl ? 'T' : 'R';
  const showHE = !isNfl && (away.hits != null || home.hits != null);

  const cur = currentPeriod != null ? String(currentPeriod) : null;
  const bandHead = (label: string) =>
    label === cur ? `${headCell} rounded-t bg-surface-2 text-ink` : headCell;
  const bandCell = (label: string, last: boolean) =>
    label === cur ? `${numCell} bg-surface-2 ${last ? 'rounded-b' : ''}` : numCell;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View className="flex-row items-center border-b border-line pb-1.5">
          <Text className="w-12"> </Text>
          {periods.map((p) => (
            <Text key={p.label} className={bandHead(p.label)}>
              {p.label}
            </Text>
          ))}
          <Text className={`${headCell} w-9 text-ink-dim`}>{totalHeader}</Text>
          {showHE ? <Text className={`${headCell} w-9`}>H</Text> : null}
          {showHE ? <Text className={`${headCell} w-9`}>E</Text> : null}
        </View>

        {[away, home].map((side, rowIdx) => {
          const last = rowIdx === 1;
          return (
            <View key={side.id || rowIdx} className="flex-row items-center py-1.5">
              <Text className="w-12 font-mono-md text-[12px] uppercase text-ink-dim">
                {side.abbrev}
              </Text>
              {periods.map((p) => (
                <Text key={p.label} className={bandCell(p.label, last)}>
                  {rowIdx === 0 ? p.away : p.home}
                </Text>
              ))}
              <Text className={`${totCell} font-mono text-ink`}>{side.score ?? '–'}</Text>
              {showHE ? (
                <Text className={`${totCell} text-ink-dim`}>{side.hits ?? '–'}</Text>
              ) : null}
              {showHE ? (
                <Text className={`${totCell} text-ink-dim`}>{side.errors ?? '–'}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
