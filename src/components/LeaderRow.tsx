import { Text, View } from 'react-native';

import type { Leader } from '@/api/types';

export function LeaderRow({ leader, last }: { leader: Leader; last?: boolean }) {
  return (
    <View
      className={
        last
          ? 'flex-row items-center justify-between py-2'
          : 'flex-row items-center justify-between border-b border-line py-2'
      }
    >
      <View className="flex-1 pr-3">
        <Text className="font-mono-rg text-[10px] uppercase tracking-wider text-ink-faint">
          {leader.category}
          {leader.teamAbbrev ? ` · ${leader.teamAbbrev}` : ''}
        </Text>
        <Text numberOfLines={1} className="text-[14px] font-semibold text-ink">
          {leader.athlete}
        </Text>
      </View>
      <Text className="font-mono-md text-[12px] text-ink-dim">{leader.statLine}</Text>
    </View>
  );
}
