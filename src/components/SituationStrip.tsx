import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

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
  const body =
    league === 'nfl' ? <FootballSituation s={situation} /> : <BaseballSituation s={situation} />;
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

function BaseballSituation({ s }: { s: Situation }) {
  const hasCount = s.balls != null || s.strikes != null || s.outs != null;
  const hasRunners = s.onFirst || s.onSecond || s.onThird;
  if (!hasCount && !hasRunners && !s.batter && !s.pitcher) return null;

  return (
    <View>
      <View className="items-center">
        <View className="h-[140px] w-[160px] items-center justify-center">
          {s.pitcher ? (
            <View className="absolute top-0 items-center">
              <RoleChip label="P" />
              <Text numberOfLines={1} className="mt-0.5 max-w-[150px] text-[12px] font-semibold text-ink">
                {s.pitcher}
              </Text>
            </View>
          ) : null}

          <Diamond onFirst={s.onFirst} onSecond={s.onSecond} onThird={s.onThird} />

          {s.batter ? (
            <View className="absolute bottom-0 items-center">
              <RoleChip label="AB" />
              <Text numberOfLines={1} className="mt-0.5 max-w-[150px] text-[12px] font-semibold text-ink">
                {s.batter}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="mt-2 flex-row justify-around border-t border-line pt-3">
        {COUNT_COLUMNS.map((col) => (
          <CountColumn key={col.key} col={col} value={s[col.key] ?? 0} />
        ))}
      </View>
    </View>
  );
}

/** Small label chip (`P` / `AB`) that sits above a player name on the figure. */
function RoleChip({ label }: { label: string }) {
  return (
    <View className="rounded-[4px] bg-surface-2 px-1.5 py-px">
      <Text className="font-mono-md text-[9px] uppercase tracking-wider text-ink-dim">{label}</Text>
    </View>
  );
}

// Infield geometry, in the (pre-rotation) local space of the 82px square.
const S = 82;
const BASE = 18;
const RUNNER = 12;

type BaseKey = 'first' | 'second' | 'third' | 'home';
type Pt = { x: number; y: number };

/** Base centers on the square's corners; after a 45° rotate they point N/E/S/W. */
const CENTER: Record<BaseKey, Pt> = {
  second: { x: 0, y: 0 },
  first: { x: S, y: 0 },
  third: { x: 0, y: S },
  home: { x: S, y: S },
};

type Advance = { id: number; from: BaseKey; to: BaseKey };

/** Faux-3D infield: a square tilted back in perspective and rotated to a diamond. */
function Diamond({
  onFirst,
  onSecond,
  onThird,
}: {
  onFirst: boolean;
  onSecond: boolean;
  onThird: boolean;
}) {
  const prev = useRef({ first: onFirst, second: onSecond, third: onThird });
  const [runners, setRunners] = useState<Advance[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const p = prev.current;
    const next: Advance[] = [];
    // Animate a runner into any base that just became occupied.
    if (!p.first && onFirst) next.push({ id: idRef.current++, from: 'home', to: 'first' });
    if (!p.second && onSecond) next.push({ id: idRef.current++, from: 'first', to: 'second' });
    if (!p.third && onThird) next.push({ id: idRef.current++, from: 'second', to: 'third' });
    prev.current = { first: onFirst, second: onSecond, third: onThird };
    if (next.length) setRunners((r) => [...r, ...next]);
  }, [onFirst, onSecond, onThird]);

  const clear = useCallback(
    (id: number) => setRunners((r) => r.filter((x) => x.id !== id)),
    [],
  );

  return (
    <View className="h-[116px] w-[124px] items-center justify-center overflow-hidden">
      <View style={{ transform: [{ perspective: 720 }, { rotateX: '54deg' }] }}>
        <View className="h-[96px] w-[96px] items-center justify-center">
          <View className="h-[82px] w-[82px] rotate-45 rounded-[10px] border border-line bg-surface-2">
            <Dot center={{ x: S / 2, y: S / 2 }} size={14} className="border border-line bg-surface" />
            <Base center={CENTER.second} on={onSecond} />
            <Base center={CENTER.first} on={onFirst} />
            <Base center={CENTER.third} on={onThird} />
            <Base center={CENTER.home} home />
            {runners.map((a) => (
              <Runner key={a.id} from={CENTER[a.from]} to={CENTER[a.to]} onDone={() => clear(a.id)} />
            ))}
          </View>
        </View>
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

/** A runner marker tweening from one base to the next, then removed. */
function Runner({ from, to, onDone }: { from: Pt; to: Pt; onDone: () => void }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: 1,
      duration: 620,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => anim.stop();
  }, [t, onDone]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: from.x - RUNNER / 2,
        top: from.y - RUNNER / 2,
        width: RUNNER,
        height: RUNNER,
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
