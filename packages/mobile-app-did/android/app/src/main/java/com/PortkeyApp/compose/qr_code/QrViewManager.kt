package com.PortkeyApp.compose.qr_code

import androidx.compose.ui.platform.ComposeView
import com.PortkeyApp.compose.general.CustomizedLayoutShadowNode
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.uimanager.annotations.ReactProp

class QrViewManager : ViewManager<ComposeView,CustomizedLayoutShadowNode>() {
    private var handler: QrCodeViewHandler? = null
    private var initContent: String = ""
    private var initSize: Int = 16

    override fun getName(): String = "ComposeQrCodeView"
    override fun getShadowNodeClass(): Class<out CustomizedLayoutShadowNode> {
        return CustomizedLayoutShadowNode::class.java
    }

    override fun createShadowNodeInstance(): CustomizedLayoutShadowNode {
        return CustomizedLayoutShadowNode()
    }

    override fun createViewInstance(context: ThemedReactContext): ComposeView {
        val (handler, view) = renderQrCodeView(context, initContent, initSize)
        this.handler = handler
        return view
    }

    override fun updateExtraData(p0: ComposeView, p1: Any?) {

    }

    @ReactProp(name = "content")
    fun setContent(view: ComposeView, content: String) {
        initContent = content
        handler?.updateUrl(content)
    }

    @ReactProp(name = "size", defaultInt = 16)
    fun setSize(view: ComposeView, size: Int) {
        initSize = size
        handler?.updateSize(size)
    }

}
