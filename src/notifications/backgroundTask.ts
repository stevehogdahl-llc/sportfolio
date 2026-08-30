import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { readPersistedSettings } from '@/settings/persisted';
import { pollAndProcess } from './sync';

export const SCORES_TASK = 'sportfolio-scores-poll';

// Defined at module scope so the OS can invoke it on a cold start. iOS runs this
// on its own schedule (≥15 min, often much less frequent); it won't run while
// the app is force-quit.
if (Platform.OS !== 'web') {
  TaskManager.defineTask(SCORES_TASK, async () => {
    try {
      const settings = await readPersistedSettings();
      await pollAndProcess(settings);
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

/** Register the poll task when notifications are on, remove it when off. */
export async function syncBackgroundTask(enabled: boolean): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(SCORES_TASK);
    if (enabled && !registered) {
      await BackgroundTask.registerTaskAsync(SCORES_TASK, { minimumInterval: 15 });
    } else if (!enabled && registered) {
      await BackgroundTask.unregisterTaskAsync(SCORES_TASK);
    }
  } catch {
    // registration can fail on unsupported devices / simulators — non-fatal
  }
}
