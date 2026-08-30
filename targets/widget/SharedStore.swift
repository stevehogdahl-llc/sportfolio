import Foundation

// Reads the payload the React Native app writes via `@bacons/apple-targets`
// `ExtensionStorage`. That module stores objects/arrays as JSON `Data` and
// strings as plain `String`, so try both representations.

enum SharedStore {
    static let appGroup = "group.com.stevehogdahlllc.sportfolio"
    static let payloadKey = "portfolio_v1"

    static func readPayload() -> WidgetPayload? {
        guard let defaults = UserDefaults(suiteName: appGroup) else { return nil }

        let data: Data?
        if let raw = defaults.data(forKey: payloadKey) {
            data = raw
        } else if let string = defaults.string(forKey: payloadKey) {
            data = string.data(using: .utf8)
        } else {
            data = nil
        }

        guard let data else { return nil }
        return try? JSONDecoder().decode(WidgetPayload.self, from: data)
    }
}

// MARK: - Sample data for previews / the widget gallery

extension WidgetPayload {
    static let sample = WidgetPayload(
        updatedAt: ISO8601DateFormatter().string(from: Date()),
        games: [
            WidgetGame(
                id: "sample-1", league: .nfl,
                away: WidgetTeam(abbr: "KC", score: 17),
                home: WidgetTeam(abbr: "BUF", score: 20),
                statusLine: "Q3 04:12", state: .live,
                startsAt: "2026-08-30T17:00:00.000Z"
            ),
            WidgetGame(
                id: "sample-2", league: .mlb,
                away: WidgetTeam(abbr: "LAD", score: 3),
                home: WidgetTeam(abbr: "SF", score: 2),
                statusLine: "Top 7th", state: .live,
                startsAt: "2026-08-30T19:15:00.000Z"
            ),
            WidgetGame(
                id: "sample-3", league: .nfl,
                away: WidgetTeam(abbr: "DAL", score: nil),
                home: WidgetTeam(abbr: "PHI", score: nil),
                statusLine: "7:30 PM", state: .upcoming,
                startsAt: "2026-08-30T23:30:00.000Z"
            ),
            WidgetGame(
                id: "sample-4", league: .mlb,
                away: WidgetTeam(abbr: "NYY", score: 5),
                home: WidgetTeam(abbr: "BOS", score: 1),
                statusLine: "Final", state: .finished,
                startsAt: "2026-08-30T15:05:00.000Z"
            ),
        ]
    )
}
