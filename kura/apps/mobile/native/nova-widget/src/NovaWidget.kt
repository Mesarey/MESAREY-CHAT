package com.mesarey.kura.nova

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.RemoteViews
import com.mesarey.kura.R
import org.json.JSONObject
import java.time.LocalDate
import java.time.ZoneId

/** Una frase revisada que el widget puede mostrar. */
data class NovaItem(val id: String, val frase: String, val contexto: String)

/**
 * Contenido del widget. Se empaqueta en assets/nova_widget.json al compilar y trae
 * únicamente negas revisadas y Reglas de Oro; los borradores no llegan a este archivo.
 */
object NovaContent {
    private var negas: List<NovaItem>? = null
    private var reglas: List<NovaItem>? = null

    private fun load(context: Context) {
        if (negas != null) return
        val json = JSONObject(context.assets.open("nova_widget.json").bufferedReader(Charsets.UTF_8).use { it.readText() })
        fun list(key: String) = json.getJSONArray(key).let { a ->
            (0 until a.length()).map { i -> a.getJSONObject(i).let { NovaItem(it.getString("id"), it.getString("frase"), it.getString("contexto")) } }
        }
        negas = list("negas")
        reglas = list("reglas")
    }

    /** Rotación diaria: el mismo cálculo que `indiceDelDia` en la app. */
    fun pick(context: Context, mode: String, skip: Int): NovaItem {
        load(context)
        val pool = if (mode == NovaPrefs.MODE_REGLA) reglas!! else negas!!
        val day = LocalDate.now(ZoneId.systemDefault()).toEpochDay()
        val i = (((day + skip) % pool.size) + pool.size) % pool.size
        return pool[i.toInt()]
    }
}

/** Preferencias por widget: modo, tema, texto discreto y saltos de «Otra». */
object NovaPrefs {
    const val MODE_NEGA = "nega"
    const val MODE_REGLA = "regla"
    private const val FILE = "nova_widget"

    private fun prefs(context: Context) = context.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    fun mode(c: Context, id: Int) = prefs(c).getString("mode_$id", MODE_NEGA) ?: MODE_NEGA
    fun theme(c: Context, id: Int) = prefs(c).getString("theme_$id", "noche") ?: "noche"
    fun discreet(c: Context, id: Int) = prefs(c).getBoolean("discreet_$id", false)

    /** El salto solo vale para el día en que se tocó «Otra»; al día siguiente vuelve la rotación normal. */
    fun skip(c: Context, id: Int): Int {
        val today = LocalDate.now(ZoneId.systemDefault()).toEpochDay()
        return if (prefs(c).getLong("skipDay_$id", -1) == today) prefs(c).getInt("skip_$id", 0) else 0
    }

    fun next(c: Context, id: Int) {
        val today = LocalDate.now(ZoneId.systemDefault()).toEpochDay()
        prefs(c).edit().putInt("skip_$id", skip(c, id) + 1).putLong("skipDay_$id", today).apply()
    }

    fun save(c: Context, id: Int, mode: String, theme: String, discreet: Boolean) {
        prefs(c).edit().putString("mode_$id", mode).putString("theme_$id", theme).putBoolean("discreet_$id", discreet).putInt("skip_$id", 0).apply()
    }

    fun toggleMode(c: Context, id: Int) {
        prefs(c).edit().putString("mode_$id", if (mode(c, id) == MODE_NEGA) MODE_REGLA else MODE_NEGA).putInt("skip_$id", 0).apply()
    }

    fun clear(c: Context, id: Int) {
        prefs(c).edit().remove("mode_$id").remove("theme_$id").remove("discreet_$id").remove("skip_$id").remove("skipDay_$id").apply()
    }
}

