package com.PortkeyApp.compose.general

import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.yoga.YogaMeasureFunction
import com.facebook.yoga.YogaMeasureMode
import com.facebook.yoga.YogaMeasureOutput
import com.facebook.yoga.YogaNode


class CustomizedLayoutShadowNode : LayoutShadowNode(),YogaMeasureFunction {
    init {
        setMeasureFunction(this)
    }

    override fun measure(
        node: YogaNode?,
        width: Float, widthMode: YogaMeasureMode?,
        height: Float, heightMode: YogaMeasureMode?
    ): Long {
        return YogaMeasureOutput.make(width.toInt(),height.toInt() )
    }
}
