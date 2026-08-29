import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { Game } from '@/api/types';
import { usePalette } from '@/constants/theme';
import { favoriteKey, useDensityTokens, useSettingsStore } from '@/settings';
import { StatusPill } from './StatusPill';
import { TeamRow } from './TeamRow';

export function GameCard({ game }: { game: Game }) {
  const d = useDensityTokens();
  const palette = usePalette();
  const isFavorite = useSettingsStore((s) =>
    game.competitors.some((c) => s.favorites.includes(favoriteKey(game.league, c.id))),
  );

  const [away, home] = game.competitors;
  const isLive = game.state === 'in';
  const isFinal = game.state === 'post';
  const awayDim = isFinal && home.isWinner;
  const homeDim = isFinal && away.isWinner;

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
      </Pressable>
    </Link>
  );
}
