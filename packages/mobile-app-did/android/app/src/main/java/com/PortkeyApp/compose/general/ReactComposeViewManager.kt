package com.PortkeyApp.compose.general

import com.PortkeyApp.native_modules.lifecycle.ReactContextHolder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.uimanager.annotations.ReactProp

abstract class ReactComposeViewManager<T : ReactComposeView>(private val componentName: String) :
    ViewManager<T, CustomizedLayoutShadowNode>() {


    override fun getName(): String = componentName
    override fun getShadowNodeClass(): Class<out CustomizedLayoutShadowNode> {
        return CustomizedLayoutShadowNode::class.java
    }

    override fun createShadowNodeInstance(): CustomizedLayoutShadowNode {
        return CustomizedLayoutShadowNode()
    }

    final override fun createViewInstance(context: ThemedReactContext): T {
        ReactContextHolder.setContext(context)
        return renderView(context)
    }

    abstract fun renderView(context: ThemedReactContext): T

    override fun updateExtraData(p0: T, p1: Any?) {}

    @ReactProp(name = "pageIdentifier")
    fun setPageIdentifier(view: ReactComposeView, identifier: String) {
        view.setActualLifeCycleContext(identifier)
    }

}
