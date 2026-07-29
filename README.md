# polybot — HA Flip + Parlay para Polymarket 15m

Ejecutor y backfill de la estrategia "HA Flip + Parlay x4" (velas Heikin Ashi
de 15 minutos sobre BTC, mercados "Bitcoin Up or Down 15m" de Polymarket),
la misma lógica validada en el indicador de Pine.

## Archivos

- `polybot.py` — ejecutor en vivo. Modos `probe` (verifica feed/Gamma/SDK sin
  tocar fondos), `paper` (ciclo completo con precios y libro reales, sin
  enviar órdenes) y `live` (envía órdenes, requiere `--confirmo-live`).
- `polybackfill.py` — reconstruye la estrategia sobre datos históricos usando
  precios de entrada reales de Polymarket (no un payout supuesto), para medir
  el precio real de entrada y el intervalo de confianza del win rate.

## Instalación

```bash
pip install -r requirements.txt
cp .env.example .env      # completa las credenciales, NUNCA las subas al repo
```

## Uso

```bash
python polybot.py probe                 # primero, siempre
python polybot.py paper                 # ciclo completo, sin fondos reales
python polybot.py live --confirmo-live  # fondos reales

python polybackfill.py probe
python polybackfill.py run --desde 2026-06-01 --hasta 2026-07-29
```

`config.json` y `.env` se generan/editan localmente y no se versionan (ver
`.gitignore`); `polybot.py` los crea con valores por defecto en la primera
corrida si no existen.

## Importante: red bloqueada en este entorno remoto

Esta sesión de Claude Code corre en un contenedor en la nube cuya política de
egress **bloquea por política organizacional** (403 en el proxy, no un error
técnico) los hosts que estos scripts necesitan:

- `api.binance.com` (velas de precio)
- `gamma-api.polymarket.com`, `clob.polymarket.com`, `data-api.polymarket.com`

Por diseño de la sandbox no se debe intentar rodear ese bloqueo. Esto quiere
decir que `probe`, `paper`, `live` y `polybackfill.py run` **no se pueden
ejecutar de punta a punta desde aquí** — solo se pudo verificar sintaxis,
compilación y la lógica interna con datos sintéticos (sin red).

Para correr el bot de verdad (probe, paper 24h, o live) hace falta uno de:

1. Clonar este repo y correrlo en tu máquina local con Claude Code CLI o
   directamente con Python (`pip install -r requirements.txt`).
2. Un entorno de Claude Code Remote cuya política de red permita esos hosts.

## Bug corregido en esta revisión

`polybot.py` tenía un bug estructural en `Bot.tick()`: la señal "al cierre"
(y la confirmación de una señal anticipada aplazada) se evaluaban sobre
`cur_ms`, la ventana de 15m **todavía en formación**. Por construcción esa
ventana nunca tiene sus 15 velas de 1m completas mientras falta tiempo para
que cierre, así que `confirmed_flip(cur_ms)` jamás detectaba nada — solo las
entradas anticipadas (ANT) llegaban a operar en vivo.

El fix evalúa el flip confirmado sobre la última ventana que **realmente**
cerró (`HAEngine.last_complete_window()`), y apuesta sobre la ventana
siguiente. Verificado con velas sintéticas (sin red) reproduciendo ambos
casos: flip visible desde temprano (ANT) y flip que solo aparece en el
último minuto de la vela (CIE). Ver commits para el detalle.
