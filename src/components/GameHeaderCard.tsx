import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import type { GameDetail, GameState, TeamSide } from '@/api/types';
import { fmtStartWithDay } from '@/lib/time';
import { LinescoreTable } from './LinescoreTable';
import { ScoreText } from './ScoreText';

type Props = {
  game: GameDetail;
};

/**
 * Hero card at the top of the game-detail screen: status badge, both teams with
 * big scores flanking the period, and the line score folded in below.
 */
export function GameHeaderCard({ game }: Props) {
  const [away, home] = game.competitors;
  const isPost = game.state === 'post';
  const awayDim = isPost && home.isWinner;
  const homeDim = isPost && away.isWinner;

  const centerMain = game.state === 'pre' ? fmtStartWithDay(game.startDate) : game.statusDetail;

  return (
    <View className="rounded-[12px] border border-line bg-surface p-4">
      <StatusBadge state={game.state} />

      <View className="mt-3 flex-row items-center justify-between">
        <TeamBlock side={away} />
        <ScoreText value={away.score} dim={awayDim} size={42} />

        <View className="flex-1 items-center px-1">
          <Text numberOfLines={1} className="font-display-md text-[15px] text-ink">
            {centerMain}
          </Text>
        </View>

        <ScoreText value={home.score} dim={homeDim} size={42} />
        <TeamBlock side={home} />
      </View>

      {game.periods.length > 0 ? (
        <View className="mt-4 border-t border-line pt-3">
          <LinescoreTable
            periods={game.periods}
            periodLabel={game.periodLabel}
            away={away}
            home={home}
            currentPeriod={game.currentPeriod}
          />
        </View>
      ) : null}
    </View>
  );
}

function StatusBadge({ state }: { state: GameState }) {
  if (state === 'in') {
    return (
      <View className="items-center">
        <View className="flex-row items-center gap-1.5 rounded-full bg-live px-3 py-1">
          <View className="h-1.5 w-1.5 rounded-full bg-white" />
          <Text className="font-display-md text-[12px] uppercase tracking-wider text-white">
            Live
          </Text>
        </View>
      </View>
    );
  }
  if (state === 'post') {
    return (
      <View className="items-center">
        <View className="rounded-full border border-line bg-surface-2 px-3 py-1">
          <Text className="font-display-md text-[12px] uppercase tracking-wider text-ink-dim">
            Final
          </Text>
        </View>
      </View>
    );
  }
  return null;
}

function TeamBlock({ side }: { side: TeamSide }) {
  return (
    <View className="w-[74px] items-center gap-1">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-2">
        {side.logo ? (
          <Image
            source={{ uri: side.logo }}
            style={{ width: 40, height: 40 }}
            contentFit="contain"
            transition={120}
          />
        ) : null}
      </View>
      <Text className="font-display-md text-[14px] uppercase text-ink">{side.abbrev}</Text>
      <Text numberOfLines={1} className="text-[11px] text-ink-dim">
        {side.name}
      </Text>
    </View>
  );
}
