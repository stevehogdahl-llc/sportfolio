import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

import type { League, PlayerBrief, Situation } from '@/api/types';

type Props = {
  league: League;
  situation: Situation;
  /** combined run total (both teams) — lets the diamond animate a run scoring */
  runTotal?: number;
};

/**
 * Live game-state strip: a bases/count diamond for MLB, a down-&-distance chip
 * for NFL. Rendered on the game-detail screen only while `state === 'in'`.
 */
export function SituationStrip({ league, situation, runTotal }: Props) {
  const body =
    league === 'nfl' ? (
      <FootballSituation s={situation} />
    ) : (
      <BaseballSituation s={situation} runTotal={runTotal} />
    );
  if (!body) return null;

  return (
    <View className="mt-4 rounded-[12px] border border-line bg-surface p-3">
      {body}
      {situation.lastPlay ? (
        <Text numberOfLines={2} className="mt-3 font-mono-rg text-[11px] leading-4 text-ink-faint">
          {situation.lastPlay}
        </Text>
      ) : null}
    </View>
  );
}

// --- MLB -------------------------------------------------------------------

function BaseballSituation({ s, runTotal }: { s: Situation; runTotal?: number }) {
  const hasCount = s.balls != null || s.strikes != null || s.outs != null;
  const hasRunners = s.onFirst || s.onSecond || s.onThird;
  if (!hasCount && !hasRunners && !s.batter && !s.pitcher) return null;

  return (
    <View>
      <Diamond
        onFirst={s.onFirst}
        onSecond={s.onSecond}
        onThird={s.onThird}
        runTotal={runTotal ?? 0}
      />

      <View className="mt-2 flex-row justify-around border-t border-line pt-3">
        {COUNT_COLUMNS.map((col) => (
          <CountColumn key={col.key} col={col} value={s[col.key] ?? 0} />
        ))}
      </View>

      {s.batter || s.pitcher ? (
        <View className="mt-3 rounded-[10px] border border-line">
          {s.batter ? <PlayerRow role="At bat" player={s.batter} /> : null}
          {s.batter && s.pitcher ? <View className="mx-3 border-t border-line" /> : null}
          {s.pitcher ? <PlayerRow role="Pitching" player={s.pitcher} /> : null}
        </View>
      ) : null}
    </View>
  );
}

