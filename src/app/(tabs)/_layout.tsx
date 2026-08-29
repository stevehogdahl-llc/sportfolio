import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { tabLabel, usePalette } from '@/constants/theme';
import { ALL_TABS, type TabKey, useTabs } from '@/settings';

type TabMeta = {
  href: '/mlb' | '/nfl' | '/favorites';
  icon: keyof typeof Ionicons.glyphMap;
  color: 'mlb' | 'nfl';
};

const TAB_META: Record<TabKey, TabMeta> = {
  mlb: { href: '/mlb', icon: 'baseball', color: 'mlb' },
  nfl: { href: '/nfl', icon: 'american-football', color: 'nfl' },
  favorites: { href: '/favorites', icon: 'star', color: 'mlb' },
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
  const enabled = useTabs();

  // Enabled tabs first, in the user's order; disabled ones still render
  // (their route files must exist) but are hidden with `href: null`.
  const ordered: TabKey[] = [...enabled, ...ALL_TABS.filter((t) => !enabled.includes(t))];

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
      {ordered.map((tab) => {
        const meta = TAB_META[tab];
        return (
          <Tabs.Screen
            key={tab}
            name={tab}
            options={{
              title: tabLabel[tab],
              href: enabled.includes(tab) ? meta.href : null,
              tabBarIcon: sportIcon(meta.icon, palette[meta.color]),
            }}
          />
        );
      })}
    </Tabs>
  );
}
