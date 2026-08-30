import { Text, View } from 'react-native';

import type { League, Situation } from '@/api/types';

type Props = {
  league: League;
  situation: Situation;
};

/**
 * Live game-state strip: a bases/count diamond for MLB, a down-&-distance chip
 * for NFL. Rendered on the game-detail screen only while `state === 'in'`.
 */
export function SituationStrip({ league, situation }: Props) {
  const body = league === 'nfl' ? <FootballSituation s={situation} /> : <BaseballSituation s={situation} />;
  if (!body) return null;

  return (
    <View className="mt-4 rounded-[12px] border border-line bg-surface p-3">
      <Text className="mb-2 font-display-md text-[12px] uppercase tracking-wider text-live">
        Live
      </Text>
      {body}
      {situation.lastPlay ? (
        <Text numberOfLines={2} className="mt-2 font-mono-rg text-[11px] leading-4 text-ink-faint">
          {situation.lastPlay}
        </Text>
      ) : null}
    </View>
  );
}

// --- MLB -------------------------------------------------------------------

function BaseballSituation({ s }: { s: Situation }) {
  const hasCount = s.balls != null || s.strikes != null || s.outs != null;
  if (!hasCount && !s.onFirst && !s.onSecond && !s.onThird) return null;

  const outs = s.outs ?? 0;

  return (
    <View className="flex-row items-center gap-4">
      <Diamond onFirst={s.onFirst} onSecond={s.onSecond} onThird={s.onThird} />

      <View className="gap-1">
        <Text className="font-mono-md text-[13px] text-ink">
          {s.balls ?? 0}
          <Text className="text-ink-faint"> B</Text>
          {'   '}
          {s.strikes ?? 0}
          <Text className="text-ink-faint"> S</Text>
        </Text>
        <View className="flex-row items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              className={
                i < outs
                  ? 'h-2 w-2 rounded-full bg-ink'
                  : 'h-2 w-2 rounded-full border border-ink-faint'
              }
            />
          ))}
          <Text className="ml-1 font-mono-rg text-[11px] uppercase text-ink-faint">
            {outs === 1 ? '1 out' : `${outs} outs`}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Diamond({
  onFirst,
  onSecond,
  onThird,
}: {
  onFirst: boolean;
  onSecond: boolean;
  onThird: boolean;
}) {
  const base = (occupied: boolean) =>
    occupied
      ? 'absolute h-3.5 w-3.5 rotate-45 bg-mlb'
      : 'absolute h-3.5 w-3.5 rotate-45 border border-ink-faint';

  return (
    <View className="h-9 w-11">
      {/* 2nd (top), 3rd (left), 1st (right) */}
      <View className={`${base(onSecond)} left-[14px] top-0`} />
      <View className={`${base(onThird)} left-0 top-[11px]`} />
      <View className={`${base(onFirst)} right-0 top-[11px]`} />
    </View>
  );
}

// --- NFL -------------------------------------------------------------------

function FootballSituation({ s }: { s: Situation }) {
  if (!s.downDistance && !s.possessionAbbrev) return null;

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
        {s.downDistance ? (
          <Text className="font-display-md text-[16px] text-ink">{s.downDistance}</Text>
        ) : null}
        {s.possessionAbbrev ? (
          <Text className="font-mono-md text-[12px] uppercase text-ink-dim">
            · {s.possessionAbbrev} ball
          </Text>
        ) : null}
        {s.ballSpot ? (
          <Text className="font-mono-rg text-[11px] text-ink-faint">at {s.ballSpot}</Text>
        ) : null}
        {s.isRedZone ? (
          <View className="rounded-full bg-live px-2 py-0.5">
            <Text className="font-mono-md text-[10px] uppercase tracking-wider text-white">
              Red zone
            </Text>
          </View>
        ) : null}
      </View>

      {s.homeTimeouts != null || s.awayTimeouts != null ? (
        <Text className="font-mono-rg text-[11px] uppercase text-ink-faint">
          Timeouts {s.awayTimeouts ?? '–'} · {s.homeTimeouts ?? '–'}
        </Text>
      ) : null}
    </View>
  );
}
