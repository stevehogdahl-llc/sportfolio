import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Switch, Text, View } from 'react-native';
import ReorderableList, { reorderItems, useReorderableDrag } from 'react-native-reorderable-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabLabel, usePalette } from '@/constants/theme';
import { ALL_TABS, isLeagueTab, type TabKey, useSettingsStore } from '@/settings';

const ROW = 'min-h-[52px] flex-row items-center justify-between bg-surface px-3.5 py-2.5';
const HANDLE_WIDTH = 22;

function TabSwitch({
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

/** An enabled tab — long-press anywhere on the row to drag it into a new order. */
function EnabledRow({
  tab,
  canDisable,
  onToggle,
}: {
  tab: TabKey;
  canDisable: boolean;
  onToggle: () => void;
}) {
  const palette = usePalette();
  const drag = useReorderableDrag();
  return (
    <Pressable onLongPress={drag} delayLongPress={200} className={ROW}>
      <View className="flex-1 flex-row items-center gap-3">
        <Ionicons name="reorder-three" size={HANDLE_WIDTH} color={palette.inkFaint} />
        <Text className="text-[15px] text-ink">{tabLabel[tab]}</Text>
      </View>
      <TabSwitch value disabled={!canDisable} onValueChange={onToggle} />
    </Pressable>
  );
}

function DisabledRow({ tab, onToggle }: { tab: TabKey; onToggle: () => void }) {
  return (
    <View className={ROW}>
      <View className="flex-1 flex-row items-center gap-3">
        <View style={{ width: HANDLE_WIDTH }} />
        <Text className="text-[15px] text-ink-dim">{tabLabel[tab]}</Text>
      </View>
      <TabSwitch value={false} onValueChange={onToggle} />
    </View>
  );
}

export default function TabsScreen() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const tabs = useSettingsStore((s) => s.tabs);
  const setTabs = useSettingsStore((s) => s.setTabs);

  const disabled = ALL_TABS.filter((t) => !tabs.includes(t));
  const leagueCount = tabs.filter(isLeagueTab).length;

  const toggle = (t: TabKey) => {
    if (tabs.includes(t)) {
      // Never remove the last league — the app needs a scoreboard.
      if (isLeagueTab(t) && leagueCount === 1) return;
      setTabs(tabs.filter((x) => x !== t));
    } else {
      setTabs([...tabs, t]);
    }
  };

  const canDisable = (t: TabKey) => !(isLeagueTab(t) && leagueCount === 1);

  const separator = <View style={{ height: 1, backgroundColor: palette.line }} />;

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
    >
      <Text className="mb-1.5 ml-1 font-display-md text-[12px] uppercase tracking-wider text-ink-dim">
        Tabs
      </Text>
      <View className="overflow-hidden rounded-[12px] border border-line">
        <ReorderableList
          data={tabs}
          keyExtractor={(t) => t}
          scrollEnabled={false}
          onReorder={({ from, to }) => setTabs(reorderItems(tabs, from, to))}
          ItemSeparatorComponent={() => separator}
          renderItem={({ item }) => (
            <EnabledRow tab={item} canDisable={canDisable(item)} onToggle={() => toggle(item)} />
          )}
          ListFooterComponent={
            disabled.length > 0 ? (
              <View>
                {disabled.map((t) => (
                  <View key={t}>
                    {separator}
                    <DisabledRow tab={t} onToggle={() => toggle(t)} />
                  </View>
                ))}
              </View>
            ) : null
          }
        />
      </View>
      <Text className="mt-1.5 ml-1 font-mono-rg text-[11px] leading-4 text-ink-faint">
        Turn a tab off to hide it. Drag to set the order.
      </Text>
    </View>
  );
}
