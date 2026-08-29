# iOS Home Screen Widget — Implementation Plan

*Drafted 2026-08-29. Target: add a native WidgetKit widget to Sportfolio while keeping it an Expo project that still builds for web, iOS, and Android.*

## 1. Goal & guiding constraints

Add an iOS home screen widget that shows the user's tracked games ("portfolio") with live score and game state, without changing the nature of the project:

- **Web build stays untouched.** `expo start --web` and the static web export must work exactly as before. Native Swift code is never seen by Metro or the web bundler.
- **Continuous Native Generation stays intact.** No hand-managed `ios/` project checked into git. The widget target is declared as config and materialized by `expo prebuild`.
- **No JS/React in the widget.** WidgetKit extensions have no JS runtime and a tight memory budget. The widget is pure Swift/SwiftUI. The only contract with the app is a shared data blob plus a "reload" call.

## 2. Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  React Native app (JS)      │         │  Widget extension (Swift)    │
│                             │         │                              │
│  react-query fetches ESPN / │  write  │  TimelineProvider reads      │
│  MLB Stats API              ├────────▶│  shared JSON on each refresh │
│                             │  App    │                              │
│  On cache update:           │  Group  │  SwiftUI views render        │
│   ExtensionStorage.set(...) │ defaults│  small / medium / large      │
│   ExtensionStorage.reload() ├────────▶│  WidgetCenter reload trigger │
│                             │         │  widgetURL → sportfolio://…  │
└─────────────────────────────┘         └──────────────────────────────┘
         shared container: group.com.stevehogdahlllc.sportfolio
