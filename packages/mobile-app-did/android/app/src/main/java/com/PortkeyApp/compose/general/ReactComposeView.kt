package com.PortkeyApp.compose.general

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.platform.AbstractComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import com.PortkeyApp.native_modules.lifecycle.ReactContextHolder
import com.PortkeyApp.native_modules.lifecycle.ReactPageLifeTimeHolder

open class ReactComposeView(cxt: Context) : AbstractComposeView(cxt) {
    var content: @Composable () -> Unit = {}

    constructor(
        context: Context,
        identifier: String = "UNKNOWN",
        content: @Composable () -> Unit
    ) : this(context) {
        this.content = content
        setActualLifeCycleContext(identifier)
    }

    fun setActualLifeCycleContext(identifier: String) {
        val lifeCycleOwner = ReactPageLifeTimeHolder.getOrDefaultLifeCycleOwner(identifier)
        setViewCompositionStrategy(
            ViewCompositionStrategy.DisposeOnLifecycleDestroyed(
                lifeCycleOwner.lifecycle
            )
        )
    }

    @Composable
    override fun Content() {
        content()
        UseOnDisposeBroadcast { }
    }

}

@Composable
fun UseOnDisposeBroadcast(then: () -> Unit = {}) {
    DisposableEffect(Unit) {
        onDispose {
            ReactContextHolder.sendGeneralEvent("composableForceUpdate")
            then()
        }
    }
}
