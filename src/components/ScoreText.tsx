import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { usePalette } from '@/constants/theme';

type Props = {
  value: number | null;
  /** dim styling for the losing side of a final */
  dim?: boolean;
  size?: number;
};

/**
 * Monospaced, tabular score. Briefly flashes red when the value changes
 * between renders (ports the legacy scoreboard's `score-flash`).
 */
export function ScoreText({ value, dim, size = 26 }: Props) {
  const palette = usePalette();
  const prev = useRef<number | null>(value);
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (prev.current !== null && value !== null && value !== prev.current) {
      flash.setValue(1);
      Animated.timing(flash, { toValue: 0, duration: 900, useNativeDriver: false }).start();
    }
    prev.current = value;
  }, [value, flash]);

  const color = flash.interpolate({
    inputRange: [0, 1],
    outputRange: [dim ? palette.inkDim : palette.ink, palette.live],
  });

  return (
    <Animated.Text
      style={{
        color,
        fontFamily: 'JetBrainsMono_700Bold',
        fontSize: size,
        fontVariant: ['tabular-nums'],
        paddingLeft: 10,
      }}
    >
      {value === null ? '–' : value}
    </Animated.Text>
  );
}
