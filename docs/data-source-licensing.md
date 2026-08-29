# NFL & MLB Live Stats API Options — Summary

*Compiled August 29, 2026. Not legal advice — verify current terms directly with each provider before launching anything public, especially anything monetized.*

## MLB

| Source | Cost | Live data? | Public site use |
|---|---|---|---|
| **MLB Stats API** (statsapi.mlb.com) | Free, no key | Yes — live game state, boxscores, full play-by-play, standings, historical stats | Technically restricted. MLB's linked copyright notice permits only "individual, non-commercial, non-bulk use"; anything else needs written authorization from MLB Advanced Media. In practice, widely used by hobby/fan sites (e.g. the `MLB-StatsAPI` Python wrapper) with no known enforcement against small non-commercial projects — but no contractual cover if you ever monetize. |

MLB has no other major free official alternative — this is the default choice for MLB data.

## NFL

| Source | Cost | Live data? | Public site use |
|---|---|---|---|
| **ESPN hidden API** (site.api.espn.com) | Free, no key | Yes — live scores, boxscores, stats (also covers MLB, NBA, etc.) | Unsanctioned/undocumented endpoint. Falls under ESPN/Disney's general site terms, which prohibit automated scraping and unauthorized redistribution like most major media sites. Popular because enforcement against small projects is rare, but carries both legal ambiguity and the risk of the endpoint changing without notice. |
| **nflverse / nfl_data_py** | Free, open source | No — analytical/play-by-play data updated on a delay, not true live/in-game | **Clean license.** MIT-licensed: explicitly permits public and commercial use, redistribution, and modification, with attribution. No gray area. |

## Paid providers (cover both NFL and MLB)

| Provider | Cost | Notes on public-site use |
|---|---|---|
| **API-Sports** (api-sports.io) | Free daily quota; paid tiers ~$19–39/mo per sport | Terms explicitly permit building "applications, websites, fantasy sports games," etc., on free or paid plans. Reselling raw data is prohibited, and betting, broadcast, fantasy, or mass-media distribution use cases may require an additional license. |
| **The Odds API** | Free tier (500 req/mo); paid ~$25/mo | Mainly odds-focused with a separate live scores feed for NFL/MLB. |
| **SportsDataIO** | Free trial, then paid tiers (production typically needs an annual plan) | Proprietary and locked down — ToS grants only a limited, non-transferable license, prohibits unauthorized scraping, and claims all content as SportsDataIO's exclusive property. Whether a given plan permits public production use isn't spelled out generally — check your specific plan or ask their support before launching. |
| **Sportradar** | Enterprise / contract pricing | Public site use is negotiated directly in a contract, not covered by a generic ToS. |

## Bottom line

- **NFL:** `nflverse`/`nfl_data_py` is the only option here with a fully clean license for a public site, but it's not real-time. For actual live/in-game data, ESPN's hidden API is the common free choice despite the ToS ambiguity, or API-Sports if you want a provider whose terms explicitly allow the use case.
- **MLB:** the free MLB Stats API is the practical default; it's technically restricted to non-commercial personal use, but is the de facto standard for fan-built tools with low real-world enforcement risk for a hobby site.
- **If this becomes more than a hobby project** (real traffic, ads, monetization): API-Sports is the cheapest provider whose terms explicitly cover public apps/websites for both sports; SportsDataIO and Sportradar are the higher-cost, higher-coverage options worth a direct conversation with their sales/support before committing.
