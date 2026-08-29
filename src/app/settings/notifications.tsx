import { useState } from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  SettingsRow,
  SettingsSection,
  SettingsSegmented,
  SettingsSwitch,
} from '@/components/settings';
import { presentNow, requestPermission } from '@/notifications';
import { type NotificationCategory, useNotificationSettings, useSettingsStore } from '@/settings';

const SCOPE_OPTIONS = [
  { value: 'favorites', label: 'Favorite teams' },
  { value: 'all', label: 'All games' },
] as const;

const CATEGORIES: { key: NotificationCategory; label: string; sublabel?: string }[] = [
  { key: 'gameStart', label: 'Game start' },
  { key: 'finalScore', label: 'Final score' },
  { key: 'scoringPlay', label: 'Scoring plays' },
  { key: 'leadChange', label: 'Lead changes' },
  { key: 'closeGame', label: 'Close game', sublabel: 'A tight game in the final stretch' },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const settings = useNotificationSettings();
  const setEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setScope = useSettingsStore((s) => s.setNotificationScope);
  const setCategory = useSettingsStore((s) => s.setNotificationCategory);

  const [denied, setDenied] = useState(false);

  const frame = (children: React.ReactNode) => (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
    >
      {children}
    </ScrollView>
  );

  if (Platform.OS === 'web') {
    return frame(
      <SettingsSection>
        <View className="px-3.5 py-4">
          <Text className="text-[14px] text-ink-dim">
            Notifications are available in the iOS and Android app.
          </Text>
        </View>
      </SettingsSection>,
    );
  }

  const onToggleMaster = async (value: boolean) => {
    if (!value) {
      setEnabled(false);
      return;
    }
    const granted = await requestPermission();
    setEnabled(granted);
    setDenied(!granted);
  };

  const off = !settings.enabled;

  return frame(
    <>
      <SettingsSection
        footnote={
          denied
            ? 'Notifications are blocked. Enable them for Sportfolio in system settings.'
            : undefined
        }
      >
        <SettingsSwitch
          label="Notifications"
          sublabel="Score alerts for games you follow"
          value={settings.enabled}
          onValueChange={(v) => void onToggleMaster(v)}
        />
        {denied ? (
          <SettingsRow label="Open system settings" onPress={() => void Linking.openSettings()} />
        ) : null}
      </SettingsSection>

      <SettingsSection title="Send alerts for">
        <SettingsSegmented
          label="Games"
          options={SCOPE_OPTIONS}
          value={settings.scope}
          onChange={setScope}
        />
      </SettingsSection>

      <SettingsSection
        title="Alerts"
        footnote="In-game alerts are delivered on a best effort while the app is closed and can be delayed by your device. Game-start alerts are scheduled ahead of time."
      >
        {CATEGORIES.map((c) => (
          <SettingsSwitch
            key={c.key}
            label={c.label}
            sublabel={c.sublabel}
            value={settings.categories[c.key]}
            onValueChange={(v) => setCategory(c.key, v)}
            disabled={off}
          />
        ))}
      </SettingsSection>

      <SettingsSection>
        <SettingsRow
          label="Send a test notification"
          disabled={off}
          onPress={
            off
              ? undefined
              : () =>
                  void presentNow({
                    id: `test:${Date.now()}`,
                    title: 'Sportfolio',
                    body: 'Notifications are working.',
                    data: { league: 'mlb', eventId: '' },
                  })
          }
        />
      </SettingsSection>
    </>,
  );
}
