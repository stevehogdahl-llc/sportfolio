import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { usePalette } from '@/constants/theme';
import { SettingsRow } from './SettingsRow';

type Props = {
  label: string;
  sublabel?: string;
  /** Muted text shown before the chevron, e.g. the current value. */
  value?: string;
  onPress: () => void;
  disabled?: boolean;
};

export function SettingsLink({ label, sublabel, value, onPress, disabled }: Props) {
  const palette = usePalette();
  return (
    <SettingsRow
      label={label}
      sublabel={sublabel}
      onPress={onPress}
      disabled={disabled}
      right={
        <View className="flex-row items-center gap-1">
          {value ? (
            <Text numberOfLines={1} className="max-w-[150px] font-mono-md text-[12px] text-ink-dim">
              {value}
            </Text>
          ) : null}
          <Ionicons name="chevron-forward" size={16} color={palette.inkFaint} />
        </View>
      }
    />
  );
}