open class NovaWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        ids.forEach { render(context, manager, it) }
        scheduleMidnight(context)
    }

    override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) {
        render(context, manager, id)
    }

    override fun onDeleted(context: Context, ids: IntArray) {
        ids.forEach { NovaPrefs.clear(context, it) }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        val id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
        when (intent.action) {
            ACTION_NEXT -> if (id != AppWidgetManager.INVALID_APPWIDGET_ID) {
                NovaPrefs.next(context, id)
                render(context, AppWidgetManager.getInstance(context), id)
            }
            ACTION_MODE -> if (id != AppWidgetManager.INVALID_APPWIDGET_ID) {
                NovaPrefs.toggleMode(context, id)
                render(context, AppWidgetManager.getInstance(context), id)
            }
            ACTION_REFRESH, Intent.ACTION_TIMEZONE_CHANGED, Intent.ACTION_TIME_CHANGED, Intent.ACTION_DATE_CHANGED -> refreshAll(context)
        }
    }

    companion object {
        const val ACTION_NEXT = "com.mesarey.kura.nova.NEXT"
        const val ACTION_MODE = "com.mesarey.kura.nova.MODE"
        const val ACTION_REFRESH = "com.mesarey.kura.nova.REFRESH"
        private val providers = listOf(NovaWidgetCompact::class.java, NovaWidgetWide::class.java)

        fun refreshAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            providers.forEach { p -> manager.getAppWidgetIds(ComponentName(context, p)).forEach { render(context, manager, it) } }
            scheduleMidnight(context)
        }

        /** Despierta el widget poco después de la medianoche local para rotar la frase del día. */
        private fun scheduleMidnight(context: Context) {
            val alarm = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val at = LocalDate.now(ZoneId.systemDefault()).plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli() + 60_000
            val intent = Intent(context, NovaWidgetCompact::class.java).setAction(ACTION_REFRESH)
            val pending = PendingIntent.getBroadcast(context, 9001, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            alarm.set(AlarmManager.RTC, at, pending)
        }

        private fun providerOf(context: Context, manager: AppWidgetManager, id: Int): Class<*> =
            providers.firstOrNull { manager.getAppWidgetInfo(id)?.provider?.className == it.name } ?: NovaWidgetCompact::class.java

        private fun broadcast(context: Context, manager: AppWidgetManager, id: Int, action: String): PendingIntent {
            val intent = Intent(context, providerOf(context, manager, id)).setAction(action)
                .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
                .setData(Uri.parse("nova-widget://$action/$id"))
            return PendingIntent.getBroadcast(context, id, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }

        private fun open(context: Context, id: Int, url: String): PendingIntent {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).setPackage(context.packageName)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            return PendingIntent.getActivity(context, id * 31 + url.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }

        fun render(context: Context, manager: AppWidgetManager, id: Int) {
            val options = manager.getAppWidgetOptions(id)
            val w = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0)
            val h = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0)
            // Sin medidas todavía (recién agregado) se usa el tamaño natural de cada proveedor.
            val wide = if (w == 0 || h == 0) providerOf(context, manager, id) == NovaWidgetWide::class.java else w >= 240 && h >= 100

            val discreet = NovaPrefs.discreet(context, id)
            // El texto discreto muestra solo reglas de conversación.
            val mode = if (discreet) NovaPrefs.MODE_REGLA else NovaPrefs.mode(context, id)
            val item = NovaContent.pick(context, mode, NovaPrefs.skip(context, id))
            val isNega = mode == NovaPrefs.MODE_NEGA

            val views = RemoteViews(context.packageName, if (wide) R.layout.nova_widget_wide else R.layout.nova_widget_compact)
            val bg = when {
                discreet -> R.drawable.nova_widget_bg_discreto
                NovaPrefs.theme(context, id) == "aurora" -> R.drawable.nova_widget_bg_aurora
                NovaPrefs.theme(context, id) == "nova" -> R.drawable.nova_widget_bg_nova
                else -> R.drawable.nova_widget_bg_noche
            }
            views.setInt(R.id.nova_root, "setBackgroundResource", bg)

            views.setTextViewText(R.id.nova_frase, if (isNega) "«${item.frase}»" else item.frase)
            views.setTextViewText(R.id.nova_contexto, if (isNega) "Qué observar: ${item.contexto}" else item.contexto)
            views.setTextViewText(R.id.nova_label, if (isNega) "NOVA · NEGA DEL DÍA · ${item.id}" else "NOVA · REGLA DE ORO")
            views.setViewVisibility(R.id.nova_label, if (discreet) View.INVISIBLE else View.VISIBLE)
            views.setTextColor(R.id.nova_label, context.getColor(if (isNega) R.color.nova_accent else R.color.nova_gold))
            views.setContentDescription(R.id.nova_root, item.frase)

            if (wide) {
                views.setViewVisibility(R.id.nova_mark, if (discreet) View.GONE else View.VISIBLE)
                views.setViewVisibility(R.id.nova_mode, if (discreet) View.INVISIBLE else View.VISIBLE)
                views.setTextViewText(R.id.nova_mode, context.getString(if (isNega) R.string.nova_widget_mode_regla else R.string.nova_widget_mode_nega))
                views.setOnClickPendingIntent(R.id.nova_mode, broadcast(context, manager, id, ACTION_MODE))
                val practice = if (isNega) "kura://nova/arena?c=${item.id}" else "kura://nova/mapa"
                views.setOnClickPendingIntent(R.id.nova_practice, open(context, id, practice))
                val config = Intent(context, NovaWidgetConfigActivity::class.java)
                    .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
                    .setData(Uri.parse("nova-widget://config/$id"))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                views.setOnClickPendingIntent(R.id.nova_config, PendingIntent.getActivity(context, id, config, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
            } else {
                // Compacto: una frase. La línea de contexto y «Otra» aparecen solo si el tamaño lo permite.
                views.setViewVisibility(R.id.nova_contexto, if (h >= 100) View.VISIBLE else View.GONE)
                views.setViewVisibility(R.id.nova_next, if (w == 0 || w >= 150) View.VISIBLE else View.GONE)
            }
            views.setOnClickPendingIntent(R.id.nova_next, broadcast(context, manager, id, ACTION_NEXT))
            // Tocar la tarjeta abre la ficha correspondiente dentro de NOVA.
            val ficha = open(context, id, "kura://nova/ficha/${item.id}")
            views.setOnClickPendingIntent(R.id.nova_root, ficha)
            views.setOnClickPendingIntent(R.id.nova_frase, ficha)
            manager.updateAppWidget(id, views)
        }
    }
}

class NovaWidgetCompact : NovaWidgetProvider()
class NovaWidgetWide : NovaWidgetProvider()
