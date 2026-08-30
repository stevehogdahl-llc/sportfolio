import WidgetKit
import SwiftUI

// Reads the App Group payload written by the React Native app and renders the
// user's tracked games. Model / store / provider / views live in sibling files.
// See docs/ios-widget-implementation-plan.md.

struct SportfolioWidget: Widget {
    let kind = "SportfolioWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PortfolioProvider()) { entry in
            SportfolioWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Sportfolio")
        .description("Live scores for the games you're tracking.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

@main
struct SportfolioWidgetBundle: WidgetBundle {
    var body: some Widget {
        SportfolioWidget()
    }
}
