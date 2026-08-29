import { Redirect } from 'expo-router';

import { useEnabledLeagues, useSettingsStore, useTabs } from '@/settings';

/**
 * Landing route — redirects to the tab named by the "Open to" setting.
 * Settings are already hydrated by the time this renders (the root layout
 * gates on it), so the choice is synchronous.
 */
export default function Index() {
  const openTo = useSettingsStore((s) => s.openTo);
  const lastLeague = useSettingsStore((s) => s.lastLeague);
  const tabs = useTabs();
  const leagues = useEnabledLeagues();

  if (openTo === 'favorites' && tabs.includes('favorites')) {
    return <Redirect href="/favorites" />;
  }

  // 'last' and a disabled 'favorites' both fall back to the last league viewed.
  const wanted = openTo === 'last' || openTo === 'favorites' ? lastLeague : openTo;
  const target = leagues.includes(wanted) ? wanted : leagues[0];

  return <Redirect href={target === 'nfl' ? '/nfl' : '/mlb'} />;
}
