import { Redirect } from 'expo-router';

import { useSettingsStore } from '@/settings';

/**
 * Landing route — redirects to a league scoreboard based on the "Open to"
 * setting. Settings are already hydrated by the time this renders (the root
 * layout gates on it), so the choice is synchronous.
 */
export default function Index() {
  const openTo = useSettingsStore((s) => s.openTo);
  const leagues = useSettingsStore((s) => s.leagues);
  const lastLeague = useSettingsStore((s) => s.lastLeague);

  const wanted = openTo === 'last' ? lastLeague : openTo;
  const target = leagues.includes(wanted) ? wanted : leagues[0];

  return <Redirect href={target === 'nfl' ? '/nfl' : '/mlb'} />;
}
