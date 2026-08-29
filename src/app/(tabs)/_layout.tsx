import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import type { League } from '@/api/types';
import { leagueLabel, usePalette } from '@/constants/theme';
import { useEnabledLeagues } from '@/settings';

const ALL_LEAGUES: League[] = ['mlb', 'nfl'];

const LEAGUE_META: Record<League, { href: `/${League}`; icon: keyof typeof Ionicons.glyphMap }> = {
  mlb: { href: '/mlb', icon: 'baseball' },
  nfl: { href: '/nfl', icon: 'american-football' },
};

function sportIcon(name: keyof typeof Ionicons.glyphMap, color: string) {
  function Icon({ focused }: { focused: boolean }) {
    return (
      <Ionicons
        name={name}
        size={focused ? 26 : 22}
        color={color}
        style={{ opacity: focused ? 1 : 0.45 }}
      />
    );
  }
  return Icon;
}

export default function TabsLayout() {
  const palette = usePalette();
  const enabled = useEnabledLeagues();

  // Enabled leagues first, in the user's order; disabled ones still render
  // (their route files must exist) but are hidden with `href: null`.
  const ordered: League[] = [...enabled, ...ALL_LEAGUES.filter((l) => !enabled.includes(l))];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.line },
        tabBarActiveTintColor: palette.ink,
        tabBarInactiveTintColor: palette.inkFaint,
        tabBarLabelPosition: 'beside-icon',
        tabBarLabelStyle: { fontFamily: 'Oswald_500Medium', fontSize: 15 },
      }}
    >
      {ordered.map((league) => (
        <Tabs.Screen
          key={league}
          name={league}
          options={{
            title: leagueLabel[league],
            href: enabled.includes(league) ? LEAGUE_META[league].href : null,
            tabBarIcon: sportIcon(LEAGUE_META[league].icon, palette[league]),
          }}
        />
      ))}
    </Tabs>
  );
}
