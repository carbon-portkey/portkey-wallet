package com.PortkeyApp.compose.qr_code

import android.content.Context
import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.PortkeyApp.compose.general.ReactComposeView
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
    initSize: Int = 16,
    initPageIdentifier: String = "UNKNOWN"
): ReactComposeView {
    return ReactComposeView(context = cxt, identifier = initPageIdentifier) {
        val logoPainter: Painter =
            painterResource(R.drawable.portkey_black_border_radius)
        val painter =
            rememberQrCodePainter(
                data = initContent,
                shapes = QrShapes(darkPixel = QrPixelShape.roundCorners()),
                logo = QrLogo(
                    painter = logoPainter,
                    size = .2f,
                    shape = QrLogoShape.roundCorners(.05f)
                ),
            )
        Column(
            modifier = Modifier
                .height(initSize.dp)
                .width(initSize.dp)
        ) {
            Image(
                painter = painter,
                contentDescription = "transfer QR code",
                modifier = Modifier.fillMaxSize()
            )
        }
        DisposableEffect(initSize) {
            onDispose {
                Log.w("QrCodeView", "dispose")
            }
        }
    }
}