```

**Data flow:** the RN app is the single source of truth. It already has the data in react-query. Whenever the relevant query settles, it serializes a small view model to the App Group's `UserDefaults` and asks WidgetKit to reload. The widget's `TimelineProvider` reads that blob, builds one or a few timeline entries, and renders. The widget does **not** call the network itself in the first version (keeps auth/rate-limit/licensing concerns in one place).

**Tap target:** each widget uses `widgetURL(URL(string: "sportfolio://game/<id>"))` so tapping deep-links into the app via the existing `scheme` (`sportfolio`) and expo-router.

## 3. Decisions to lock before coding

| Decision | Proposed default | Notes |
|---|---|---|
| Apple Developer account | Required (paid) | App Groups + extensions need a real team ID; no widgets on a personal free profile in a shareable build. |
| App Group ID | `group.com.stevehogdahlllc.sportfolio` | Must be registered on the Apple Developer portal (or let EAS create it). |
| Widget bundle ID | `com.stevehogdahlllc.sportfolio.widget` | Must be a prefix-child of the app bundle ID. |
| Widget content | Portfolio games: score, clock/inning, status | Confirm exact fields. |
| Supported families | `.systemSmall`, `.systemMedium`, `.systemLarge` | Small = 1 featured game; medium = up to 3; large = up to ~8. |
| Refresh cadence | App-driven on data change + a `.after(15 min)` timeline fallback | WidgetKit budgets ~40–70 refreshes/day; don't promise second-by-second. |
| Widget does its own fetch? | No (v1) | Revisit only if background-updated live scores without opening the app become a hard requirement. |
| Configurable widget (pick which teams)? | No (v1) | `AppIntentConfiguration` is a fast-follow, not v1. |
| Minimum iOS | iOS 17 | Lets us use the modern `containerBackground` / WidgetKit APIs without branching. |

## 4. Phase 1 — Native scaffolding

Goal: an empty widget target that builds and appears in the widget gallery.

1. Install the config plugin:
   ```bash
   npx expo install @bacons/apple-targets
   ```
2. `app.json` — add the plugin and the App Group entitlement on the main app:
   ```jsonc
   "plugins": [
     "expo-router",
     ["expo-splash-screen", { /* … unchanged … */ }],
     "@bacons/apple-targets"
   ],
   "ios": {
     "supportsTablet": true,
     "bundleIdentifier": "com.stevehogdahlllc.sportfolio",
     "entitlements": {
       "com.apple.security.application-groups": ["group.com.stevehogdahlllc.sportfolio"]
     }
   }
   ```
3. Create `targets/widget/expo-target.config.js`:
   ```js
   /** @type {import('@bacons/apple-targets').Config} */
   module.exports = {
     type: "widget",
     name: "SportfolioWidget",
     deploymentTarget: "17.0",
     entitlements: {
       "com.apple.security.application-groups": [
         "group.com.stevehogdahlllc.sportfolio",
       ],
     },
   };
   ```
4. Add placeholder Swift so the target compiles (`targets/widget/index.swift` with a trivial static widget).
5. Regenerate and run:
   ```bash
   npx expo prebuild -p ios --clean
   npx expo run:ios
   ```
6. Add the widget to the simulator home screen to confirm it loads.

**Gitignore:** keep `/ios` and `/android` ignored (already are). Commit `targets/` and the `app.json` changes only.

**Exit criteria:** empty widget shows in gallery; `npm run web` still starts clean.

## 5. Phase 2 — Widget UI in Swift

Files under `targets/widget/`:

| File | Responsibility |
|---|---|
| `index.swift` | `@main struct SportfolioWidgetBundle: WidgetBundle` |
| `Provider.swift` | `TimelineProvider` — `placeholder`, `getSnapshot`, `getTimeline`; reads shared store |
| `Model.swift` | `GameEntry: TimelineEntry`, `PortfolioGame` Codable struct — **must mirror the TS type exactly** |
| `SharedStore.swift` | thin wrapper over `UserDefaults(suiteName:)`, JSON decode, sample data |
| `WidgetViews.swift` | `SmallView`, `MediumView`, `LargeView` + a `switch widgetFamily` entry view |
| `Assets.xcassets` | accent color, team-neutral logo fallback |

Details:

- `placeholder(in:)` and `getSnapshot` return **sample data** (redacted-looking, plausible) so the gallery preview and Lock Screen picker look right.
- `getTimeline` reads the shared blob; if missing/stale, render an "Open Sportfolio to sync" state.
- Timeline policy: single entry with `.after(Date().addingTimeInterval(900))` as a safety net; real updates come from the app calling reload.
- Use `.containerBackground(for: .widget)` (iOS 17) and support `.systemSmall/.systemMedium/.systemLarge`. Optionally add `.accessoryRectangular` for the Lock Screen later.
- Localize nothing hard-coded that the app already localizes; keep copy minimal.

**Exit criteria:** all three families render sample data correctly in light/dark.

## 6. Phase 3 — RN ↔ widget data bridge

1. Define the shared contract once, in TS, and hand-mirror it in `Model.swift`:
   ```ts
   // src/widget/contract.ts
   export const WIDGET_APP_GROUP = "group.com.stevehogdahlllc.sportfolio";
   export const WIDGET_DATA_KEY = "portfolio_v1";

   export interface WidgetGame {
     id: string;
     league: "nfl" | "mlb";
     away: { abbr: string; score: number | null };
     home: { abbr: string; score: number | null };
     statusLine: string;   // "Q3 04:12" | "Top 7th" | "Final" | "7:30 PM"
     state: "pre" | "in" | "post";
     startsAt: string;     // ISO
   }
   export interface WidgetPayload {
     updatedAt: string;    // ISO
     games: WidgetGame[];  // already ordered; widget just slices by family
   }
   ```
2. Write helper `src/widget/sync.ts`:
   ```ts
   import { ExtensionStorage } from "@bacons/apple-targets";
   import { Platform } from "react-native";
   import { WIDGET_APP_GROUP, WIDGET_DATA_KEY, WidgetPayload } from "./contract";

   const storage =
     Platform.OS === "ios" ? new ExtensionStorage(WIDGET_APP_GROUP) : null;

   export function syncWidget(payload: WidgetPayload) {
     if (!storage) return;                 // no-op on web & Android
     storage.set(WIDGET_DATA_KEY, JSON.stringify(payload));
     ExtensionStorage.reloadWidget();      // WidgetCenter.reloadAllTimelines()
   }
   ```
   The `Platform.OS` guard is what keeps this safe on web — `@bacons/apple-targets` is iOS-only, so it's dynamically inert elsewhere. Verify the web bundler doesn't choke on the import; if it does, move to a `.ios.ts` / `.web.ts` split.
3. `Model.swift` decodes the same JSON with a matching `Codable`. Add a unit-ish check (a Swift `#Preview` fed the TS sample JSON) to catch drift.

**Exit criteria:** calling `syncWidget(sample)` from a dev button updates the real widget within a second.

## 7. Phase 4 — Populate from real app data

- Find the react-query query (or queries) that hold the scoreboard/portfolio data.
- Add a small subscriber — either an effect in a top-level provider or `queryClient.getQueryCache().subscribe(...)` — that, on success of the relevant query, maps the cache into a `WidgetPayload` and calls `syncWidget`.
- Keep the mapping in `src/widget/fromQuery.ts` so it's testable without RN.
- Debounce to at most once every ~10s to stay inside the WidgetKit refresh budget.
- Also sync on `AppState` change to `background` so the last-known state is fresh when the user leaves the app.

