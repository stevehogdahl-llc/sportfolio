import { Switch } from 'react-native';

import { usePalette } from '@/constants/theme';
import { SettingsRow } from './SettingsRow';

type Props = {
  label: string;
  sublabel?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SettingsSwitch({ label, sublabel, value, onValueChange, disabled }: Props) {
  const palette = usePalette();
  return (
    <SettingsRow
      label={label}
      sublabel={sublabel}
      disabled={disabled}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: palette.line, true: palette.nfl }}
          ios_backgroundColor={palette.line}
        />
      }
    />
  );
}
