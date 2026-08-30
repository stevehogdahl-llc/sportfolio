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
  const body =
    league === 'nfl' ? <FootballSituation s={situation} /> : <BaseballSituation s={situation} />;
  if (!body) return null;

  return (
    <View className="mt-4 rounded-[12px] border border-line bg-surface p-3">
      <Text className="mb-2 font-display-md text-[12px] uppercase tracking-wider text-live">Live</Text>
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
      <Diamond onFirst={s.onFirst} onSecond={s.onSecond} onThird={s.onThird} />

      {s.batter || s.pitcher ? (
        <View className="mt-1 gap-0.5">
          {s.batter ? <MatchupLine label="AB" name={s.batter} /> : null}
          {s.pitcher ? <MatchupLine label="P" name={s.pitcher} /> : null}
        </View>
      ) : null}

      <View className="mt-3 flex-row justify-around border-t border-line pt-3">
        {COUNT_COLUMNS.map((col) => (
          <CountColumn key={col.letter} col={col} value={s[col.key] ?? 0} />
        ))}
      </View>
    </View>
  );
}

function MatchupLine({ label, name }: { label: string; name: string }) {
  return (
    <View className="flex-row items-baseline gap-2">
      <Text className="w-6 font-mono-rg text-[10px] uppercase text-ink-faint">{label}</Text>
      <Text numberOfLines={1} className="flex-1 text-[13px] font-semibold text-ink">
        {name}
      </Text>
    </View>
  );
}

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
  const baseCls = (occupied: boolean) =>
    `absolute h-[18px] w-[18px] rounded-[3px] border ${
      occupied ? 'border-mlb bg-mlb' : 'border-ink-faint bg-surface'
    }`;

  return (
    <View className="h-[116px] items-center justify-center overflow-hidden">
      <View style={{ transform: [{ perspective: 720 }, { rotateX: '54deg' }] }}>
        <View className="h-[96px] w-[96px] items-center justify-center">
          {/* infield: a square rotated 45° so its corners point N/E/S/W */}
          <View className="h-[82px] w-[82px] rotate-45 rounded-[10px] border border-line bg-surface-2">
            {/* pitcher's mound */}
            <View className="absolute left-1/2 top-1/2 -ml-[7px] -mt-[7px] h-[14px] w-[14px] rounded-full border border-line bg-surface" />
            {/* bases sit on the infield's rotated corners: N=2B, E=1B, S=home, W=3B */}
            <View className={`${baseCls(onSecond)} -left-[9px] -top-[9px]`} />
            <View className={`${baseCls(onFirst)} -right-[9px] -top-[9px]`} />
            <View className={`${baseCls(onThird)} -bottom-[9px] -left-[9px]`} />
            <View className="absolute -bottom-[9px] -right-[9px] h-[18px] w-[18px] rounded-[3px] border-2 border-ink-dim bg-surface" />
          </View>
        </View>
      </View>
    </View>
  );
}

type CountKey = 'balls' | 'strikes' | 'outs';
type CountCol = {
  key: CountKey;
  label: string;
  letter: string;
  /** filled-pip and mark colors — static classes so NativeWind can see them */
  on: string;
  mark: string;
};

const COUNT_COLUMNS: CountCol[] = [
  {
    key: 'balls',
    label: 'Balls',
    letter: 'B',
    on: 'bg-[#1a9d54] dark:bg-[#43d17f]',
    mark: 'border-[#1a9d54] text-[#1a9d54] dark:border-[#43d17f] dark:text-[#43d17f]',
  },
  { key: 'strikes', label: 'Strikes', letter: 'S', on: 'bg-mlb', mark: 'border-mlb text-mlb' },
  { key: 'outs', label: 'Outs', letter: 'O', on: 'bg-live', mark: 'border-live text-live' },
];

const PIPS = [0, 1, 2];

function CountColumn({ col, value }: { col: CountCol; value: number }) {
  return (
    <View className="items-center gap-1.5">
      <Text className="font-mono-rg text-[10px] uppercase tracking-wider text-ink-faint">
        {col.label}
      </Text>
      <View className="flex-row items-center gap-1.5">
        <View
          className={`h-4 w-4 items-center justify-center rounded-full border ${col.mark}`}
        >
          <Text className={`font-mono-md text-[9px] ${col.mark}`}>{col.letter}</Text>
        </View>
        {PIPS.map((i) => (
          <View
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < value ? col.on : 'border border-ink-faint'
            }`}
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
