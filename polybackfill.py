#!/usr/bin/env python3
"""
polybackfill.py
===============
Reconstruye retroactivamente la estrategia "HA Flip + Parlay x4" sobre los
mercados de 15 minutos de Polymarket, usando PRECIOS DE ENTRADA REALES en vez
de un payout supuesto.

Qué hace, en orden:
  1. Descarga velas de 1 minuto de Binance para el rango de fechas.
  2. Arma velas de 15 minutos y calcula Heikin Ashi igual que el script de Pine,
     incluyendo el Heikin Ashi PROVISIONAL a T-60s para la entrada anticipada.
  3. Para cada señal, localiza el mercado de Polymarket de la ventana objetivo.
  4. Mide a qué precio se estaba operando en el minuto exacto de la entrada.
  5. Lee el resultado OFICIAL de Polymarket (no lo estima de las velas).
  6. Corre la contabilidad del parlay con payout = 1 / precio_real.
  7. Escribe un CSV y un resumen que replica la tabla del indicador de Pine.

Uso:
    python polybackfill.py probe
    python polybackfill.py probe --at 2026-07-28T14:00
    python polybackfill.py run --desde 2026-06-01 --hasta 2026-07-29
    python polybackfill.py run --desde 2026-07-01 --hasta 2026-07-29 \
        --capital 250 --base-pct 2 --ciclo 4 --min-dist 0.05 --adelanto-min 1

Requisitos:
    pip install requests

NOTA IMPORTANTE: este script no pudo ser probado contra las APIs reales durante
su escritura (el entorno donde se generó no tiene salida a binance.com,
gamma-api.polymarket.com ni data-api.polymarket.com). Por eso existe el modo
`probe`: CORRELO PRIMERO. Verifica los cuatro endpoints uno por uno e imprime
las respuestas crudas. Si alguno falla, el propio probe te dice qué campo o
parámetro hay que ajustar, y sólo hay que tocar la constante correspondiente
arriba de este archivo.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple

try:
    import requests
except ImportError:
    sys.exit("Falta la dependencia: pip install requests")


# ══════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN — si el probe falla, se ajusta aquí
# ══════════════════════════════════════════════════════════════════════════

BINANCE_KLINES = "https://api.binance.com/api/v3/klines"
BINANCE_SYMBOL = "BTCUSDT"

GAMMA_EVENTS = "https://gamma-api.polymarket.com/events"
CLOB_PRICES_HISTORY = "https://clob.polymarket.com/prices-history"
DATA_TRADES = "https://data-api.polymarket.com/trades"

# Patrón del slug del evento. Verificado contra URLs reales de Polymarket, que
# tienen la forma polymarket.com/event/btc-updown-15m-1776361500 donde el número
# es el unix timestamp (segundos, UTC) del INICIO de la ventana de 15 minutos.
SLUG_PATTERN = "btc-updown-15m-{ts}"

WINDOW_SEC = 15 * 60
CACHE_FILE = "polybackfill_cache.json"
HTTP_PAUSE = 0.15          # segundos entre llamadas, para no gatillar rate limit
HTTP_TIMEOUT = 20
HTTP_RETRIES = 3


# ══════════════════════════════════════════════════════════════════════════
# HTTP con caché en disco
# ══════════════════════════════════════════════════════════════════════════

class Http:
    """GET con reintentos y caché persistente en disco.

    La caché evita volver a pegarle a la API en corridas sucesivas, que es lo
    que permite ir ampliando el rango de fechas sin repetir trabajo.
    """

    def __init__(self, cache_path: str = CACHE_FILE, use_cache: bool = True):
        self.cache_path = cache_path
        self.use_cache = use_cache
        self.cache: Dict[str, Any] = {}
        self.hits = 0
        self.calls = 0
        if use_cache and os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as fh:
                    self.cache = json.load(fh)
            except (json.JSONDecodeError, OSError):
                self.cache = {}
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "polybackfill/1.0"})

    @staticmethod
    def _key(url: str, params: Dict[str, Any]) -> str:
        return url + "?" + "&".join(f"{k}={params[k]}" for k in sorted(params))

    def get(self, url: str, params: Dict[str, Any], cacheable: bool = True) -> Any:
        key = self._key(url, params)
        if self.use_cache and cacheable and key in self.cache:
            self.hits += 1
            return self.cache[key]

        last_err: Optional[str] = None
        for attempt in range(HTTP_RETRIES):
            try:
                self.calls += 1
                resp = self.session.get(url, params=params, timeout=HTTP_TIMEOUT)
                if resp.status_code == 429:
                    time.sleep(2 ** attempt)
                    continue
                resp.raise_for_status()
                data = resp.json()
                if self.use_cache and cacheable:
                    self.cache[key] = data
                time.sleep(HTTP_PAUSE)
                return data
            except Exception as exc:                      # noqa: BLE001
                last_err = f"{type(exc).__name__}: {exc}"
                time.sleep(0.5 * (attempt + 1))
        raise RuntimeError(f"GET falló tras {HTTP_RETRIES} intentos: {key}\n  {last_err}")

    def save(self) -> None:
        if not self.use_cache:
            return
        tmp = self.cache_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(self.cache, fh)
        os.replace(tmp, self.cache_path)


# ══════════════════════════════════════════════════════════════════════════
# VELAS
# ══════════════════════════════════════════════════════════════════════════

@dataclass
class Bar:
    t: int          # unix ms del inicio
    o: float
    h: float
    l: float
    c: float


@dataclass
class Bar15(Bar):
    intra: List[Bar] = field(default_factory=list)   # las velas de 1 minuto


def fetch_1m(http: Http, start_ms: int, end_ms: int) -> List[Bar]:
    """Descarga velas de 1 minuto de Binance, paginando de 1000 en 1000."""
    out: List[Bar] = []
    cursor = start_ms
    while cursor < end_ms:
        data = http.get(BINANCE_KLINES, {
            "symbol": BINANCE_SYMBOL,
            "interval": "1m",
            "startTime": cursor,
            "endTime": end_ms,
            "limit": 1000,
        })
        if not data:
            break
        for k in data:
            out.append(Bar(int(k[0]), float(k[1]), float(k[2]), float(k[3]), float(k[4])))
        nxt = int(data[-1][0]) + 60_000
        if nxt <= cursor:
            break
        cursor = nxt
        if len(data) < 1000:
            break
    return out


def group_15m(bars_1m: List[Bar]) -> List[Bar15]:
    """Agrupa velas de 1 minuto en velas de 15, alineadas a :00 :15 :30 :45.

    Sólo devuelve ventanas COMPLETAS (15 velas de un minuto). Una ventana con
    huecos produciría un Heikin Ashi distinto al de TradingView, y peor, un
    provisional a T-60s que no corresponde.
    """
    buckets: Dict[int, List[Bar]] = {}
    for b in bars_1m:
        key = (b.t // (WINDOW_SEC * 1000)) * (WINDOW_SEC * 1000)
        buckets.setdefault(key, []).append(b)

    out: List[Bar15] = []
    for key in sorted(buckets):
        group = sorted(buckets[key], key=lambda x: x.t)
        if len(group) != 15:
            continue
        out.append(Bar15(
            t=key,
            o=group[0].o,
            h=max(x.h for x in group),
            l=min(x.l for x in group),
            c=group[-1].c,
            intra=group,
        ))
    return out


def heikin_ashi(bars: List[Bar15]) -> Tuple[List[float], List[float]]:
    """Heikin Ashi con la misma recursión que el script de Pine."""
    ha_c: List[float] = []
    ha_o: List[float] = []
    for i, b in enumerate(bars):
        ha_c.append((b.o + b.h + b.l + b.c) / 4.0)
        if i == 0:
            ha_o.append((b.o + b.c) / 2.0)
        else:
            ha_o.append((ha_o[i - 1] + ha_c[i - 1]) / 2.0)
    return ha_o, ha_c


# ══════════════════════════════════════════════════════════════════════════
# SEÑALES
# ══════════════════════════════════════════════════════════════════════════

@dataclass
class Signal:
    side: str            # "UP" | "DOWN"
    kind: str            # "ANT" (anticipada) | "CIE" (al cierre)
    entry_ms: int        # momento exacto de la compra
    window_start_s: int  # inicio (unix segundos) de la ventana apostada
    dist_pct: float      # distancia HA que gatilló la señal


def build_signals(bars: List[Bar15], min_dist: float, cut_min: int,
                  min_body: float, do_up: bool, do_dn: bool,
                  use_early: bool) -> List[Signal]:
    """Replica exactamente la lógica de señales del indicador de Pine.

    La señal se evalúa en la vela i; la apuesta es sobre la ventana i+1.
    """
    ha_o, ha_c = heikin_ashi(bars)
    use_bars = 15 - cut_min
    signals: List[Signal] = []

    for i in range(1, len(bars) - 1):        # -1: necesitamos la ventana i+1
        b = bars[i]
        prev_green = ha_c[i - 1] > ha_o[i - 1]
        green = ha_c[i] > ha_o[i]

        body_ok = (abs(ha_c[i] - ha_o[i]) / b.c * 100.0) >= min_body if b.c else False

        # Heikin Ashi provisional: sólo las primeras use_bars velas de 1 minuto
        early_up = early_dn = False
        dist = 0.0
        if use_early and use_bars >= 1 and len(b.intra) >= use_bars and ha_o[i]:
            head = b.intra[:use_bars]
            prov_c = (b.o + max(x.h for x in head)
                      + min(x.l for x in head) + head[-1].c) / 4.0
            dist = (prov_c - ha_o[i]) / ha_o[i] * 100.0
            prov_green = prov_c > ha_o[i]
            early_up = prov_green and not prev_green and dist >= min_dist and do_up
            early_dn = (not prov_green) and prev_green and dist <= -min_dist and do_dn

        conf_up = green and not prev_green and body_ok and do_up
        conf_dn = (not green) and prev_green and body_ok and do_dn
        late_up = conf_up and not early_up
        late_dn = conf_dn and not early_dn

        window_start_s = (b.t + WINDOW_SEC * 1000) // 1000

        if early_up or early_dn:
            signals.append(Signal(
                side="UP" if early_up else "DOWN",
                kind="ANT",
                entry_ms=b.t + use_bars * 60_000,      # T-cut de la vela señal
                window_start_s=window_start_s,
                dist_pct=dist,
            ))
        elif late_up or late_dn:
            signals.append(Signal(
                side="UP" if late_up else "DOWN",
                kind="CIE",
                entry_ms=b.t + 15 * 60_000,            # cierre de la vela señal
                window_start_s=window_start_s,
                dist_pct=(ha_c[i] - ha_o[i]) / ha_o[i] * 100.0 if ha_o[i] else 0.0,
            ))
    return signals


# ══════════════════════════════════════════════════════════════════════════
# POLYMARKET
# ══════════════════════════════════════════════════════════════════════════

def _maybe_json(value: Any) -> Any:
    """Gamma devuelve varios campos como strings con JSON adentro."""
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    return value


@dataclass
class Market:
    slug: str
    condition_id: str
    token_up: str
    token_down: str
    winner: Optional[str]     # "UP" | "DOWN" | None si no resolvió

    def token(self, side: str) -> str:
        return self.token_up if side == "UP" else self.token_down


def fetch_market(http: Http, window_start_s: int) -> Optional[Market]:
    """Localiza el mercado de la ventana y extrae tokens + resultado oficial."""
    slug = SLUG_PATTERN.format(ts=window_start_s)
    try:
        events = http.get(GAMMA_EVENTS, {"slug": slug})
    except RuntimeError:
        return None
    if not isinstance(events, list) or not events:
        return None

    markets = events[0].get("markets") or []
    if not markets:
        return None
    m = markets[0]

    tokens = _maybe_json(m.get("clobTokenIds")) or []
    outcomes = _maybe_json(m.get("outcomes")) or []
    prices = _maybe_json(m.get("outcomePrices")) or []
    if len(tokens) < 2 or len(outcomes) < 2:
        return None

    # El orden de outcomes manda; no asumir que "Up" viene primero.
    idx_up = next((i for i, o in enumerate(outcomes)
                   if str(o).strip().lower() in ("up", "yes")), 0)
    idx_dn = 1 - idx_up if len(tokens) == 2 else idx_up

    winner: Optional[str] = None
    if prices and len(prices) >= 2:
        try:
            p_up = float(prices[idx_up])
            p_dn = float(prices[idx_dn])
            if p_up >= 0.99:
                winner = "UP"
            elif p_dn >= 0.99:
                winner = "DOWN"
        except (TypeError, ValueError):
            winner = None

    return Market(
        slug=slug,
        condition_id=str(m.get("conditionId") or ""),
        token_up=str(tokens[idx_up]),
        token_down=str(tokens[idx_dn]),
        winner=winner,
    )


def price_from_history(http: Http, token_id: str, at_ms: int,
                       tol_s: int = 90) -> Optional[float]:
    """Intenta el endpoint de historia del CLOB con fidelity de 1 minuto.

    Suele venir vacío en mercados ya resueltos (por eso existe el fallback),
    pero cuando funciona es la fuente más limpia.
    """
    at_s = at_ms // 1000
    try:
        data = http.get(CLOB_PRICES_HISTORY, {
            "market": token_id,
            "startTs": at_s - 900,
            "endTs": at_s + 900,
            "fidelity": 1,
        })
    except RuntimeError:
        return None
    hist = data.get("history") if isinstance(data, dict) else None
    if not hist:
        return None
    best, best_gap = None, None
    for point in hist:
        try:
            t = int(point["t"])
            p = float(point["p"])
        except (KeyError, TypeError, ValueError):
            continue
        gap = abs(t - at_s)
        if best_gap is None or gap < best_gap:
            best, best_gap = p, gap
    if best is None or best_gap is None or best_gap > tol_s:
        return None
    return best


def price_from_trades(http: Http, market: Market, side: str, at_ms: int,
                      tol_s: int = 90) -> Optional[float]:
    """Fallback: precio del trade ejecutado más cercano al momento de entrada.

    Los fills quedan on-chain, así que esta vía sí funciona con mercados ya
    resueltos. Se normaliza al lado que nos interesa: si el print corresponde al
    token contrario, el precio equivalente es 1 - p.
    """
    at_s = at_ms // 1000
    token_want = market.token(side)
    token_other = market.token("DOWN" if side == "UP" else "UP")

    for params in (
        {"market": market.condition_id, "limit": 1000},
        {"market": token_want, "limit": 1000},
        {"asset_id": token_want, "limit": 1000},
    ):
        try:
            data = http.get(DATA_TRADES, params)
        except RuntimeError:
            continue
        rows = data if isinstance(data, list) else data.get("data") if isinstance(data, dict) else None
        if not rows:
            continue

        best, best_gap = None, None
        for row in rows:
            try:
                ts = int(float(row.get("timestamp") or row.get("matchTime") or 0))
                px = float(row.get("price"))
            except (TypeError, ValueError):
                continue
            if ts > 1e12:                     # venía en milisegundos
                ts = int(ts / 1000)
            asset = str(row.get("asset") or row.get("asset_id") or row.get("tokenId") or "")
            if asset == token_other:
                px = 1.0 - px
            elif asset and asset != token_want:
                continue
            gap = abs(ts - at_s)
            if best_gap is None or gap < best_gap:
                best, best_gap = px, gap
        if best is not None and best_gap is not None and best_gap <= tol_s:
            return best
    return None


def entry_price(http: Http, market: Market, side: str, at_ms: int,
                tol_s: int) -> Tuple[Optional[float], str]:
    p = price_from_history(http, market.token(side), at_ms, tol_s)
    if p is not None and 0.01 < p < 0.99:
        return p, "history"
    p = price_from_trades(http, market, side, at_ms, tol_s)
    if p is not None and 0.01 < p < 0.99:
        return p, "trades"
    return None, "sin_dato"


# ══════════════════════════════════════════════════════════════════════════
# CONTABILIDAD DEL PARLAY
# ══════════════════════════════════════════════════════════════════════════

@dataclass
class Fill:
    signal: Signal
    price: float
    source: str
    winner: str
    won: bool
    payout: float


def run_parlay(fills: List[Fill], cap0: float, base_pct: float,
               chain_len: int, compound: bool) -> Dict[str, Any]:
    eq, pot, step = cap0, 0.0, 0
    n_win = n_loss = 0
    chains = chains_won = 0
    win_streak = loss_streak = 0
    max_win_streak = max_loss_streak = 0
    loss_buckets = [0] * 8
    peak, max_dd = cap0, 0.0
    curve: List[Tuple[int, float]] = []
    sum_payout = 0.0

    for f in fills:
        if step == 0:
            base = min((eq if compound else cap0) * base_pct / 100.0, eq)
            if base <= 0:
                break
            pot = base
            eq -= base
        sum_payout += f.payout

        if f.won:
            pot *= f.payout
            n_win += 1
            if loss_streak > 0:
                loss_buckets[min(loss_streak, 8) - 1] += 1
                loss_streak = 0
            win_streak += 1
            max_win_streak = max(max_win_streak, win_streak)
            step += 1
            if step >= chain_len:
                eq += pot
                pot, step = 0.0, 0
                chains += 1
                chains_won += 1
        else:
            n_loss += 1
            win_streak = 0
            loss_streak += 1
            max_loss_streak = max(max_loss_streak, loss_streak)
            pot, step = 0.0, 0
            chains += 1

        mtm = eq + pot
        curve.append((f.signal.entry_ms, mtm))
        peak = max(peak, mtm)
        if peak > 0:
            max_dd = max(max_dd, (peak - mtm) / peak * 100.0)

    if loss_streak > 0:
        loss_buckets[min(loss_streak, 8) - 1] += 1

    n = n_win + n_loss
    avg_payout = sum_payout / n if n else 0.0
    return {
        "operaciones": n,
        "ganadas": n_win,
        "perdidas": n_loss,
        "win_rate": (n_win / n * 100.0) if n else 0.0,
        "payout_medio": avg_payout,
        "wr_minimo": (100.0 / avg_payout) if avg_payout else 0.0,
        "racha_max_ganadas": max_win_streak,
        "racha_max_perdidas": max_loss_streak,
        "rachas_perdedoras": loss_buckets,
        "ciclos_completos": chains_won,
        "ciclos_iniciados": chains,
        "capital_cobrado": eq,
        "bote_abierto": pot,
        "paso_abierto": step,
        "capital_final": eq + pot,
        "max_drawdown": max_dd,
        "curva": curve,
    }


# ══════════════════════════════════════════════════════════════════════════
# MODO PROBE
# ══════════════════════════════════════════════════════════════════════════

def cmd_probe(args: argparse.Namespace) -> int:
    http = Http(use_cache=False)
    ok = True

    if args.at:
        ref = datetime.fromisoformat(args.at).replace(tzinfo=timezone.utc)
    else:
        ref = datetime.now(timezone.utc) - timedelta(hours=4)
    win = (int(ref.timestamp()) // WINDOW_SEC) * WINDOW_SEC
    print(f"Ventana de prueba: {datetime.fromtimestamp(win, timezone.utc)} (unix {win})\n")

    print("[1/4] Binance klines de 1 minuto ...")
    try:
        bars = fetch_1m(http, (win - 3600) * 1000, (win + 900) * 1000)
        print(f"      OK — {len(bars)} velas. Última cierre = {bars[-1].c}\n")
    except Exception as exc:                                    # noqa: BLE001
        ok = False
        print(f"      FALLO: {exc}\n")

    print("[2/4] Gamma API: evento de la ventana ...")
    slug = SLUG_PATTERN.format(ts=win)
    market: Optional[Market] = None
    try:
        raw = http.get(GAMMA_EVENTS, {"slug": slug}, cacheable=False)
        if not raw:
            ok = False
            print(f"      VACÍO para slug={slug}")
            print("      -> El patrón del slug cambió. Busca el evento a mano en")
            print("         polymarket.com, copia el slug de la URL y ajusta")
            print("         SLUG_PATTERN arriba en este archivo.\n")
        else:
            market = fetch_market(http, win)
            print(f"      OK — slug={slug}")
            if market:
                print(f"      conditionId = {market.condition_id}")
                print(f"      token UP    = {market.token_up[:24]}...")
                print(f"      token DOWN  = {market.token_down[:24]}...")
                print(f"      ganador     = {market.winner}\n")
            else:
                ok = False
                print("      El evento existe pero no pude extraer tokens/outcomes.")
                print(f"      Campos del market: {sorted((raw[0].get('markets') or [{}])[0].keys())}\n")
    except Exception as exc:                                    # noqa: BLE001
        ok = False
        print(f"      FALLO: {exc}\n")

    if market is None:
        print("Sin mercado no puedo probar los pasos 3 y 4.")
        return 1

    at_ms = (win - 60) * 1000          # T-60s de la ventana anterior

    print("[3/4] CLOB prices-history con fidelity=1 ...")
    try:
        raw = http.get(CLOB_PRICES_HISTORY, {
            "market": market.token_up,
            "startTs": win - 1800,
            "endTs": win + 900,
            "fidelity": 1,
        }, cacheable=False)
        hist = raw.get("history") if isinstance(raw, dict) else None
        if hist:
            print(f"      OK — {len(hist)} puntos. Ejemplo: {hist[0]}")
            print("      -> Esta es la mejor fuente. Se usará como primaria.\n")
        else:
            print("      VACÍO (esperado en mercados resueltos).")
            print("      -> No es un error. Se usará el fallback de trades.\n")
    except Exception as exc:                                    # noqa: BLE001
        print(f"      FALLO: {exc}")
        print("      -> No es bloqueante. Se usará el fallback de trades.\n")

    print("[4/4] Data API trades (el fallback que importa) ...")
    found = False
    for params in (
        {"market": market.condition_id, "limit": 20},
        {"market": market.token_up, "limit": 20},
        {"asset_id": market.token_up, "limit": 20},
    ):
        try:
            raw = http.get(DATA_TRADES, params, cacheable=False)
        except Exception as exc:                                # noqa: BLE001
            print(f"      {params} -> FALLO: {exc}")
            continue
        rows = raw if isinstance(raw, list) else (raw.get("data") if isinstance(raw, dict) else None)
        if rows:
            print(f"      OK con params={params} — {len(rows)} trades")
            print(f"      Campos disponibles: {sorted(rows[0].keys())}")
            print(f"      Primer registro: {json.dumps(rows[0])[:300]}")
            found = True
            break
        print(f"      {params} -> vacío")
    print()

    if not found:
        ok = False
        print("Ningún juego de parámetros funcionó para /trades.")
        print("Pega aquí los 'Campos disponibles' que imprimió el paso 2 y")
        print("ajusto price_from_trades() a los nombres correctos.\n")

    print("─" * 60)
    if ok:
        print("Probe OK. Ya puedes correr:")
        print("  python polybackfill.py run --desde 2026-07-01 --hasta 2026-07-29")
    else:
        print("Probe con fallos. Pásame la salida completa y lo ajusto.")
    return 0 if ok else 1


# ══════════════════════════════════════════════════════════════════════════
# MODO RUN
# ══════════════════════════════════════════════════════════════════════════

def cmd_run(args: argparse.Namespace) -> int:
    d0 = datetime.fromisoformat(args.desde).replace(tzinfo=timezone.utc)
    d1 = datetime.fromisoformat(args.hasta).replace(tzinfo=timezone.utc)
    if d1 <= d0:
        sys.exit("--hasta debe ser posterior a --desde")

    http = Http(use_cache=not args.sin_cache)

    print(f"Rango: {d0.date()} a {d1.date()}")
    print("Descargando velas de 1 minuto de Binance ...")
    bars_1m = fetch_1m(http, int(d0.timestamp()) * 1000, int(d1.timestamp()) * 1000)
    bars = group_15m(bars_1m)
    print(f"  {len(bars_1m)} velas de 1m -> {len(bars)} ventanas de 15m completas")

    signals = build_signals(
        bars,
        min_dist=args.min_dist,
        cut_min=args.adelanto_min,
        min_body=args.min_body,
        do_up=not args.solo_down,
        do_dn=not args.solo_up,
        use_early=not args.sin_anticipada,
    )
    n_ant = sum(1 for s in signals if s.kind == "ANT")
    print(f"  {len(signals)} señales ({n_ant} anticipadas, {len(signals) - n_ant} al cierre)")
    print(f"\nConsultando Polymarket para cada señal (caché: {'no' if args.sin_cache else 'sí'}) ...")

    fills: List[Fill] = []
    sin_mercado = sin_precio = sin_resolver = 0

    for i, sig in enumerate(signals, 1):
        if i % 25 == 0 or i == len(signals):
            print(f"  {i}/{len(signals)}  (llamadas={http.calls} caché={http.hits})")
        market = fetch_market(http, sig.window_start_s)
        if market is None:
            sin_mercado += 1
            continue
        if market.winner is None:
            sin_resolver += 1
            continue
        price, source = entry_price(http, market, sig.side, sig.entry_ms, args.tolerancia)
        if price is None:
            sin_precio += 1
            continue
        fills.append(Fill(
            signal=sig,
            price=price,
            source=source,
            winner=market.winner,
            won=(market.winner == sig.side),
            payout=1.0 / price,
        ))

    http.save()

    print(f"\nSeñales con datos completos: {len(fills)} de {len(signals)}")
    print(f"  descartadas -> sin mercado: {sin_mercado} | "
          f"sin resolver: {sin_resolver} | sin precio: {sin_precio}")
    if not fills:
        print("\nSin datos utilizables. Corre `probe` para ver qué endpoint falla.")
        return 1

    cobertura = len(fills) / len(signals) * 100.0
    if cobertura < 70:
        print(f"\n  AVISO: cobertura de {cobertura:.0f}%. Por debajo de ~70% el")
        print("  resultado tiene sesgo de supervivencia: las ventanas sin trades")
        print("  cercanos suelen ser las más ilíquidas, y probablemente también")
        print("  las de peor precio. Trata el número como optimista.")

    res = run_parlay(fills, args.capital, args.base_pct, args.ciclo, not args.sin_compuesto)

    ant = [f for f in fills if f.signal.kind == "ANT"]
    cie = [f for f in fills if f.signal.kind == "CIE"]
    avg = lambda xs: sum(xs) / len(xs) if xs else 0.0          # noqa: E731

    print("\n" + "═" * 60)
    print("  RESULTADO CON PRECIOS REALES DE POLYMARKET")
    print("═" * 60)
    print(f"  Periodo                 {d0.date()} a {d1.date()}")
    print(f"  Operaciones             {res['operaciones']}")
    print(f"  Ganadas / perdidas      {res['ganadas']} / {res['perdidas']}")
    print(f"  Win rate                {res['win_rate']:.2f}%")
    print(f"  WR mínimo requerido     {res['wr_minimo']:.2f}%")
    marg = res["win_rate"] - res["wr_minimo"]
    print(f"  Margen                  {marg:+.2f} puntos"
          f"   {'<-- RENTABLE' if marg > 0 else '<-- NO RENTABLE'}")
    print("─" * 60)
    print(f"  Payout medio REAL       {res['payout_medio']:.3f}")
    print(f"  Precio medio anticipada {avg([f.price for f in ant]):.4f}  ({len(ant)} ops)")
    print(f"  Precio medio al cierre  {avg([f.price for f in cie]):.4f}  ({len(cie)} ops)")
    print(f"  Ventaja del adelanto    {avg([f.price for f in cie]) - avg([f.price for f in ant]):+.4f}")
    print("─" * 60)
    print(f"  Racha máx ganadas       {res['racha_max_ganadas']}")
    print(f"  Racha máx perdidas      {res['racha_max_perdidas']}")
    print(f"  Rachas perdedoras       " + "  ".join(
        f"{i + 1 if i < 7 else '8+'}:{v}" for i, v in enumerate(res["rachas_perdedoras"])))
    print(f"  Ciclos x{args.ciclo} completos      {res['ciclos_completos']} / {res['ciclos_iniciados']}")
    print("─" * 60)
    print(f"  Capital inicial         {args.capital:.2f}")
    print(f"  Capital cobrado         {res['capital_cobrado']:.2f}")
    if res["paso_abierto"]:
        print(f"  Bote abierto            {res['bote_abierto']:.2f}"
              f"  (paso {res['paso_abierto']}/{args.ciclo}, aún no cobrado)")
    print(f"  Capital final           {res['capital_final']:.2f}")
    ret = (res["capital_final"] - args.capital) / args.capital * 100.0
    print(f"  Retorno                 {ret:+.2f}%")
    print(f"  Max drawdown            {res['max_drawdown']:.2f}%")
    print("═" * 60)

    # Significancia: ¿alcanza la muestra para distinguir señal de suerte?
    n = res["operaciones"]
    if n:
        p = res["win_rate"] / 100.0
        err = 1.96 * ((p * (1 - p) / n) ** 0.5) * 100.0
        lo, hi = res["win_rate"] - err, res["win_rate"] + err
        print(f"\n  Intervalo de confianza 95%: {lo:.1f}% a {hi:.1f}%")
        if lo <= res["wr_minimo"]:
            print(f"  El umbral de {res['wr_minimo']:.1f}% cae DENTRO del intervalo.")
            print("  Con esta muestra no se puede afirmar que la estrategia gane.")
            need = int(p * (1 - p) * (1.96 / ((p - res['wr_minimo'] / 100.0) or 1e-9)) ** 2)
            if 0 < need < 200_000:
                print(f"  Harían falta ~{need} operaciones para concluir.")
        else:
            print(f"  El umbral de {res['wr_minimo']:.1f}% queda FUERA del intervalo.")
            print("  La ventaja es estadísticamente significativa en este rango.")

    with open(args.csv, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["entrada_utc", "ventana_utc", "lado", "tipo", "dist_ha_pct",
                    "precio_entrada", "payout", "fuente_precio", "ganador", "resultado"])
        for f in fills:
            w.writerow([
                datetime.fromtimestamp(f.signal.entry_ms / 1000, timezone.utc).isoformat(),
                datetime.fromtimestamp(f.signal.window_start_s, timezone.utc).isoformat(),
                f.signal.side, f.signal.kind, f"{f.signal.dist_pct:.4f}",
                f"{f.price:.4f}", f"{f.payout:.4f}", f.source,
                f.winner, "GANADA" if f.won else "PERDIDA",
            ])
    print(f"\nDetalle operación por operación -> {args.csv}")
    return 0


# ══════════════════════════════════════════════════════════════════════════

def main() -> int:
    ap = argparse.ArgumentParser(
        description="Backfill de la estrategia HA Flip + Parlay con precios reales de Polymarket")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("probe", help="Verifica los 4 endpoints. CORRER PRIMERO.")
    p.add_argument("--at", help="Ventana de prueba, ej 2026-07-28T14:00")
    p.set_defaults(func=cmd_probe)

    r = sub.add_parser("run", help="Corre el backfill completo")
    r.add_argument("--desde", required=True, help="YYYY-MM-DD")
    r.add_argument("--hasta", required=True, help="YYYY-MM-DD")
    r.add_argument("--capital", type=float, default=250.0)
    r.add_argument("--base-pct", type=float, default=2.0)
    r.add_argument("--ciclo", type=int, default=4)
    r.add_argument("--min-dist", type=float, default=0.05)
    r.add_argument("--min-body", type=float, default=0.0)
    r.add_argument("--adelanto-min", type=int, default=1,
                   help="Minutos de adelanto sobre el cierre de la vela señal")
    r.add_argument("--tolerancia", type=int, default=90,
                   help="Segundos máximos entre la entrada y el precio hallado")
    r.add_argument("--sin-anticipada", action="store_true")
    r.add_argument("--sin-compuesto", action="store_true")
    r.add_argument("--solo-up", action="store_true")
    r.add_argument("--solo-down", action="store_true")
    r.add_argument("--sin-cache", action="store_true")
    r.add_argument("--csv", default="polybackfill_operaciones.csv")
    r.set_defaults(func=cmd_run)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
