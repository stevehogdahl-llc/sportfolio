import WidgetKit

struct PortfolioProvider: TimelineProvider {
    func placeholder(in context: Context) -> GameEntry {
        GameEntry(date: Date(), payload: .sample)
    }

    func getSnapshot(in context: Context, completion: @escaping (GameEntry) -> Void) {
        // The gallery / picker calls this with `isPreview == true` before the
        // user has added the widget; show sample data so it isn't a blank card.
        let payload = SharedStore.readPayload() ?? (context.isPreview ? .sample : nil)
        completion(GameEntry(date: Date(), payload: payload))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GameEntry>) -> Void) {
        let entry = GameEntry(date: Date(), payload: SharedStore.readPayload())

        // The app drives real updates by calling `WidgetCenter.reloadAllTimelines()`
        // on data change (Phase 4). This is only a safety net if the app never opens.
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date())
            ?? Date().addingTimeInterval(15 * 60)

        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}
