# Feature Roadmap

*Selected 2026-08-30. A backlog of agreed-upon features to pick off one at a time.
Each entry is self-contained: what it is, which ESPN feed backs it, the files it
touches, rough effort (S/M/L), and what "done" looks like. Unpicked ideas are
parked in [§ Backlog](#backlog) — promote them up here when ready.*

Data-source seam is always `src/api/espn.ts` (URLs) + `src/api/normalize.ts`
(raw `unknown` → app types in `src/api/types.ts`). Screens only ever see the
normalized types.

---

## Legend

- [ ] not started  ·  `~` in progress  ·  [x] shipped
- **Effort:** S ≈ half a day · M ≈ 1–3 days · L ≈ multi-day / needs its own plan
- **Blocked:** listed dependency must land first

---

## Game detail screen

### [x] 1. Live situation strip — Effort M

Show the live game state above the line score while `state === 'in'`:
bases / balls-strikes / outs for MLB, down & distance + possession + red-zone
flag for NFL.

- **Feed:** existing `fetchSummary` response → `header.competitions[0].situation`.
  MLB: `onFirst` / `onSecond` / `onThird` (bool), `balls`, `strikes`, `outs`.
  NFL: `down`, `distance`, `shortDownDistanceText`, `possession` (team id),
  `possessionText`, `isRedZone`, `homeTimeouts` / `awayTimeouts`.
- **Files:** add `Situation` type + `situation` field to `GameDetail`
  (`src/api/types.ts`); parse in `normalizeSummary` (`src/api/normalize.ts`);
  new `src/components/SituationStrip.tsx` (a diamond for MLB, a yard-line chip
  for NFL); render it in `src/screens/GameDetailScreen.tsx` between the header
  card and the line score.
- **Done when:** an in-progress MLB game shows the correct base/count/outs and it
  updates on the 15s poll; an in-progress NFL game shows "2nd & 7 · KC ball" and
  a red-zone highlight; nothing renders for `pre` / `post`.

### [ ] 2. Scoring plays list — Effort S

A chronological "how they scored" list on the detail screen.

- **Feed:** `fetchSummary` response → `scoringPlays[]`. Each has `text`,
  `type.text`, `period.number`, `clock.displayValue`, `team.id`, `awayScore`,
  `homeScore`.
- **Files:** `ScoringPlay` type (`src/api/types.ts`); `normalizeScoringPlays` in
  `src/api/normalize.ts` (map `team.id` → abbrev via the competitors already
  parsed); new `src/components/ScoringPlaysSection.tsx`; add a `<Section>` to
  `src/screens/GameDetailScreen.tsx` shown when the array is non-empty.
- **Done when:** a finished game lists every scoring play with running score,
  period, clock and scoring team; ordering matches the broadcast.

### [ ] 3. Play-by-play feed — Effort M

Full play list for a game, live-polling while in progress.

- **Feed:** core API — `playsUrl(league, eventId)` is **already built** in
  `src/api/espn.ts` (unused). `plays?limit=300` returns the most recent plays;
  paginate with `pageIndex` / `pageSize` for playoff-length games.
- **Risk:** `sports.core.api.espn.com` may not send CORS headers — spike a web
  fetch first. If it fails on web, gate the feature behind
  `Platform.OS !== 'web'` or proxy it, and note it like `src/data/teams.ts` does.
- **Files:** `fetchPlays` in `src/api/espn.ts`; `Play` type + `normalizePlays`
  (down/distance, clock, `scoringPlay` flag, participants); new
  `src/hooks/usePlays.ts` (poll only while `state === 'in'`, mirror
  `useGameDetail`); new `src/components/PlayByPlaySection.tsx` grouped by
  period (and drive for NFL); wire into `GameDetailScreen`.
- **Done when:** an in-progress game streams new plays without a manual refresh;
  scoring plays are visually marked; a finished game shows the complete log.

---

## New top-level surfaces

### [ ] 4. Standings tab — Effort M–L

Division / conference tables per league, with favorited teams highlighted.

- **Feed:** **spike first** — the clean options are
  `site.api.espn.com/apis/site/v2/sports/<sport>/<league>/standings` (flaky
  historically) or `cdn.espn.com/core/<league>/standings?xhr=1`
  (`content.standings.groups[]` → `standings.entries[]` with `team` + `stats`).
  Avoid the core-API `groups/{id}/standings` route — it's `$ref`-heavy.
- **Files:** `Standing` / `StandingsGroup` types; `fetchStandings` +
  `normalizeStandings`; `src/hooks/useStandings.ts`; new route
  `src/app/standings/[league].tsx` + `src/screens/StandingsScreen.tsx`; reach it
  from the scoreboard header (icon) or add a `standings` `TabKey` (touches
  `src/settings/types.ts`, `(tabs)/_layout.tsx` `TAB_META`, `tabLabel`).
- **Done when:** both leagues render current standings grouped by division with
  W-L, PCT, GB / streak; favorites are visually marked; refresh-on-focus works.

### [ ] 5. Schedule + date picker — Effort M

The scoreboard is today-only; add a date scrubber and let the user browse other
days.

- **Feed:** `scoreboardUrl` + `?dates=YYYYMMDD` (already supported by ESPN).
- **Files:** `fetchScoreboard(league, date?)` in `src/api/espn.ts`;
  `useScoreboard(league, date?)` — put the date in the query key and disable
  `refetchInterval` when the date isn't today (`src/hooks/useScoreboard.ts`);
  new `src/components/DateStrip.tsx` (horizontal week strip) above the list in
  `src/screens/ScoreboardScreen.tsx`; keep "today" as the default and the only
  polling view.
- **Note:** `FavoritesScoreboardScreen` and `NotificationsProvider` also call
  `useScoreboard` — keep the no-arg call meaning "today" so they're unaffected.
- **Done when:** swiping the date strip loads that day's games; past days show
  finals, future days show start times; returning to today resumes polling.

### [ ] 6. Team pages — Effort L (own mini-plan)

Tap a team anywhere → its page: record, streak, next game, last 5, full
schedule, roster, injuries, recent news.

- **Feed:** `site.api.espn.com/apis/site/v2/sports/<sport>/<league>/teams/<id>?enable=roster,stats`,
  `/teams/<id>/schedule?season=<YEAR>`, `/teams/<id>/injuries`,
  `/news?team=<id>`.
- **Files:** `TeamDetail` type; `fetchTeam` / `fetchTeamSchedule` +
  normalizers; `src/hooks/useTeam.ts`; new route `src/app/team/[league]/[id].tsx`
  + `src/screens/TeamScreen.tsx`; make `TeamRow` (and the game-detail header
  team names) tappable `Link`s; team id → ref lookup via `src/data/teams.ts`.
- **Done when:** every team name in the app deep-links to a page that shows an
  accurate record, the next scheduled game, and a scrollable schedule; roster
  and injuries load; back navigation is the standard native chevron.

### [ ] 7. News feed — Effort M

League-wide news, optionally filtered to favorited teams.

- **Feed:** `site.api.espn.com/apis/site/v2/sports/<sport>/<league>/news?limit=50`
  (same CORS-friendly host as the scoreboard); `?team=<id>` per team.
  Response → `articles[]` with `headline`, `description`, `published`,
  `images[]`, `links.web.href`.
- **Files:** `Article` type; `fetchNews` + `normalizeNews`;
  `src/hooks/useNews.ts`; new route `src/app/news/index.tsx` +
  `src/screens/NewsScreen.tsx`; a `NewsCard` component; open articles with
  `expo-web-browser`. Entry point: scoreboard header icon or a `news` `TabKey`.
  Add a "Favorites only" toggle that unions `?team=` calls for followed teams.
- **Done when:** the feed lists recent articles with headline, blurb, image and
  timestamp; tapping opens the article; the favorites filter narrows results.

---

## Notifications

### [ ] 8. Follow a single game — Effort M

Per-game alert toggle, independent of team favorites — "notify me about *this*
game" from the card or the detail screen.

- **Files:** add `followedGames: string[]` (keys `${league}:${id}`) +
  `toggleFollowedGame` to `src/settings/store.ts` / `types.ts` /
  `defaults.ts` / `partialize`; in `src/notifications/sync.ts` `scopedGames`,
  union the scope result with games whose key is in `followedGames`; add a bell
  `Pressable` to `src/components/GameCard.tsx` and the header of
  `src/screens/GameDetailScreen.tsx`. `diffGames` already keys by game, so no
  change to the diff itself.
- **Done when:** following a non-favorite game produces score/final alerts for
  it under either notification scope; unfollowing stops them; the toggle state
  persists and shows on the card.

### [ ] 9. Quiet hours + daily digest — Effort M

Suppress alerts during a nightly window; send one "your teams today" summary each
morning.

- **Files:** extend `NotificationSettings` with
  `quietHours: { enabled, start, end }` and `dailyDigest: boolean`
  (`src/settings/types.ts`, `defaults.ts`, store actions, `merge`). Quiet hours:
  gate `presentNow` in `src/notifications/notifier.ts` — drop (or delay) any
  alert whose fire time is inside the local window; scheduled game-start alerts
  are exempt. Digest: schedule a `DAILY` trigger at a chosen local time; build
  the body from that day's favorites games on the next foreground sync (v1) or
  from a background-task fetch (v2). New controls in
  `src/app/settings/notifications.tsx`.
- **Done when:** no banners arrive inside the quiet window (verify with the test
  notification + a mocked clock); a digest notification fires once per day and
  lists the user's teams playing that day.

---

## Widget & leagues

### [ ] 10. Configurable widget (pick teams) — Effort M — **Blocked**

Let the user choose which teams / games a widget instance shows, via
`AppIntentConfiguration`.

- **Blocked on:** widget Phases 3–4 (RN↔widget data bridge + real data) from
  `docs/ios-widget-implementation-plan.md`. The payload already carries every
  game, so this is filter-only once data flows.
- **Files (all under `targets/widget/`):** swap `StaticConfiguration` →
  `AppIntentConfiguration` in `SportfolioWidget.swift`; new `AppIntent` with a
  team/league parameter (+ `AppEntity` / `EntityQuery` sourced from the shared
  payload or the bundled team list); `PortfolioProvider` →
  `AppIntentTimelineProvider`, filtering `payload.games` by the selection.
- **Done when:** long-press → Edit Widget lets the user pick one or more teams
  and the widget re-renders to just those games; unconfigured instances fall
  back to the current "portfolio" behavior.

### [ ] 11. Add a league (NBA / NHL / CFB) — Effort M per league

The normalizer is already league-agnostic; this is mostly wiring.

- **Files per league:** widen `League` in `src/api/types.ts`; add the
  `SPORT_PATH` entry in `src/api/espn.ts` (e.g. `basketball/nba`); `leagueLabel`
  + `tabLabel` + `TAB_META` (Ionicon + color) in `src/constants/theme.ts` and
  `(tabs)/_layout.tsx`; a palette token for the league color
  (`src/global.css` + `src/constants/theme.ts`); a team seed list in
  `src/data/teams.ts`; `periodLabel` branch in `normalizeSummary`
  (`Q` / `P` / etc.); close-game margin in `CLOSE_MARGIN` and the `isLate`
  check in `src/notifications/diff.ts`; `ALL_TABS` in `src/settings/types.ts`.
- **Done when:** the new league has a working scoreboard tab, game detail, line
  score, favorites picker entries, and notification support, with no regression
  to MLB / NFL.

---

## Backlog

Agreed-in-principle but not scheduled. Move a row up into a section above when
you're ready to build it.

| Idea | Feed / note | Effort |
|---|---|---|
| Win probability chart | core `probabilities` endpoint, one sparkline on game detail | M |
| Full box score | `boxscore` — team + player stat tables | M |
| Broadcast + weather + venue on game detail | `summary` → `broadcasts`, `gameInfo.weather` | S |
| Live odds / line movement on game detail | extends the existing odds toggle; `odds/{provider}/history` | M |
| Sport-specific alerts (red zone / RISP) | derive from the situation strip data (#1) | M |
| Live Activity (Dynamic Island) for one game | ActivityKit — separate lifecycle, own plan | L |
| Lock Screen accessory widget | `.accessoryRectangular` — small add once #10 lands | S |
| Android home-screen widget (Glance) | mirror the `targets/` pattern in Kotlin | L |
| Scoreboard section headers (Live / Upcoming / Final) | pure client grouping in `ScoreboardScreen` | S |
| Haptics + sound on favorite score change | extend the `ScoreText` flash in `src/components/ScoreText.tsx` | S |
| Search (teams + games) | client filter over scoreboard + `src/data/teams.ts` | S |
| Featured-game priority for widget / small views | ordering pref in settings | S |
| Offline / stale-data banner | surface last-good query data on fetch failure | S |
| iPad / landscape two-column layout | responsive pass on the scoreboard + detail | M |
| MLB series context ("Game 3 of 4", season series) | `summary` → `series` | S |
| Playoff bracket view | core `standings` + bracket endpoints | M |
| Fantasy (ESPN FFL) | `fantasy.espn.com/apis/v3/games/ffl` — public leagues only | L |
| Analytics / trend charts | `gamelog` / `statistics` endpoints | L |
