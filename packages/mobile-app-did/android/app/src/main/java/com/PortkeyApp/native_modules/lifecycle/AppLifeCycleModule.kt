package com.PortkeyApp.native_modules.lifecycle

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.lang.ref.WeakReference

class AppLifeCycleModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    private val mContext: WeakReference<ReactApplicationContext>

    init {
        mContext = WeakReference(context)
    }

    override fun getName(): String {
        return "AppLifeCycleModule"
    }

    @ReactMethod
    fun restartApp() {
        Log.w("AppLifeCycleModule", "restartApp")
        val context: Context? = mContext.get()
        val packageManager = context!!.packageManager
        val intent = packageManager.getLaunchIntentForPackage(context.packageName)
        val componentName = intent!!.component
        val mainIntent = Intent.makeRestartActivityTask(componentName)
        context.startActivity(mainIntent)
        Runtime.getRuntime().exit(0)
    }

    /**
     * Report special page lifetime event, this helps the Jetpack Compose functions to not be disposed accidentally.
     * @param identifier the identifier of the page
     * @param status the status of the page, should be reported as `ACTIVE`(0) when componentDidMount() and `DISPOSE`(1) when componentWillUnmount()
     */
    @ReactMethod
    fun reportPageLifeCycle(identifier: String, status: String) {
        if (!PageLifeStatus.entries.any { it.value == status }) {
            throw IllegalArgumentException("unknown status: $status")
        }
        ReactPageLifeTimeHolder.reportPageLifeCycle(identifier, getPageLifeStatus(value = status))
    }
}

object ReactPageLifeTimeHolder {
    val pageLifeTimeMap = mutableMapOf<String, PageLifeStatus>()
    private val cachedLifeCycleOwners: Set<MarkedOwner> = emptySet()
    fun reportPageLifeCycle(identifier: String, status: PageLifeStatus) {
        pageLifeTimeMap[identifier] = status
        if (status == PageLifeStatus.DISPOSE) {
            val owner = cachedLifeCycleOwners.first { it.identifier == identifier }
            owner.onDispose()
        }
    }

    private fun makeSureIdentifierStored(identifier: String) {
        if (!pageLifeTimeMap.containsKey(identifier)) {
            pageLifeTimeMap[identifier] = PageLifeStatus.ACTIVE
        }
    }

    @Synchronized
    fun getOrDefaultLifeCycleOwner(identifier: String): LifecycleOwner {
        return if (!pageLifeTimeMap.containsKey(identifier)) {
            makeSureIdentifierStored(identifier)
            val owner = provideLifeCycleOwner(identifier)
            cachedLifeCycleOwners.plus(owner)
            owner
        } else {
            cachedLifeCycleOwners.first { it.identifier == identifier }
        }
    }

    private fun provideLifeCycleOwner(identifier: String): MarkedOwner {
        makeSureIdentifierStored(identifier)
        var dispatchResumeEvent: () -> Unit = {}
        var dispatchDisposeEvent: () -> Unit = {}
        val lifeCycleInstance = object : Lifecycle() {
            val list: List<LifecycleObserver> = emptyList()
            private var mockAppInitialize: Boolean = false
            override fun addObserver(observer: LifecycleObserver) {
                list.plus(observer)
            }

            override fun removeObserver(observer: LifecycleObserver) {
                list.minus(observer)
            }

            override val currentState: State
                get() {
                    val state =
                        if (mockAppInitialize) {
                            State.RESUMED
                        } else if (pageLifeTimeMap[identifier] == PageLifeStatus.ACTIVE) {
                            State.INITIALIZED
                        } else {
                            State.DESTROYED
                        }
                    if (!mockAppInitialize) {
                        mockAppInitialize = true
                        CoroutineScope(Dispatchers.Main).launch {
                            delay(500)
                            dispatchResumeEvent()
                        }
                    }
                    return state
                }
        }
        val owner = object : MarkedOwner {
            override val identifier: String = identifier
            override val lifecycle: Lifecycle = lifeCycleInstance
            override fun onDispose() {
                dispatchDisposeEvent()
            }
        }
        dispatchResumeEvent = {
            lifeCycleInstance.list.forEach {
                if (it is DefaultLifecycleObserver) {
                    it.onResume(owner)
                } else if (it is LifecycleEventListener) {
                    it.onHostResume()
                }
            }
        }
        dispatchDisposeEvent = {
            lifeCycleInstance.list.forEach {
                if (it is DefaultLifecycleObserver) {
                    it.onPause(owner)
                } else if (it is LifecycleEventListener) {
                    it.onHostPause()
                }
            }
        }
        return owner
    }
}

object ReactContextHolder {
    private var context: WeakReference<ReactContext?> = WeakReference(null)
    fun setContext(context: ReactContext) {
        this.context = WeakReference(context)
    }

    fun sendGeneralEvent(eventName: String, params: ReadableMap = Arguments.createMap()) {
        this.context.get()
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
    }
}

interface MarkedOwner : LifecycleOwner {
    val identifier: String
    fun onDispose()
}


enum class PageLifeStatus(val value: String) {
    ACTIVE("active"),
    DISPOSE("dispose");
}

fun getPageLifeStatus(value: String): PageLifeStatus {
    return when (value) {
        "active" -> PageLifeStatus.ACTIVE
        "dispose" -> PageLifeStatus.DISPOSE
        else -> throw IllegalArgumentException("unknown status: $value")
    }
}
