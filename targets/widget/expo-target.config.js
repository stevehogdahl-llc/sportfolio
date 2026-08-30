/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "SportfolioWidget",
  displayName: "Sportfolio",
  deploymentTarget: "17.0",
  frameworks: ["SwiftUI", "WidgetKit"],
  colors: {
    // DynamicColor is { light, dark } — used by the widget-configuration UI and
    // referenced from SwiftUI as Color("$accent") / Color("$widgetBackground").
    $accent: "#e0a83e",
    $widgetBackground: { light: "#ffffff", dark: "#0e1117" },
  },
  entitlements: {
    // Share a container with the app so the widget can read the synced payload.
    "com.apple.security.application-groups":
      config.ios?.entitlements?.["com.apple.security.application-groups"] ?? [
        "group.com.stevehogdahlllc.sportfolio",
      ],
  },
});
