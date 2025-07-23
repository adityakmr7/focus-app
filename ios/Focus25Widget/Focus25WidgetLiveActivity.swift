//
//  Focus25WidgetLiveActivity.swift
//  Focus25Widget
//
//  Created by Aditya Kumar on 23/07/25.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct Focus25WidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct Focus25WidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: Focus25WidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension Focus25WidgetAttributes {
    fileprivate static var preview: Focus25WidgetAttributes {
        Focus25WidgetAttributes(name: "World")
    }
}

extension Focus25WidgetAttributes.ContentState {
    fileprivate static var smiley: Focus25WidgetAttributes.ContentState {
        Focus25WidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: Focus25WidgetAttributes.ContentState {
         Focus25WidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: Focus25WidgetAttributes.preview) {
   Focus25WidgetLiveActivity()
} contentStates: {
    Focus25WidgetAttributes.ContentState.smiley
    Focus25WidgetAttributes.ContentState.starEyes
}
