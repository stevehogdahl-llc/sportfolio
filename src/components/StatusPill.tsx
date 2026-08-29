import { useEffect, useRef } from 'react';
import { Animated, Platform, Text, View } from 'react-native';

import type { GameState } from '@/api/types';
import { usePalette } from '@/constants/theme';
import { fmtStartWithDay } from '@/lib/time';

function LiveDot() {
  const palette = usePalette();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: palette.live, opacity }}
    />
  );
}

type Props = {
  state: GameState;
  shortDetail: string;
  startDate: string;
};

export function StatusPill({ state, shortDetail, startDate }: Props) {
  if (state === 'in') {
    return (
      <View className="flex-row items-center gap-1.5">
        <LiveDot />
        <Text className="font-mono-md text-[11px] uppercase tracking-wider text-live">
          {shortDetail || 'Live'}
        </Text>
      </View>
    );
  }

  const label = state === 'post' ? shortDetail || 'Final' : fmtStartWithDay(startDate);
  return (
    <Text className="font-mono-md text-[11px] uppercase tracking-wider text-ink-dim">{label}</Text>
  );
}
