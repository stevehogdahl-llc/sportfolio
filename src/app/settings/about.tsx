import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsRow, SettingsSection } from '@/components/settings';
import { queryClient } from '@/query';

const ISSUES_URL = 'https://github.com/stevehogdahl-llc/sportfolio/issues';

const appVersion = Constants.expoConfig?.version ?? '—';

function Body({ children }: { children: string }) {
  return (
    <View className="px-3.5 py-3">
      <Text className="font-mono-rg text-[12px] leading-5 text-ink-dim">{children}</Text>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const [cacheCleared, setCacheCleared] = useState(false);

  const clearCache = () => {
    Alert.alert('Clear cache?', 'Removes downloaded scores and images. They reload on next open.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          queryClient.clear();
          if (Platform.OS !== 'web') {
            await Promise.all([Image.clearMemoryCache(), Image.clearDiskCache()]);
          }
          setCacheCleared(true);
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
    >
      <SettingsSection title="Data source">
        <Body>
          Live scores and game data come from ESPN&apos;s public JSON feed, which is undocumented and
          unofficial and can change or break without notice. Sportfolio is not affiliated with,
          endorsed by, or connected to ESPN, MLB, or the NFL. Team names and logos are the property of
          their respective owners.
        </Body>
      </SettingsSection>

      <SettingsSection title="Storage">
        <SettingsRow
          label={cacheCleared ? 'Cache cleared' : 'Clear cache'}
          sublabel="Downloaded scores and images"
          onPress={cacheCleared ? undefined : clearCache}
        />
      </SettingsSection>

      <SettingsSection title="App">
        <SettingsRow label="Version" right={<Text className="font-mono-md text-[12px] text-ink-dim">{appVersion}</Text>} />
        <SettingsRow
          label="Report an issue"
          sublabel="Opens GitHub"
          onPress={() => void Linking.openURL(ISSUES_URL)}
        />
      </SettingsSection>

      <SettingsSection title="Acknowledgements">
        <Body>
          Built with Expo and React Native. Type set in Oswald and JetBrains Mono, both under the SIL
          Open Font License.
        </Body>
      </SettingsSection>
    </ScrollView>
  );
}
