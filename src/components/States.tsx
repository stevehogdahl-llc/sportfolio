import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { usePalette } from '@/constants/theme';

const shell = 'items-center rounded-[10px] border border-dashed border-line bg-surface px-4 py-6';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const palette = usePalette();
  return (
    <View className={`${shell} gap-2.5`}>
      <ActivityIndicator color={palette.inkDim} />
      <Text className="text-[13px] text-ink-dim">{label}</Text>
    </View>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <View className={shell}>
      <Text className="text-[13px] text-ink-dim">{label}</Text>
    </View>
  );
}

export function ErrorState({ label, onRetry }: { label: string; onRetry?: () => void }) {
  return (
    <View className={`${shell} gap-3`}>
      <Text className="text-center text-[13px] text-ink-dim">{label}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          className="rounded-md border border-line bg-surface-2 px-3.5 py-1.5"
        >
          <Text className="text-[13px] text-ink">Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
