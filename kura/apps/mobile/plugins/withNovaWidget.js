/**
 * Config plugin: instala el widget de NOVA en el proyecto Android generado por `expo prebuild`.
 * - Copia el código Kotlin y los recursos de native/nova-widget.
 * - Genera assets/nova_widget.json solo con contenido revisado (negas revisadas y Reglas de Oro).
 * - Registra los dos proveedores (compacto y amplio) y la pantalla de opciones en el manifiesto.
 * La carpeta android/ es generada: no se edita a mano.
 */
const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PKG = 'com.mesarey.kura.nova';

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

function widgetContent(root) {
  const data = (f) => JSON.parse(fs.readFileSync(path.join(root, 'src/content/nova/data', f), 'utf8'));
  const revisado = (x) => x.estado === 'revisado';
  const negas = data('negas.json').negas.filter(revisado).map((n) => ({ id: n.id, frase: n.texto, contexto: n.queObservar.replace(/^Ejemplo de Mitsuo\.\s*/, '') }));
  const reglas = data('reglas.json').reglas.filter(revisado).map((r) => ({ id: r.id, frase: r.titulo, contexto: r.texto }));
  if (!negas.length || !reglas.length) throw new Error('withNovaWidget: no hay contenido revisado para el widget.');
  return { version: 1, negas, reglas };
}

const withFiles = (config) =>
  withDangerousMod(config, [
    'android',
    (cfg) => {
      const root = cfg.modRequest.projectRoot;
      const main = path.join(cfg.modRequest.platformProjectRoot, 'app/src/main');
      const src = path.join(root, 'native/nova-widget');
      copyDir(path.join(src, 'src'), path.join(main, 'java', ...PKG.split('.')));
      copyDir(path.join(src, 'res'), path.join(main, 'res'));
      fs.mkdirSync(path.join(main, 'assets'), { recursive: true });
      fs.writeFileSync(path.join(main, 'assets/nova_widget.json'), JSON.stringify(widgetContent(root)));
      return cfg;
    },
  ]);

const receiver = (name, label, info) => ({
  $: { 'android:name': `${PKG}.${name}`, 'android:exported': 'true', 'android:label': `@string/${label}` },
  'intent-filter': [
    {
      action: [
        { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
        { $: { 'android:name': 'android.intent.action.TIMEZONE_CHANGED' } },
        { $: { 'android:name': 'android.intent.action.TIME_SET' } },
      ],
    },
  ],
  'meta-data': [{ $: { 'android:name': 'android.appwidget.provider', 'android:resource': `@xml/${info}` } }],
});

const withManifest = (config) =>
  withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0];
    const keep = (list) => (list ?? []).filter((x) => !String(x.$['android:name']).startsWith(PKG));
    app.receiver = [
      ...keep(app.receiver),
      receiver('NovaWidgetCompact', 'nova_widget_compact_label', 'nova_widget_compact_info'),
      receiver('NovaWidgetWide', 'nova_widget_wide_label', 'nova_widget_wide_info'),
    ];
    app.activity = [
      ...keep(app.activity),
      {
        $: { 'android:name': `${PKG}.NovaWidgetConfigActivity`, 'android:exported': 'true', 'android:theme': '@style/NovaWidgetConfig', 'android:excludeFromRecents': 'true', 'android:taskAffinity': '' },
        'intent-filter': [{ action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_CONFIGURE' } }] }],
      },
    ];
    return cfg;
  });

module.exports = (config) => withManifest(withFiles(config));
