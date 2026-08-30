import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS } from './defaults';
import type { Settings } from './types';

/**
 * Read the persisted settings blob directly from storage, for contexts where
 * the React store isn't hydrated (e.g. a headless background task). Zustand's
 * persist middleware wraps state as `{ state, version }`.
 */
export async function readPersistedSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem('sportfolio.settings');
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as { state?: Partial<Settings> };
    return { ...DEFAULT_SETTINGS, ...parsed.state };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
