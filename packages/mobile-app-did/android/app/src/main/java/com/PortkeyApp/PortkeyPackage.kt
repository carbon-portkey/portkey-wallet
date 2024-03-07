package com.PortkeyApp.native_modules

import com.PortkeyApp.compose.qr_code.QrViewManager
import com.PortkeyApp.native_modules.lifecycle.AppLifeCycleModule
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class PortkeyPackage : ReactPackage {
    override fun createNativeModules(reactApplicationContext: ReactApplicationContext): List<NativeModule> {
        return mutableListOf(AppLifeCycleModule(reactApplicationContext))
    }

    override fun createViewManagers(reactApplicationContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return mutableListOf(QrViewManager())
    }
}
