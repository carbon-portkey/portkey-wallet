package com.PortkeyApp.compose.test

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ColorfulWrapper() {
    val interactionSource = remember {
        MutableInteractionSource()
    }
    val colors = listOf(
        Color(0xFFEDEFF5), // white
        Color.Black,
        Color.Red,
        Color.Green,
        Color.Blue,
        Color.DarkGray,
        Color.Cyan,
        Color.Magenta,
    )
    var color = remember {
        colors[0]
    }
    Row(
        modifier = Modifier
            .background(
                color
            )
            .size(100.dp)
            .padding(8.dp)
            .clickable(
                indication = null,
                interactionSource = interactionSource
            ) {
                color = colors.random()
            },
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {}
}
