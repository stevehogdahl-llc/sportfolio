import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabLabel } from '@/constants/theme';
import {
  SettingsLink,
  SettingsSection,
  SettingsSegmented,
  SettingsSwitch,
} from '@/components/settings';
import { useSettingsStore } from '@/settings';

const THEME_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

const DENSITY_OPTIONS = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
] as const;

export default function SettingsHub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const theme = useSettingsStore((s) => s.theme);
  const cardDensity = useSettingsStore((s) => s.cardDensity);
  const showRecords = useSettingsStore((s) => s.showRecords);
  const showOdds = useSettingsStore((s) => s.showOdds);
  const tabs = useSettingsStore((s) => s.tabs);
  const favoritesCount = useSettingsStore((s) => s.favorites.length);
  const notificationsOn = useSettingsStore((s) => s.notifications.enabled);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setCardDensity = useSettingsStore((s) => s.setCardDensity);
  const setShowRecords = useSettingsStore((s) => s.setShowRecords);
  const setShowOdds = useSettingsStore((s) => s.setShowOdds);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
    >
      <SettingsSection title="Scoreboard">
        <SettingsLink
          label="Favorites"
          value={favoritesCount > 0 ? String(favoritesCount) : 'None'}
          onPress={() => router.push('/settings/favorites')}
        />
        <SettingsLink
          label="Display"
          value={tabs.map((t) => tabLabel[t]).join(', ')}
          onPress={() => router.push('/settings/leagues')}
        />
        <SettingsSwitch
          label="Team records"
          sublabel="Show win–loss next to team names"
          value={showRecords}
          onValueChange={setShowRecords}
        />
        <SettingsSwitch
          label="Betting odds"
          sublabel="Show the spread and over/under on upcoming games"
          value={showOdds}
          onValueChange={setShowOdds}
        />
      </SettingsSection>

      <SettingsSection title="Appearance">
        <SettingsSegmented
          label="Card density"
          options={DENSITY_OPTIONS}
          value={cardDensity}
          onChange={setCardDensity}
        />
        <SettingsSegmented
          label="Theme"
          options={THEME_OPTIONS}
          value={theme}
          onChange={setTheme}
        />
      </SettingsSection>

      <SettingsSection title="Notifications">
        <SettingsLink
          label="Game alerts"
          value={notificationsOn ? 'On' : 'Off'}
          onPress={() => router.push('/settings/notifications')}
        />
      </SettingsSection>

      <SettingsSection>
        <SettingsLink label="About" onPress={() => router.push('/settings/about')} />
      </SettingsSection>
    </ScrollView>
  );
}
