import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Snapshot } from './types';

const KEY = 'sportfolio.notif.snapshot';

export async function loadSnapshot(): Promise<Snapshot> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Snapshot) : {};
  } catch {
    return {};
  }
}

export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // best effort — a lost snapshot just means one missed diff cycle
  }
}
