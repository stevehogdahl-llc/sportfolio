import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { League, TeamRef } from '@/api/types';
import { SettingsSection } from '@/components/settings';
import { leagueLabel, usePalette } from '@/constants/theme';
import { getLeagueTeams } from '@/data/teams';
import { favoriteKey, useEnabledLeagues, useSettingsStore } from '@/settings';

function TeamRow({
  team,
  favorited,
  onToggle,
}: {
  team: TeamRef;
  favorited: boolean;
  onToggle: () => void;
}) {
  const palette = usePalette();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ selected: favorited }}
      accessibilityLabel={`${favorited ? 'Unfavorite' : 'Favorite'} ${team.fullName}`}
      className="min-h-[44px] flex-row items-center gap-3 px-3.5 py-2"
      style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
    >
      {team.logo ? (
        <Image
          source={{ uri: team.logo }}
          style={{ width: 22, height: 22 }}
          contentFit="contain"
          transition={120}
        />
      ) : (
        <View style={{ width: 22, height: 22 }} />
      )}
      <Text className="flex-1 text-[15px] text-ink" numberOfLines={1}>
        {team.name}
      </Text>
      <Ionicons
        name={favorited ? 'star' : 'star-outline'}
        size={20}
        color={favorited ? palette.mlb : palette.inkFaint}
      />
    </Pressable>
  );
}

function LeagueFavorites({
  league,
  expanded,
  onToggleExpanded,
}: {
  league: League;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const palette = usePalette();
  const favorites = useSettingsStore((s) => s.favorites);
  const toggleFavorite = useSettingsStore((s) => s.toggleFavorite);

  const favSet = useMemo(() => new Set(favorites), [favorites]);
  const favCount = useMemo(
    () => getLeagueTeams(league).filter((t) => favSet.has(favoriteKey(league, t.id))).length,
    [favSet, league],
  );

  // Snapshot of what was favorited when the screen opened. Row order is frozen
  // against this for the whole visit: reordering the instant a star is tapped
  // makes the row look like it vanishes. It settles next time the screen opens.
  const [openingFavSet] = useState(() => new Set(favorites));

  // Favorited teams first, otherwise the bundled list's alphabetical order.
  const ordered = useMemo(() => {
    const teams = getLeagueTeams(league);
    const isFav = (t: TeamRef) => openingFavSet.has(favoriteKey(league, t.id));
    return [...teams.filter(isFav), ...teams.filter((t) => !isFav(t))];
  }, [openingFavSet, league]);

  return (
    <View className="mt-4">
      <Pressable
        onPress={onToggleExpanded}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="mb-1.5 ml-1 flex-row items-center gap-1.5"
        style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
      >
        <Ionicons
          name={expanded ? 'chevron-down' : 'chevron-forward'}
          size={13}
          color={palette.inkDim}
        />
        <Text className="font-display-md text-[12px] uppercase tracking-wider text-ink-dim">
          {leagueLabel[league]}
        </Text>
        {favCount > 0 ? (
          <Text className="font-mono-rg text-[11px] text-ink-faint">{favCount}</Text>
        ) : null}
      </Pressable>
      {expanded ? (
        <SettingsSection>
          {ordered.map((team) => (
            <TeamRow
              key={team.id}
              team={team}
              favorited={favSet.has(favoriteKey(league, team.id))}
              onToggle={() => toggleFavorite(favoriteKey(league, team.id))}
            />
          ))}
        </SettingsSection>
      ) : null}
    </View>
  );
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const enabled = useEnabledLeagues();
  const [openLeague, setOpenLeague] = useState<League | null>(enabled[0] ?? null);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
    >
      {enabled.map((league) => (
        <LeagueFavorites
          key={league}
          league={league}
          expanded={openLeague === league}
          onToggleExpanded={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOpenLeague((cur) => (cur === league ? null : league));
          }}
        />
      ))}
      <Text className="mt-3 ml-1 font-mono-rg text-[11px] leading-4 text-ink-faint">
        Favorite teams float to the top of the scoreboard and power the &quot;My Teams&quot; filter.
      </Text>
    </ScrollView>
  );
}
