import { Text, View } from 'react-native';

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

// Period columns flex to share the row width (no horizontal scroll); the label
// and total columns are fixed and narrow.
const periodNum = 'flex-1 text-center font-mono-md text-[12px] text-ink';
const periodHead = 'flex-1 text-center font-mono-rg text-[10px] uppercase text-ink-faint';
const totNum = 'w-6 text-center font-mono-md text-[12px]';
const totHead = 'w-6 text-center font-mono-rg text-[10px] uppercase text-ink-faint';

export function LinescoreTable({ periods, periodLabel, away, home, currentPeriod }: Props) {
  if (periods.length === 0) return null;

  const isNfl = periodLabel === 'Q';
  const totalHeader = isNfl ? 'T' : 'R';
  const showHE = !isNfl && (away.hits != null || home.hits != null);

  const cur = currentPeriod != null ? String(currentPeriod) : null;
  const bandHead = (label: string) =>
    label === cur ? `${periodHead} rounded-t bg-surface-2 text-ink` : periodHead;
  const bandNum = (label: string, last: boolean) =>
    label === cur ? `${periodNum} bg-surface-2 ${last ? 'rounded-b' : ''}` : periodNum;

  return (
    <View>
      <View className="flex-row items-center border-b border-line pb-1.5">
        <Text className="w-8"> </Text>
        {periods.map((p) => (
          <Text key={p.label} className={bandHead(p.label)}>
            {p.label}
          </Text>
        ))}
        <Text className={`${totHead} text-ink-dim`}>{totalHeader}</Text>
        {showHE ? <Text className={totHead}>H</Text> : null}
        {showHE ? <Text className={totHead}>E</Text> : null}
      </View>

      {[away, home].map((side, rowIdx) => {
        const last = rowIdx === 1;
        return (
          <View key={side.id || rowIdx} className="flex-row items-center py-1.5">
            <Text className="w-8 font-mono-md text-[11px] uppercase text-ink-dim">{side.abbrev}</Text>
            {periods.map((p) => (
              <Text key={p.label} className={bandNum(p.label, last)}>
                {rowIdx === 0 ? p.away : p.home}
              </Text>
            ))}
            <Text className={`${totNum} font-mono text-ink`}>{side.score ?? '–'}</Text>
            {showHE ? <Text className={`${totNum} text-ink-dim`}>{side.hits ?? '–'}</Text> : null}
            {showHE ? <Text className={`${totNum} text-ink-dim`}>{side.errors ?? '–'}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}
