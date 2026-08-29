import { Children, type ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  /** Uppercase group label above the card; omit for an untitled group. */
  title?: string;
  /** Small helper text under the card. */
  footnote?: string;
  children: ReactNode;
};

/**
 * Titled group of settings rows in a bordered card. Hairline dividers are
 * inserted automatically between children, so rows stay divider-agnostic.
 */
export function SettingsSection({ title, footnote, children }: Props) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <View className="mt-4">
      {title ? (
        <Text className="mb-1.5 ml-1 font-display-md text-[12px] uppercase tracking-wider text-ink-dim">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-[12px] border border-line bg-surface">
        {items.map((child, i) => (
          <View key={i} className={i < items.length - 1 ? 'border-b border-line' : undefined}>
            {child}
          </View>
        ))}
      </View>
      {footnote ? (
        <Text className="mt-1.5 ml-1 font-mono-rg text-[11px] leading-4 text-ink-faint">
          {footnote}
        </Text>
      ) : null}
    </View>
  );
}
