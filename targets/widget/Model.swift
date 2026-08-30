import Foundation
import WidgetKit

// Mirrors `src/widget/contract.ts` (created in Phase 3). Keep the two in sync —
// the app writes this JSON into the App Group and the widget decodes it here.

enum LeagueID: String, Codable {
    case nfl
    case mlb
}

enum GameState: String, Codable {
    case upcoming = "pre"
    case live = "in"
    case finished = "post"
}

struct WidgetTeam: Codable, Hashable {
    let abbr: String
    /// `nil` before kickoff / first pitch.
    let score: Int?
}

struct WidgetGame: Codable, Hashable, Identifiable {
    let id: String
    let league: LeagueID
    let away: WidgetTeam
    let home: WidgetTeam
    /// Pre-formatted by the app: "Q3 04:12", "Top 7th", "Final", "7:30 PM".
    let statusLine: String
    let state: GameState
    /// ISO-8601 string (JS `Date.toISOString()`, includes milliseconds).
    let startsAt: String

    var startDate: Date? { ISO8601.parse(startsAt) }

    var deepLink: URL? { URL(string: "sportfolio://game/\(id)") }
}

struct WidgetPayload: Codable {
    let updatedAt: String
    let games: [WidgetGame]

    var updatedDate: Date? { ISO8601.parse(updatedAt) }
}

/// `JSONDecoder.dateDecodingStrategy = .iso8601` rejects the fractional seconds
/// that `Date.toISOString()` always emits, so parse the strings ourselves.
enum ISO8601 {
    private static let withFraction: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()
    private static let plain = ISO8601DateFormatter()

    static func parse(_ value: String) -> Date? {
        withFraction.date(from: value) ?? plain.date(from: value)
    }
}

// MARK: - Timeline entry

struct GameEntry: TimelineEntry {
    let date: Date
    /// `nil` means the app has never synced (show the "open the app" hint).
    /// A non-nil payload with an empty `games` array means "synced, nothing tracked".
    let payload: WidgetPayload?

    var games: [WidgetGame] { payload?.games ?? [] }
    var hasSynced: Bool { payload != nil }
}
