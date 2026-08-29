# sportfolio

A live MLB + NFL scoreboard, built with **Expo** so the same codebase runs as a
website (React Native Web) and an iOS app.

Today it covers two things: a **scoreboard** per league (auto-refreshing) and a
**per-game detail** screen (line score + stat leaders). Standings, analytics, and
fantasy are planned later.

## Stack

- **Expo SDK 54** + **expo-router** (file-based routes; real URLs on web).
  SDK 54 so the App Store build of Expo Go can run it on a device without a
  custom dev build.
- **NativeWind v4** for styling — palette ported from `docs/legacy-scoreboard.html`
- **@tanstack/react-query** for fetching, polling, dedupe, and retry
- Data: **ESPN's free public JSON feed** (`site.api.espn.com`), called directly
  from the client. It's undocumented and unsanctioned — see
  `docs/data-source-licensing.md` before doing anything commercial with it, and
  `docs/espn-api-reference.md` for the endpoint map. The API layer in
  `src/api/` is the single seam where a licensed provider would slot in.

## Running

```bash
npm install

npm run web     # opens the site at http://localhost:8081
npm run ios     # opens the iOS app in the Simulator (needs Xcode)
npm run android # Android emulator

npm run typecheck   # tsc --noEmit
npm run lint
```

## Layout

```
src/
  app/                  expo-router routes
    (tabs)/             MLB · NFL scoreboard tabs
    game/[league]/[id]  game detail
  api/                  ESPN client + normalizers → app types (the provider seam)
  hooks/                useScoreboard, useGameDetail (React Query + polling)
  screens/              ScoreboardScreen, GameDetailScreen
  components/            GameCard, TeamRow, ScoreText, StatusPill, …
  constants/theme.ts    raw palette (mirrors tailwind.config.js tokens)
docs/                   legacy HTML prototype + API/licensing reference
```
