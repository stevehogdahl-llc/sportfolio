import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { Game } from '@/api/types';
import { usePalette } from '@/constants/theme';
import { favoriteKey, useDensityTokens, useSettingsStore, useShowOdds } from '@/settings';
import { StatusPill } from './StatusPill';
import { TeamRow } from './TeamRow';

/** ESPN's featured line, condensed to one row: e.g. "CHI -1.5  ·  O/U 36.5". */
function oddsLine(odds: NonNullable<Game['odds']>): string {
  return [odds.details, odds.overUnder != null ? `O/U ${odds.overUnder}` : null]
    .filter(Boolean)
    .join('  ·  ');
}

export function GameCard({ game }: { game: Game }) {
  const d = useDensityTokens();
  const palette = usePalette();
  const showOdds = useShowOdds();
  const isFavorite = useSettingsStore((s) =>
    game.competitors.some((c) => s.favorites.includes(favoriteKey(game.league, c.id))),
  );

  const [away, home] = game.competitors;
  const isLive = game.state === 'in';
  const isFinal = game.state === 'post';
  const awayDim = isFinal && home.isWinner;
  const homeDim = isFinal && away.isWinner;

  // `game.odds` is only populated for pregame games by the normalizer.
  const odds = showOdds && game.odds ? oddsLine(game.odds) : null;

  const border = isFavorite ? 'border-nfl' : isLive ? 'border-live' : 'border-line';

  return (
    <Link
      href={{ pathname: '/game/[league]/[id]', params: { league: game.league, id: game.id } }}
      asChild
    >
      <Pressable
        className={`mb-3 rounded-[10px] border bg-surface ${d.cardPad} ${border}`}
        style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
      >
        <View className={`${d.stackGap} flex-row items-center justify-between`}>
          <StatusPill state={game.state} shortDetail={game.shortDetail} startDate={game.startDate} />
          {isFavorite ? <Ionicons name="star" size={13} color={palette.mlb} /> : null}
        </View>
        <TeamRow side={away} dim={awayDim} />
        <TeamRow side={home} dim={homeDim} />
        {odds ? (
          <View className="mt-2 border-t border-line pt-2">
            <Text className="font-mono-rg text-[11px] text-ink-faint">{odds}</Text>
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}
