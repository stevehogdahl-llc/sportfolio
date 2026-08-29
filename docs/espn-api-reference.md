# Session Output: ESPN NFL Data Exploration & API Reference

Generated from a Claude.ai chat session, intended as a handoff doc for Claude Code to continue building from.

---

## 1. Session summary

**Starting point:** User uploaded `score_results.json`, an ESPN NFL scoreboard export for Week 4 of the 2026 preseason.

**What the file contained:**
- Full 2026 NFL season calendar (preseason weeks, regular season weeks 1–18, playoffs, Super Bowl dates)
- Six games' worth of scoreboard data: two in-progress/upcoming (Lions @ Colts, Bears @ Titans) and four completed (Bills 28–27 Steelers, Browns 37–13 Patriots, 49ers 18–12 Raiders, Rams 20–18 Chargers)
- Per-game: scores, linescores by quarter, team records, stat leaders (passing/rushing/receiving), venue/weather, broadcast info, betting odds (for at least one game), and video highlight links for finished games

**Key finding:** The scoreboard JSON's `situation.lastPlay` field only exposes the single most recent play — not a full play-by-play log — even though `playByPlayAvailable: true` signals that ESPN has the complete data on their backend. The public-facing ESPN playbyplay/gamecast pages are JavaScript-rendered, so a plain `fetch` against them returns nothing useful.

**Resolution:** ESPN runs an unofficial but freely accessible JSON API (no key required) that exposes full play-by-play, drives, win probabilities, and much more. Endpoint reference compiled and detailed below.

**Worked example for this session's specific game** (Lions @ Colts, `EVENT_ID = 401873308`):
```
https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/401873308/competitions/401873308/plays?limit=300
```

---

## 2. Full ESPN Unofficial API Reference

ESPN has no official public API program (its old developer API was retired in 2014), but the JSON endpoints that power ESPN.com and its apps are open: no API key, no auth, no signup. They're undocumented and can change without notice, so keep request volume reasonable and don't rely on them for anything production-critical.

Examples below use NFL/football. Swap `/football/nfl/` → `/basketball/nba/`, `/baseball/mlb/`, etc. for other sports.

### Base domains

| Domain | Version | Purpose |
|---|---|---|
| `site.api.espn.com` | v2/v3 | Scores, news, teams, standings (site-facing, simpler schema) |
| `sports.core.api.espn.com` | v2 | Athletes, stats, odds, play-by-play, drives, detailed data |
| `sports.core.api.espn.com` | v3 | Athletes, leaders (richer schema) |
| `site.web.api.espn.com` | v3 | Search, athlete overviews/splits/gamelogs |
| `cdn.espn.com` | — | `xhr=1` endpoints powering live page updates (boxscore, playbyplay, recap) |
| `now.core.api.espn.com` | — | Real-time news feed |
| `fantasy.espn.com` / `lm-api-reads.fantasy.espn.com` | v3 | Fantasy football leagues, players, scoring |
| `partners.api.espn.com` | v2 | Bulk athlete/event lists |

### Path parameters

- `{YEAR}` — season, `YYYY`
- `{SEASONTYPE}` — `1`=pre, `2`=regular, `3`=post, `4`=off
- `{EVENT_ID}` — game ID (appears twice in most core-API game URLs: as the event and the competition)
- `{TEAM_ID}` — 1–32 for NFL
- `{ATHLETE_ID}` — player ID
- `{WEEK_NUM}` — week number within a season type
- `{BET_PROVIDER_ID}` — e.g. `1002`/`1003` for common sportsbooks

### Scoreboard / schedule

```
site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard
  ?dates=YYYYMMDD                      # specific day
  ?dates=YYYY&seasontype=2&week=1      # specific week
  ?dates=YYYY&seasontype=2             # whole regular season
  ?limit=1000&dates=YYYYMMDD-YYYYMMDD  # date range (max ~13 months)
```

Live-updating variant used by the site itself:
```
cdn.espn.com/core/nfl/scoreboard?xhr=1&limit=50
cdn.espn.com/core/nfl/schedule?xhr=1&year={YEAR}&week={WEEK_NUM}
cdn.espn.com/core/nfl/standings?xhr=1
```

### Single game

```
site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={EVENT_ID}
site.web.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={EVENT_ID}   # alt host
cdn.espn.com/core/nfl/game?xhr=1&gameId={EVENT_ID}
cdn.espn.com/core/nfl/boxscore?xhr=1&gameId={EVENT_ID}
cdn.espn.com/core/nfl/recap?xhr=1&gameId={EVENT_ID}
cdn.espn.com/core/nfl/playbyplay?xhr=1&gameId={EVENT_ID}
cdn.espn.com/core/nfl/matchup?xhr=1&gameId={EVENT_ID}
```

#### Play-by-play, drives, probabilities

```
sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/{EVENT_ID}/competitions/{EVENT_ID}/plays?limit=300
sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/{EVENT_ID}/competitions/{EVENT_ID}/drives
sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/{EVENT_ID}/competitions/{EVENT_ID}/probabilities?limit=300   # win probability by play
```
`plays` returns every play in the game (raise `limit` for playoff-length games), each with down/distance, clock, drive ref, participants (rusher/passer/receiver/tackler) and their running stats, and scoring flags. `drives` groups plays into possessions with start/end and time-of-possession.

#### Other per-game data

