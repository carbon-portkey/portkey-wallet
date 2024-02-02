package com.PortkeyApp.compose.qr_code

import android.content.Context
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.portkey.finance.R
import io.github.alexzhirkevich.qrose.options.QrLogo
import io.github.alexzhirkevich.qrose.options.QrLogoShape
import io.github.alexzhirkevich.qrose.options.QrPixelShape
import io.github.alexzhirkevich.qrose.options.QrShapes
import io.github.alexzhirkevich.qrose.options.roundCorners
import io.github.alexzhirkevich.qrose.rememberQrCodePainter

fun renderQrCodeView(
    cxt: Context,
    initContent: String = "",
    initSize: Int = 16
): Pair<QrCodeViewHandler, ComposeView> {
    var content by mutableStateOf(initContent)
    var size by mutableIntStateOf(initSize)
    val composeView = ComposeView(cxt).apply {
        minimumHeight = 100
        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
        setContent {
            val logoPainter : Painter = painterResource(R.drawable.js_assets_image_pngs_portkeyblackborderradius)

            val painter =
                rememberQrCodePainter(
                    data = content,
                    shapes = QrShapes(darkPixel = QrPixelShape.roundCorners()),
                    logo = QrLogo(
                        painter = logoPainter,
                        size = .2f,
                        shape = QrLogoShape.roundCorners(.05f)
                    ),

                )
            Column(
                modifier = Modifier
                    .height(size.dp)
                    .width(size.dp)
            ) {
                Image(painter = painter, contentDescription = "transfer QR code", modifier = Modifier.fillMaxSize())
            }
        }
    }
    val handler = object : QrCodeViewHandler {
        override fun updateUrl(url: String) {
            content = url
        }

        override fun updateSize(num: Int) {
            size = num
        }
    }
    return Pair(handler, composeView)
}

interface QrCodeViewHandler {
    fun updateUrl(url: String)
    fun updateSize(num: Int)
}