**Exit criteria:** open app → widget reflects the same games/scores; background the app → widget still correct.

## 8. Phase 5 — Refresh strategy & budget

- v1: app-driven. Widget only updates while the app is opened/backgrounded periodically. Document this limitation in the app's widget onboarding copy.
- If truly live background updates are needed later:
  - Option A: `BGAppRefreshTask` in the app writes the shared blob on a schedule (still app-side, still one data path).
  - Option B: widget-side `URLSession` in `getTimeline` hitting a lightweight public endpoint (ESPN). Adds licensing/rate-limit surface to a second place — only if Option A isn't enough.
- Never rely on tighter than ~15 min guaranteed cadence; WidgetKit throttles aggressively.

## 9. Phase 6 — Build & release

- **Local:** `npx expo run:ios` covers dev.
- **EAS Build:**
  - `eas build --profile production --platform ios` — recent EAS reads entitlements and provisions the extension target automatically. Run `eas credentials` once to confirm a provisioning profile exists for `com.stevehogdahlllc.sportfolio.widget` and that the App Group is attached to both identifiers.
  - No `eas.json` change expected; if the extension profile isn't picked up, add it via `eas credentials` interactively.
- **First TestFlight build:** verify the widget shows for an external tester (catches provisioning gaps the simulator hides).
- Bump `app.json` `version` / build number as usual; the widget target inherits versioning from the plugin.

## 10. QA checklist

- [ ] `npm run web` starts; static export (`expo export -p web`) succeeds; no `@bacons/apple-targets` reference in the web bundle.
- [ ] `npm run android` builds; `syncWidget` is a no-op, no crash.
- [ ] `expo prebuild -p ios --clean` is reproducible from a clean checkout.
- [ ] Widget renders small/medium/large, light/dark, on iOS 17 and current iOS.
- [ ] Gallery/picker preview shows sample data, not an empty box.
- [ ] Live update: score change in app propagates to widget < 5s.
- [ ] Stale/empty state renders when shared store is missing.
- [ ] Tapping a game opens the correct screen via `sportfolio://game/<id>`.
- [ ] TestFlight build: widget works for an external tester.
- [ ] Refresh volume stays within WidgetKit budget over a full day (no "widget not updating" from exhaustion).

## 11. Resulting file layout

```
app.json                         # + "@bacons/apple-targets", + App Group entitlement
targets/
  widget/
    expo-target.config.js
    index.swift                  # WidgetBundle
    Provider.swift
    Model.swift
    SharedStore.swift
    WidgetViews.swift
    Assets.xcassets/
src/
  widget/
    contract.ts                  # shared type + keys (source of truth)
    sync.ts                      # ExtensionStorage write + reload, platform-guarded
    fromQuery.ts                 # react-query cache → WidgetPayload
```

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Web bundler tries to resolve iOS-only native module | `Platform.OS` guard; fall back to `sync.ios.ts` / `sync.web.ts` if needed; add a web smoke test to CI. |
| TS/Swift model drift | Single `contract.ts`; Swift `#Preview` fed the exact sample JSON; PR checklist item. |
| Provisioning/App Group misconfig surfaces only in release | Do a TestFlight build early (end of Phase 2), not at the end. |
| `expo prebuild --clean` wipes manual Xcode tweaks | Never edit `ios/` by hand; everything goes through `expo-target.config.js` / plugin. |
| Widget refresh budget exhaustion → "frozen" widget | Debounce writes; app-driven model; documented cadence expectations. |
| Licensing (ESPN/MLB terms) if widget fetches directly | v1 keeps all network in the app; defer widget-side fetch. |

## 13. Out of scope for v1 (fast-follow candidates)

- `AppIntentConfiguration` — let users choose which teams/games a widget shows.
- Interactive widgets (`Button(intent:)`) — e.g. refresh, toggle favorite.
- Lock Screen accessory widgets and StandBy.
- Live Activities (ActivityKit) for a single in-progress game — different lifecycle, separate plan.
- Android home screen widget (`AppWidgetProvider`, Kotlin) — mirror `targets/` pattern with a Glance widget.

## 14. Sequencing

1. Phase 1 scaffolding + Phase 2 sample-data UI — get a build to TestFlight to de-risk provisioning.
2. Phase 3 bridge + Phase 4 real data — the functional core.
3. Phase 5 refresh tuning + Phase 6 release hardening.
4. QA pass (Section 10), then ship.
