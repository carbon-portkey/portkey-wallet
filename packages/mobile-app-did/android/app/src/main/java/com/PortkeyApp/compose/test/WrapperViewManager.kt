package com.PortkeyApp.compose.test

import com.PortkeyApp.compose.general.ReactComposeView
import com.PortkeyApp.compose.general.ReactComposeViewManager
import com.facebook.react.uimanager.ThemedReactContext

class WrapperViewManager : ReactComposeViewManager<ReactComposeView>("ColorfulWrapper") {
    override fun renderView(context: ThemedReactContext): ReactComposeView {
        return ReactComposeView(context) {
            ColorfulWrapper()
        }
    }
}
