import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  label: string;
  sublabel?: string;
  /** Control or value rendered at the trailing edge. */
  right?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

/** One line in a SettingsSection: label (+ optional sublabel) and a trailing slot. */
export function SettingsRow({ label, sublabel, right, onPress, disabled }: Props) {
  const body = (
    <View
      className="min-h-[44px] flex-row items-center justify-between px-3.5 py-2.5"
      style={disabled ? { opacity: 0.4 } : undefined}
    >
      <View className="flex-1 pr-3">
        <Text className="text-[15px] text-ink">{label}</Text>
        {sublabel ? (
          <Text className="mt-0.5 font-mono-rg text-[11px] leading-4 text-ink-faint">{sublabel}</Text>
        ) : null}
      </View>
      {right != null ? <View>{right}</View> : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
    >
      {body}
    </Pressable>
  );
}
