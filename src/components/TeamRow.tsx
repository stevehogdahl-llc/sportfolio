import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import type { TeamSide } from '@/api/types';
import { useDensityTokens, useShowRecords } from '@/settings';
import { ScoreText } from './ScoreText';

type Props = {
  side: TeamSide;
  /** losing side of a final */
  dim?: boolean;
  /** overrides the density default — the game-detail header uses a larger score */
  scoreSize?: number;
};

export function TeamRow({ side, dim, scoreSize }: Props) {
  const d = useDensityTokens();
  const showRecords = useShowRecords();

  return (
    <View className={`flex-row items-center justify-between ${d.rowPad}`}>
      <View className="flex-1 flex-row items-center gap-2.5 pr-2">
        {side.logo ? (
          <Image
            source={{ uri: side.logo }}
            style={{ width: d.logoSize, height: d.logoSize }}
            contentFit="contain"
            transition={120}
          />
        ) : (
          <View style={{ width: d.logoSize, height: d.logoSize }} />
        )}
        <Text
          numberOfLines={1}
          className={
            dim
              ? `${d.nameText} font-normal text-ink-dim`
              : `${d.nameText} font-semibold text-ink`
          }
        >
          {side.name}
        </Text>
        {showRecords && side.record ? (
          <Text className="font-mono-rg text-[11px] text-ink-faint">{side.record}</Text>
        ) : null}
      </View>
      <ScoreText value={side.score} dim={dim} size={scoreSize ?? d.scoreSize} />
    </View>
  );
}
