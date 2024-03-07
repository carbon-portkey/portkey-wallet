package com.PortkeyApp.compose.qr_code

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.AbstractComposeView
import com.PortkeyApp.compose.general.CustomizedLayoutShadowNode
import com.PortkeyApp.compose.general.ReactComposeView
import com.PortkeyApp.compose.general.ReactComposeViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class QrViewManager : ReactComposeViewManager<ReactComposeView>("ComposeQrCodeView") {
    private var initContent: String by mutableStateOf("")
    private var initSize: Int by mutableIntStateOf(16)

    override fun getShadowNodeClass(): Class<out CustomizedLayoutShadowNode> {
        return CustomizedLayoutShadowNode::class.java
    }

    override fun createShadowNodeInstance(): CustomizedLayoutShadowNode {
        return CustomizedLayoutShadowNode()
    }

    override fun renderView(context: ThemedReactContext): ReactComposeView {
        return renderQrCodeView(context, initContent, initSize)
    }

    override fun updateExtraData(p0: ReactComposeView, p1: Any?) {}

    @ReactProp(name = "content")
    fun setContent(view: AbstractComposeView, content: String) {
        initContent = content
    }

    @ReactProp(name = "size", defaultInt = 16)
    fun setSize(view: AbstractComposeView, size: Int) {
        initSize = size
    }

}
