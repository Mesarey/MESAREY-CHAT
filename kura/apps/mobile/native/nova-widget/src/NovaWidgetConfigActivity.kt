package com.mesarey.kura.nova

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.CheckBox
import android.widget.RadioGroup
import com.mesarey.kura.R

/** Opciones de un widget: modo, texto discreto y tema. Se abre al agregarlo, al reconfigurarlo o desde el engrane. */
class NovaWidgetConfigActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
        val result = Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
        // Si se cierra sin tocar «Listo», el widget conserva lo que tenía.
        setResult(RESULT_OK, result)
        if (id == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }
        setContentView(R.layout.nova_widget_config)

        val mode = findViewById<RadioGroup>(R.id.nova_cfg_mode)
        val theme = findViewById<RadioGroup>(R.id.nova_cfg_theme)
        val discreet = findViewById<CheckBox>(R.id.nova_cfg_discreet)
        mode.check(if (NovaPrefs.mode(this, id) == NovaPrefs.MODE_REGLA) R.id.nova_cfg_mode_regla else R.id.nova_cfg_mode_nega)
        theme.check(
            when (NovaPrefs.theme(this, id)) {
                "aurora" -> R.id.nova_cfg_theme_aurora
                "nova" -> R.id.nova_cfg_theme_nova
                else -> R.id.nova_cfg_theme_noche
            },
        )
        discreet.isChecked = NovaPrefs.discreet(this, id)

        findViewById<Button>(R.id.nova_cfg_done).setOnClickListener {
            NovaPrefs.save(
                this, id,
                if (mode.checkedRadioButtonId == R.id.nova_cfg_mode_regla) NovaPrefs.MODE_REGLA else NovaPrefs.MODE_NEGA,
                when (theme.checkedRadioButtonId) {
                    R.id.nova_cfg_theme_aurora -> "aurora"
                    R.id.nova_cfg_theme_nova -> "nova"
                    else -> "noche"
                },
                discreet.isChecked,
            )
            NovaWidgetProvider.render(this, AppWidgetManager.getInstance(this), id)
            setResult(RESULT_OK, result)
            finish()
        }
    }
}
