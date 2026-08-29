import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { leagueLabel } from '@/constants/theme';
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

const OPEN_TO_OPTIONS = [
  { value: 'last', label: 'Last viewed' },
  { value: 'mlb', label: 'MLB' },
  { value: 'nfl', label: 'NFL' },
] as const;

export default function SettingsHub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const theme = useSettingsStore((s) => s.theme);
  const cardDensity = useSettingsStore((s) => s.cardDensity);
  const showRecords = useSettingsStore((s) => s.showRecords);
  const openTo = useSettingsStore((s) => s.openTo);
  const leagues = useSettingsStore((s) => s.leagues);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setCardDensity = useSettingsStore((s) => s.setCardDensity);
  const setShowRecords = useSettingsStore((s) => s.setShowRecords);
  const setOpenTo = useSettingsStore((s) => s.setOpenTo);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
    >
      <SettingsSection title="Appearance">
        <SettingsSwitch
          label="Team records"
          sublabel="Show win–loss next to team names"
          value={showRecords}
          onValueChange={setShowRecords}
        />
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

      <SettingsSection title="Scoreboard">
        <SettingsSegmented
          label="Open to"
          options={OPEN_TO_OPTIONS}
          value={openTo}
          onChange={setOpenTo}
        />
        <SettingsLink
          label="Leagues"
          value={leagues.map((l) => leagueLabel[l]).join(', ')}
          onPress={() => router.push('/settings/leagues')}
        />
      </SettingsSection>

      <SettingsSection>
        <SettingsLink label="About" onPress={() => router.push('/settings/about')} />
      </SettingsSection>
    </ScrollView>
  );
}
