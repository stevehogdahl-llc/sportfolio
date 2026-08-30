import Ionicons from '@expo/vector-icons/Ionicons';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabBarProps,
  type MaterialTopTabNavigationEventMap,
  type MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabLabel, usePalette } from '@/constants/theme';
import { type TabKey, useTabs } from '@/settings';

type TabMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  color: 'mlb' | 'nfl';
};

const TAB_META: Record<TabKey, TabMeta> = {
  mlb: { icon: 'baseball', color: 'mlb' },
  nfl: { icon: 'american-football', color: 'nfl' },
  favorites: { icon: 'star', color: 'mlb' },
};

const { Navigator } = createMaterialTopTabNavigator();

// Material top tabs ride on react-native-pager-view, so the scenes swipe
// horizontally. We park the tab bar at the bottom and paint it ourselves to
// keep the exact look of the old bottom tabs. `useOnlyUserDefinedScreens`
// (third arg) means only the <Tabs.Screen> we list below are mounted — disabled
// tabs simply aren't in the pager.
const Tabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator, undefined, true);

function TabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: palette.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: palette.line,
        paddingBottom: insets.bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const meta = TAB_META[route.name as TabKey];
        const label = options.title ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={{
              flex: 1,
              height: 49,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons
              name={meta.icon}
              size={focused ? 26 : 22}
              color={palette[meta.color]}
              style={{ opacity: focused ? 1 : 0.45 }}
            />
            <Text
              style={{
                fontFamily: 'Oswald_500Medium',
                fontSize: 15,
                color: focused ? palette.ink : palette.inkFaint,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const palette = usePalette();
  const enabled = useTabs();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      tabBarPosition="bottom"
      screenOptions={{ sceneStyle: { backgroundColor: palette.background } }}
    >
      {enabled.map((tab) => (
        <Tabs.Screen key={tab} name={tab} options={{ title: tabLabel[tab] }} />
      ))}
    </Tabs>
  );
}
