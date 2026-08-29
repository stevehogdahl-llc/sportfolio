/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Values live as `R G B` channel triples in src/global.css (:root = light,
        // .dark:root = dark). Keep the token names in sync with src/constants/theme.ts.
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--color-surface-2) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-dim': 'rgb(var(--color-ink-dim) / <alpha-value>)',
        'ink-faint': 'rgb(var(--color-ink-faint) / <alpha-value>)',
        mlb: 'rgb(var(--color-mlb) / <alpha-value>)',
        nfl: 'rgb(var(--color-nfl) / <alpha-value>)',
        live: 'rgb(var(--color-live) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Oswald_700Bold'],
        'display-md': ['Oswald_500Medium'],
        mono: ['JetBrainsMono_700Bold'],
        'mono-md': ['JetBrainsMono_500Medium'],
        'mono-rg': ['JetBrainsMono_400Regular'],
      },
    },
  },
  plugins: [],
};
