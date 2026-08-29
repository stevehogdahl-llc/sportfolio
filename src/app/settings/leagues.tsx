import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Switch, Text, View } from 'react-native';
import ReorderableList, { reorderItems, useReorderableDrag } from 'react-native-reorderable-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { League } from '@/api/types';
import { leagueLabel, usePalette } from '@/constants/theme';
import { useSettingsStore } from '@/settings';

const ALL_LEAGUES: League[] = ['mlb', 'nfl'];
const ROW = 'min-h-[52px] flex-row items-center justify-between bg-surface px-3.5 py-2.5';
const HANDLE_WIDTH = 22;

function LeagueSwitch({
  value,
  disabled,
  onValueChange,
}: {
  value: boolean;
  disabled?: boolean;
  onValueChange: () => void;
}) {
  const palette = usePalette();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: palette.line, true: palette.nfl }}
      ios_backgroundColor={palette.line}
    />
  );
}

/** An enabled league — long-press anywhere on the row to drag it into a new order. */
function EnabledRow({
  league,
  canDisable,
  onToggle,
}: {
  league: League;
  canDisable: boolean;
  onToggle: () => void;
}) {
  const palette = usePalette();
  const drag = useReorderableDrag();
  return (
    <Pressable onLongPress={drag} delayLongPress={200} className={ROW}>
      <View className="flex-1 flex-row items-center gap-3">
        <Ionicons name="reorder-three" size={HANDLE_WIDTH} color={palette.inkFaint} />
        <Text className="text-[15px] text-ink">{leagueLabel[league]}</Text>
      </View>
      <LeagueSwitch value disabled={!canDisable} onValueChange={onToggle} />
    </Pressable>
  );
}

function DisabledRow({ league, onToggle }: { league: League; onToggle: () => void }) {
  return (
    <View className={ROW}>
      <View className="flex-1 flex-row items-center gap-3">
        <View style={{ width: HANDLE_WIDTH }} />
        <Text className="text-[15px] text-ink-dim">{leagueLabel[league]}</Text>
      </View>
      <LeagueSwitch value={false} onValueChange={onToggle} />
    </View>
  );
}

export default function LeaguesScreen() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const leagues = useSettingsStore((s) => s.leagues);
  const setLeagues = useSettingsStore((s) => s.setLeagues);

  const disabled = ALL_LEAGUES.filter((l) => !leagues.includes(l));

  const toggle = (l: League) => {
    if (leagues.includes(l)) {
      if (leagues.length === 1) return; // always keep at least one league
      setLeagues(leagues.filter((x) => x !== l));
    } else {
      setLeagues([...leagues, l]);
    }
  };

  const separator = <View style={{ height: 1, backgroundColor: palette.line }} />;

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
    >
      <Text className="mb-1.5 ml-1 font-display-md text-[12px] uppercase tracking-wider text-ink-dim">
        Leagues
      </Text>
      <View className="overflow-hidden rounded-[12px] border border-line">
        <ReorderableList
          data={leagues}
          keyExtractor={(l) => l}
          scrollEnabled={false}
          onReorder={({ from, to }) => setLeagues(reorderItems(leagues, from, to))}
          ItemSeparatorComponent={() => separator}
          renderItem={({ item }) => (
            <EnabledRow
              league={item}
              canDisable={leagues.length > 1}
              onToggle={() => toggle(item)}
            />
          )}
          ListFooterComponent={
            disabled.length > 0 ? (
              <View>
                {disabled.map((l) => (
                  <View key={l}>
                    {separator}
                    <DisabledRow league={l} onToggle={() => toggle(l)} />
                  </View>
                ))}
              </View>
            ) : null
          }
        />
      </View>
      <Text className="mt-1.5 ml-1 font-mono-rg text-[11px] leading-4 text-ink-faint">
        Turn a league off to hide its tab. Drag to set the tab order.
      </Text>
    </View>
  );
}