```
.../competitions/{EVENT_ID}/competitors/{TEAM_ID}/linescores
.../competitions/{EVENT_ID}/competitors/{TEAM_ID}/records        # record-to-date as of this game
.../competitions/{EVENT_ID}/competitors/{TEAM_ID}/statistics     # full box score stats for that team
.../competitions/{EVENT_ID}/competitors/{TEAM_ID}/roster         # starters
.../competitions/{EVENT_ID}/competitors/{TEAM_ID}/roster/{ATHLETE_ID}/statistics/0   # one player's stat line
.../competitions/{EVENT_ID}/officials
.../competitions/{EVENT_ID}/odds
.../competitions/{EVENT_ID}/odds/{BET_PROVIDER_ID}/head-to-heads
.../competitions/{EVENT_ID}/predictor                             # projected margin & win %
.../competitions/{EVENT_ID}/powerindex/{TEAM_ID}
```

### Teams

```
site.api.espn.com/apis/site/v2/sports/football/nfl/teams
site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{TEAM_ID}
site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{TEAM_ID}?enable=roster,projection,stats
site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{TEAM_ID}/roster
site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{TEAM_ID}/schedule?season={YEAR}

sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/teams/{TEAM_ID}/athletes
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/teams/{TEAM_ID}/depthcharts
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/types/{SEASONTYPE}/teams/{TEAM_ID}/record
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/types/{SEASONTYPE}/teams/{TEAM_ID}/statistics
sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams/{TEAM_ID}/injuries
sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams/{TEAM_ID}/odds/{BET_PROVIDER_ID}/past-performances
```

### Athletes

```
site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{ATHLETE_ID}            # profile
site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{ATHLETE_ID}/overview
site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{ATHLETE_ID}/gamelog     # per-game stats
site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{ATHLETE_ID}/splits
site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{ATHLETE_ID}/news
site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{ATHLETE_ID}/bio

sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes?limit=1000&active=true
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/athletes/{ATHLETE_ID}/eventlog   # played/not-played per week
sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/{EVENT_ID}/competitions/{EVENT_ID}/competitors/{TEAM_ID}/roster/{ATHLETE_ID}/statistics/0
```

### Odds & betting

```
site.web.api.espn.com/apis/v3/sports/football/nfl/odds
sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/{EVENT_ID}/competitions/{EVENT_ID}/odds
sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/{EVENT_ID}/competitions/{EVENT_ID}/odds/{BET_PROVIDER_ID}/history/0/movement?limit=100
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/types/2/teams/{TEAM_ID}/ats        # against-the-spread record
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/futures
```

### News

```
site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=50
site.api.espn.com/apis/site/v2/sports/football/nfl/news?team={TEAM_ID}
now.core.api.espn.com/v1/sports/news?limit=1000&sport=football       # includes API links to related events
site.web.api.espn.com/apis/search/v2?query={SEARCH_TERM}&limit=100
```

### Calendar / season structure

```
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/types/{SEASONTYPE}/weeks
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/types/{SEASONTYPE}/weeks/{WEEK_NUM}/events
sports.core.api.espn.com/v2/sports/football/leagues/nfl/calendar/ondays
sports.core.api.espn.com/v2/sports/football/leagues/nfl/calendar/offdays
```

### Standings

```
sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/types/{SEASONTYPE}/groups/{CONFERENCE_ID}/standings
```
`CONFERENCE_ID`: 7 = NFC, 8 = AFC.

### Fantasy football

```
fantasy.espn.com/apis/v3/games/ffl
fantasy.espn.com/apis/v3/games/ffl/seasons/{YEAR}/players?view=players_wl
fantasy.espn.com/apis/v3/games/ffl/seasons/{YEAR}/segments/0/leagues/{FANTASY_LEAGUE_ID}
  ?view=mTeam&view=mRoster&view=mMatchup&view=mSettings&view=mBoxscore
```
Private leagues need session cookies to authenticate. Public league/player data works without them. To get more than 50 items, send header `X-Fantasy-Filter: {"players":{"limit":2000}}`.

### Notes and caveats

- **Undocumented & unstable.** Endpoints, fields, and hosts have shifted over the years. Treat field presence as best-effort.
- **No rate limit is published** — the community convention is to cache aggressively and avoid hammering it.
- **Known data quirks:** community reports of occasional "phantom" plays in the play-by-play feed (a play duplicated or misattributed), and some derived stats (e.g. passing yards after catch) not always populating correctly.
- **Full community-maintained doc:** [github.com/pseudo-r/Public-ESPN-API](https://github.com/pseudo-r/Public-ESPN-API) and [gist.github.com/nntrn/espn-api-list](https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c), both actively updated by outside contributors as ESPN's endpoints change.
- **OpenAPI spec (community):** [github.com/aaronweldy/espn-openapi](https://github.com/aaronweldy/espn-openapi) — typed schemas + generated client support.

---

## 3. Suggested next steps (for Claude Code)

- Build a fetch wrapper for the `plays` and `drives` endpoints, keyed by `EVENT_ID`
- Handle the `EVENT_ID` appearing twice in most core-API URLs (event + competition)
- Consider caching responses given the "no published rate limit, be respectful" guidance above
- If pulling data for games in progress, poll the scoreboard endpoint for new `EVENT_ID`s and the `plays` endpoint per game for live updates