function PlayerRow({ role, player }: { role: string; player: PlayerBrief }) {
  const meta = [player.position, player.jersey ? `#${player.jersey}` : null]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <View className="flex-row items-center gap-3 p-3">
      <View className="h-11 w-11 overflow-hidden rounded-full bg-surface-2">
        {player.headshot ? (
          <Image source={{ uri: player.headshot }} style={{ flex: 1 }} contentFit="cover" transition={120} />
        ) : null}
      </View>

      <View className="flex-1">
        <Text className="font-mono-rg text-[9px] uppercase tracking-wider text-ink-faint">{role}</Text>
        <Text numberOfLines={1} className="text-[15px] font-semibold text-ink">
          {player.name}
        </Text>
        {meta ? <Text className="mt-0.5 font-mono-rg text-[11px] text-ink-dim">{meta}</Text> : null}
        {player.line ? (
          <Text numberOfLines={1} className="mt-0.5 font-mono-rg text-[11px] text-ink-dim">
            {player.line}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// Infield geometry, in the (pre-rotation) local space of the SxS square.
const S = 92;
const BASE = 20;
const RUNNER = 13;

type BaseKey = 'first' | 'second' | 'third' | 'home';
type Pt = { x: number; y: number };

/** Base centers on the square's corners; after a 45° rotate they point N/E/S/W. */
const CENTER: Record<BaseKey, Pt> = {
  second: { x: 0, y: 0 },
  first: { x: S, y: 0 },
  third: { x: 0, y: S },
  home: { x: S, y: S },
};

type Advance = { id: number; from: BaseKey; to: BaseKey; exit?: boolean };

/** Top-down infield: a square rotated 45° with a base marker on each corner. */
function Diamond({
  onFirst,
  onSecond,
  onThird,
  runTotal,
}: {
  onFirst: boolean;
  onSecond: boolean;
  onThird: boolean;
  runTotal: number;
}) {
  const prev = useRef({ first: onFirst, second: onSecond, third: onThird });
  const prevRuns = useRef(runTotal);
  const [runners, setRunners] = useState<Advance[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const p = prev.current;
    const next: Advance[] = [];
    const mk = (from: BaseKey, to: BaseKey, exit?: boolean) => {
      next.push({ id: idRef.current++, from, to, exit });
    };

    // A runner into any base that just became occupied.
    if (!p.first && onFirst) mk('home', 'first');
    if (!p.second && onSecond) mk('first', 'second');
    if (!p.third && onThird) mk('second', 'third');

    // Run(s) scoring: for each run added, send home a runner off a base that
    // just emptied (closest to the plate first). Bases that emptied without a
    // run are outs — left alone.
    const scored = Math.max(0, runTotal - prevRuns.current);
    if (scored > 0) {
      const vacated: BaseKey[] = [];
      if (p.third && !onThird) vacated.push('third');
      if (p.second && !onSecond) vacated.push('second');
      if (p.first && !onFirst) vacated.push('first');
      for (const b of vacated.slice(0, scored)) mk(b, 'home', true);
    }

    prev.current = { first: onFirst, second: onSecond, third: onThird };
    prevRuns.current = runTotal;
    if (next.length) setRunners((r) => [...r, ...next]);
  }, [onFirst, onSecond, onThird, runTotal]);

  const clear = useCallback(
    (id: number) => setRunners((r) => r.filter((x) => x.id !== id)),
    [],
  );

  return (
    <View className="h-[150px] w-full items-center justify-center">
      <View
        className="rotate-45 rounded-[12px] border border-line bg-surface-2"
        style={{ width: S, height: S }}
      >
        <Dot center={{ x: S / 2, y: S / 2 }} size={16} className="border border-line bg-surface" />
        <Base center={CENTER.second} on={onSecond} />
        <Base center={CENTER.first} on={onFirst} />
        <Base center={CENTER.third} on={onThird} />
        <Base center={CENTER.home} home />
        {runners.map((a) => (
          <Runner
            key={a.id}
            from={CENTER[a.from]}
            to={CENTER[a.to]}
            exit={a.exit}
            onDone={() => clear(a.id)}
          />
        ))}
      </View>
    </View>
  );
}

function Dot({
  center,
  size,
  className,
}: {
  center: Pt;
  size: number;
  className: string;
}) {
  return (
    <View
      style={{ position: 'absolute', left: center.x - size / 2, top: center.y - size / 2, width: size, height: size }}
      className={`rounded-full ${className}`}
    />
  );
}

function Base({ center, on, home }: { center: Pt; on?: boolean; home?: boolean }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: center.x - BASE / 2,
        top: center.y - BASE / 2,
        width: BASE,
        height: BASE,
      }}
      className={
        home
          ? 'rounded-[3px] border-2 border-ink-dim bg-surface'
          : on
            ? 'rounded-[3px] border border-mlb bg-mlb'
            : 'rounded-[3px] border border-ink-faint bg-surface'
      }
    />
  );
}

/**
 * A runner marker tweening from one base to the next, then removed. `exit` runs
 * (a runner scoring) fade out as they reach the plate.
 */
function Runner({
  from,
  to,
  exit,
  onDone,
}: {
  from: Pt;
  to: Pt;
  exit?: boolean;
  onDone: () => void;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: 1,
      duration: exit ? 720 : 620,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => anim.stop();
  }, [t, exit, onDone]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: from.x - RUNNER / 2,
        top: from.y - RUNNER / 2,
        width: RUNNER,
        height: RUNNER,
        opacity: exit ? t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }) : 1,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, to.x - from.x] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, to.y - from.y] }) },
        ],
      }}
      className="rounded-full bg-mlb"
    />
  );
}

type CountKey = 'balls' | 'strikes' | 'outs';
type CountCol = {
  key: CountKey;
  label: string;
  /** filled-pip color — static class so NativeWind can see it */
  on: string;
};

const COUNT_COLUMNS: CountCol[] = [
  { key: 'balls', label: 'Balls', on: 'bg-[#1a9d54] dark:bg-[#43d17f]' },
  { key: 'strikes', label: 'Strikes', on: 'bg-mlb' },
  { key: 'outs', label: 'Outs', on: 'bg-live' },
];

const PIPS = [0, 1, 2];

function CountColumn({ col, value }: { col: CountCol; value: number }) {
  return (
    <View className="items-center gap-2">
      <Text className="font-mono-rg text-[10px] uppercase tracking-wider text-ink-faint">
        {col.label}
      </Text>
      <View className="flex-row items-center gap-2">
        {PIPS.map((i) => (
          <View
            key={i}
            className={`h-3.5 w-3.5 rounded-full ${i < value ? col.on : 'border border-ink-faint'}`}
          />
        ))}
      </View>
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
