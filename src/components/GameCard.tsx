import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { Game } from '@/api/types';
import { useDensityTokens } from '@/settings';
import { StatusPill } from './StatusPill';
import { TeamRow } from './TeamRow';

export function GameCard({ game }: { game: Game }) {
  const d = useDensityTokens();
  const [away, home] = game.competitors;
  const isLive = game.state === 'in';
  const isFinal = game.state === 'post';
  const awayDim = isFinal && home.isWinner;
  const homeDim = isFinal && away.isWinner;

  return (
    <Link
      href={{ pathname: '/game/[league]/[id]', params: { league: game.league, id: game.id } }}
      asChild
    >
      <Pressable
        className={`mb-3 rounded-[10px] border bg-surface ${d.cardPad} ${
          isLive ? 'border-live' : 'border-line'
        }`}
        style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
      >
        <View className={`${d.stackGap} flex-row items-center justify-between`}>
          <StatusPill state={game.state} shortDetail={game.shortDetail} startDate={game.startDate} />
        </View>
        <TeamRow side={away} dim={awayDim} />
        <TeamRow side={home} dim={homeDim} />
      </Pressable>
    </Link>
  );
}
