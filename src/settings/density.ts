import type { CardDensity } from './types';

export interface DensityTokens {
  /** GameCard outer padding utilities. */
  cardPad: string;
  /** Gap between the status row and the team rows in a GameCard. */
  stackGap: string;
  /** TeamRow vertical padding utilities. */
  rowPad: string;
  /** Team-name font-size utility. */
  nameText: string;
  /** Square side (px) for the team logo box. */
  logoSize: number;
  /** Score font size (px) — TeamRow's default when no explicit size is passed. */
  scoreSize: number;
}

// Every utility string here is also a literal so the Tailwind JIT emits it.
export const DENSITY: Record<CardDensity, DensityTokens> = {
  comfortable: {
    cardPad: 'px-4 py-3.5',
    stackGap: 'mb-2.5',
    rowPad: 'py-1',
    nameText: 'text-[15px]',
    logoSize: 26,
    scoreSize: 26,
  },
  compact: {
    cardPad: 'px-3.5 py-2',
    stackGap: 'mb-1.5',
    rowPad: 'py-0.5',
    nameText: 'text-[14px]',
    logoSize: 20,
    scoreSize: 20,
  },
};
