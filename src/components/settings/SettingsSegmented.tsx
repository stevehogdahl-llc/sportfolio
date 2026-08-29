import { Pressable, Text, View } from 'react-native';

export type SegmentedOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Labelled segmented control — a full-width row of options, one selected. */
export function SettingsSegmented<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <View className="px-3.5 py-3">
      <Text className="mb-2 text-[15px] text-ink">{label}</Text>
      <View className="flex-row gap-1 rounded-lg border border-line bg-background p-1">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              className={
                selected
                  ? 'flex-1 items-center rounded-md bg-nfl py-1.5'
                  : 'flex-1 items-center rounded-md py-1.5'
              }
              style={({ pressed }) => (pressed && !selected ? { opacity: 0.6 } : null)}
            >
              <Text
                className={
                  selected
                    ? 'font-mono-md text-[12px] uppercase tracking-wide text-white'
                    : 'font-mono-md text-[12px] uppercase tracking-wide text-ink-faint'
                }
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
