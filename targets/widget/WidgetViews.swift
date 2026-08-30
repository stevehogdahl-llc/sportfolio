import SwiftUI
import WidgetKit

private enum Palette {
    static let accent = Color("$accent")
    static let background = Color("$widgetBackground")
}

// MARK: - Entry point view

struct SportfolioWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    var entry: GameEntry

    var body: some View {
        Group {
            if !entry.hasSynced {
                EmptyStateView(message: "Open Sportfolio to sync your games.")
            } else if entry.games.isEmpty {
                EmptyStateView(message: "No games tracked yet.")
            } else {
                switch family {
                case .systemSmall:
                    SmallWidgetView(game: entry.games[0])
                case .systemLarge:
                    GameListView(entry: entry, limit: 8)
                default:
                    GameListView(entry: entry, limit: 3)
                }
            }
        }
        .containerBackground(Palette.background, for: .widget)
    }
}

// MARK: - Small: one featured game

private struct SmallWidgetView: View {
    let game: WidgetGame

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            LeagueTag(game: game)
            Spacer(minLength: 0)
            TeamLine(abbr: game.away.abbr, score: game.away.score, state: game.state)
            TeamLine(abbr: game.home.abbr, score: game.home.score, state: game.state)
            Spacer(minLength: 0)
            StatusLabel(game: game)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .widgetURL(game.deepLink)
    }
}

// MARK: - Medium / Large: header + rows

private struct GameListView: View {
    let entry: GameEntry
    let limit: Int

    private var games: [WidgetGame] { Array(entry.games.prefix(limit)) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HeaderView(updated: entry.payload?.updatedDate)
                .padding(.bottom, 6)

            ForEach(Array(games.enumerated()), id: \.element.id) { index, game in
                Link(destination: game.deepLink ?? URL(string: "sportfolio://")!) {
                    GameRow(game: game)
                }
                if index < games.count - 1 {
                    Divider().opacity(0.4)
                }
            }

            if entry.games.count > limit {
                Text("+\(entry.games.count - limit) more")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .padding(.top, 4)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

private struct GameRow: View {
    let game: WidgetGame

    var body: some View {
        HStack(spacing: 8) {
            VStack(alignment: .leading, spacing: 2) {
                TeamLine(abbr: game.away.abbr, score: game.away.score, state: game.state)
                TeamLine(abbr: game.home.abbr, score: game.home.score, state: game.state)
            }
            Spacer(minLength: 4)
            StatusLabel(game: game)
                .multilineTextAlignment(.trailing)
        }
        .padding(.vertical, 6)
        .contentShape(Rectangle())
    }
}

// MARK: - Shared pieces

private struct HeaderView: View {
    let updated: Date?

    var body: some View {
        HStack {
            Text("SPORTFOLIO")
                .font(.caption.weight(.bold))
                .tracking(1.5)
                .foregroundStyle(Palette.accent)
            Spacer()
            if let updated {
                Text(updated, style: .time)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

private struct LeagueTag: View {
    let game: WidgetGame

    var body: some View {
        HStack(spacing: 4) {
            Text(game.league.rawValue.uppercased())
                .font(.caption2.weight(.bold))
                .foregroundStyle(Palette.accent)
            if game.state == .live {
                Circle().fill(Palette.accent).frame(width: 5, height: 5)
            }
        }
    }
}

private struct TeamLine: View {
    let abbr: String
    let score: Int?
    let state: GameState

    var body: some View {
        HStack {
            Text(abbr)
                .font(.headline)
                .lineLimit(1)
            Spacer(minLength: 6)
            Text(score.map(String.init) ?? "–")
                .font(.headline.monospacedDigit())
                .foregroundStyle(state == .finished ? .secondary : .primary)
        }
    }
}

private struct StatusLabel: View {
    let game: WidgetGame

    var body: some View {
        Text(game.statusLine)
            .font(.caption.weight(game.state == .live ? .semibold : .regular))
            .foregroundStyle(game.state == .live ? Palette.accent : Color.secondary)
            .lineLimit(2)
    }
}

private struct EmptyStateView: View {
    let message: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("SPORTFOLIO")
                .font(.caption.weight(.bold))
                .tracking(1.5)
                .foregroundStyle(Palette.accent)
            Text(message)
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

// MARK: - Previews

#Preview("Small", as: .systemSmall) {
    SportfolioWidget()
} timeline: {
    GameEntry(date: .now, payload: .sample)
}

#Preview("Medium", as: .systemMedium) {
    SportfolioWidget()
} timeline: {
    GameEntry(date: .now, payload: .sample)
    GameEntry(date: .now, payload: nil)
}

#Preview("Large", as: .systemLarge) {
    SportfolioWidget()
} timeline: {
    GameEntry(date: .now, payload: .sample)
}
