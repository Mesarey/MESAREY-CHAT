#!/usr/bin/env python3
"""
polybot.py — Ejecutor en vivo de la estrategia "HA Flip + Parlay"
=================================================================
Opera los mercados "Bitcoin Up or Down 15m" de Polymarket con la misma lógica
del indicador de TradingView: detecta el cambio de color en velas Heikin Ashi
de 15 minutos y apuesta la ventana siguiente, encadenando el bote N veces.

MODOS
  probe   Verifica feed, Gamma, SDK, saldo, tick size. No toca fondos.
  paper   Corre el ciclo COMPLETO en vivo (precios reales, libro real, señales
          reales, contabilidad real) SIN enviar órdenes. Idéntico camino de
          código que live. Esto es también el logger: mide el payout real.
  live    Igual que paper pero enviando órdenes. Requiere --confirmo-live.

GESTIÓN DE RIESGO (todo configurable en config.json)
  - Paro permanente si el capital cae por debajo de un % del inicial
  - Límite de pérdida diaria
  - Tope absoluto en dólares por posición (el paso 4 del parlay es 16x la base)
  - Paro por rachas perdedoras consecutivas
  - Precio máximo de entrada: si el libro no da tu precio, NO entra
  - Kill switch: crear un archivo llamado STOP detiene el bot al siguiente tick
  - Estado persistente: reiniciar no pierde el paso del parlay

CREDENCIALES
  Solo por variables de entorno. Este script nunca las imprime ni las escribe
  a disco. NUNCA pegues tu private key en un chat, ticket, o repositorio.

      export POLYMARKET_PRIVATE_KEY=0x...
      export POLYMARKET_FUNDER=0x...          # dirección que tiene los fondos
      export POLYMARKET_SIGNATURE_TYPE=1      # 0=EOA 1=email/Magic 2=Safe
      # opcionales, si ya derivaste credenciales L2:
      export POLYMARKET_API_KEY=...
      export POLYMARKET_API_SECRET=...
      export POLYMARKET_API_PASSPHRASE=...

INSTALACIÓN
      pip install requests
      pip install py-sdk-polymarket    # o: pip install py-clob-client-v2
  NO instales py-clob-client (v1): está archivado y sus órdenes firmadas ya no
  se aceptan en producción.

USO
      python polybot.py probe
      python polybot.py paper
      python polybot.py live --confirmo-live
"""

from __future__ import annotations

import argparse
import csv
import inspect
import json
import logging
import os
import signal as sigmod
import sys
import time
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple

try:
    import requests
except ImportError:
    sys.exit("Falta: pip install requests")


WINDOW_SEC = 900
GAMMA_EVENTS = "https://gamma-api.polymarket.com/events"
CLOB_HOST = "https://clob.polymarket.com"
CLOB_BOOK = f"{CLOB_HOST}/book"
SLUG_PATTERN = "btc-updown-15m-{ts}"

STATE_FILE = "polybot_state.json"
CONFIG_FILE = "config.json"
TRADES_CSV = "polybot_trades.csv"
LOG_FILE = "polybot.log"
KILL_FILE = "STOP"
HA_CACHE_FILE = "ha_windows.json"

log = logging.getLogger("polybot")


# ══════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN
# ══════════════════════════════════════════════════════════════════════════

@dataclass
class Config:
    # --- feed de precio (para las velas Heikin Ashi) ---
    feed: str = "binance"              # "binance" | "bitstamp"
    symbol: str = "BTCUSDT"            # bitstamp usa "btcusd"

    # --- señal (mismos nombres que el indicador de Pine) ---
    min_dist_pct: float = 0.05         # distancia HA mínima para anticipar
    advance_sec: int = 60              # adelanto sobre el cierre de la vela señal
    min_body_pct: float = 0.0
    trade_up: bool = True
    trade_down: bool = True
    use_early: bool = True
    allow_late: bool = True            # entrar al cierre si no hubo anticipada

    # --- capital ---
    capital_inicial: float = 250.0
    base_pct: float = 2.0
    chain_len: int = 4
    compound: bool = True

    # --- ejecución ---
    max_entry_price: float = 0.54      # payout mínimo = 1/0.54 = 1.85
    min_order_usd: float = 1.0
    order_type: str = "FAK"            # llena lo que pueda ya y cancela el resto
    resolve_timeout_sec: int = 180

    # --- riesgo ---
    stop_drawdown_pct: float = 50.0    # paro permanente
    daily_loss_pct: float = 15.0       # paro hasta el siguiente día UTC
    max_stake_usd: float = 60.0        # tope duro por posición
    max_consec_losses: int = 8

    @classmethod
    def load(cls, path: str = CONFIG_FILE) -> "Config":
        cfg = cls()
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            known = {f for f in cls.__dataclass_fields__}
            for k, v in data.items():
                if k in known:
                    setattr(cfg, k, v)
                else:
                    print(f"  aviso: '{k}' en {path} no es un parámetro conocido, se ignora")
        else:
            with open(path, "w", encoding="utf-8") as fh:
                json.dump(asdict(cfg), fh, indent=2, ensure_ascii=False)
            print(f"  Creé {path} con los valores por defecto. Edítalo y vuelve a correr.")
        cfg.validate()
        return cfg

    def validate(self) -> None:
        assert 0 < self.base_pct <= 100, "base_pct fuera de rango"
        assert 1 <= self.chain_len <= 10, "chain_len fuera de rango"
        assert 0.01 < self.max_entry_price < 0.99, "max_entry_price fuera de rango"
        assert 0 < self.stop_drawdown_pct < 100, "stop_drawdown_pct fuera de rango"
        assert self.advance_sec % 60 == 0 and 60 <= self.advance_sec <= 840, \
            "advance_sec debe ser múltiplo de 60 entre 60 y 840"
        assert self.feed in ("binance", "bitstamp"), "feed desconocido"


# ══════════════════════════════════════════════════════════════════════════
# ESTADO PERSISTENTE
# ══════════════════════════════════════════════════════════════════════════

@dataclass
class Pending:
    """Una apuesta enviada cuya ventana todavía no cierra."""
    window_start: int
    side: str
    kind: str
    stake: float
    price: float
    shares: float
    order_id: str = ""

    @property
    def payout(self) -> float:
        return 1.0 / self.price if self.price else 0.0


@dataclass
class State:
    equity: float = 0.0
    equity_inicial: float = 0.0
    pot: float = 0.0
    step: int = 0
    n_win: int = 0
    n_loss: int = 0
    chains: int = 0
    chains_won: int = 0
    consec_losses: int = 0
    max_consec_losses: int = 0
    max_consec_wins: int = 0
    consec_wins: int = 0
    day_utc: str = ""
    day_start_equity: float = 0.0
    halted: bool = False
    halt_reason: str = ""
    pending: Optional[Dict[str, Any]] = None
    last_signal_window: int = 0
    deferred: Optional[Dict[str, Any]] = None   # señal que esperó resolución

    @classmethod
    def load(cls, cap0: float, path: str = STATE_FILE) -> "State":
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as fh:
                st = cls(**json.load(fh))
            log.info("Estado recuperado: capital=%.2f paso=%d/%s halted=%s",
                     st.equity, st.step, "?", st.halted)
            return st
        st = cls(equity=cap0, equity_inicial=cap0,
                 day_utc=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                 day_start_equity=cap0)
        st.save(path)
        return st

    def save(self, path: str = STATE_FILE) -> None:
        tmp = path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(asdict(self), fh, indent=2)
        os.replace(tmp, path)

    @property
    def curve(self) -> float:
        return self.equity + self.pot


# ══════════════════════════════════════════════════════════════════════════
# FEED DE PRECIO
# ══════════════════════════════════════════════════════════════════════════

@dataclass
class Bar:
    t: int
    o: float
    h: float
    l: float
    c: float


class Feed:
    """Velas de 1 minuto desde un exchange público, sin autenticación."""

    def __init__(self, cfg: Config):
        self.cfg = cfg
        self.s = requests.Session()
        self.s.headers.update({"User-Agent": "polybot/1.0"})

    def last_1m(self, n: int = 120) -> List[Bar]:
        if self.cfg.feed == "binance":
            r = self.s.get("https://api.binance.com/api/v3/klines",
                           params={"symbol": self.cfg.symbol, "interval": "1m",
                                   "limit": min(n, 1000)}, timeout=15)
            r.raise_for_status()
            return [Bar(int(k[0]), float(k[1]), float(k[2]), float(k[3]), float(k[4]))
                    for k in r.json()]
        r = self.s.get(f"https://www.bitstamp.net/api/v2/ohlc/{self.cfg.symbol}/",
                       params={"step": 60, "limit": min(n, 1000)}, timeout=15)
        r.raise_for_status()
        rows = r.json()["data"]["ohlc"]
        return [Bar(int(x["timestamp"]) * 1000, float(x["open"]), float(x["high"]),
                    float(x["low"]), float(x["close"])) for x in rows]


# ══════════════════════════════════════════════════════════════════════════
# MOTOR HEIKIN ASHI  (idéntico a la recursión del indicador de Pine)
# ══════════════════════════════════════════════════════════════════════════

@dataclass
class Win15:
    start: int                  # unix ms
    bars: List[Bar] = field(default_factory=list)

    @property
    def complete(self) -> bool:
        return len(self.bars) == 15

    @property
    def o(self) -> float: return self.bars[0].o

    @property
    def h(self) -> float: return max(b.h for b in self.bars)

    @property
    def l(self) -> float: return min(b.l for b in self.bars)

    @property
    def c(self) -> float: return self.bars[-1].c


class HAEngine:
    """Mantiene ventanas de 15m y calcula Heikin Ashi confirmado y provisional.

    El haOpen se siembra desde la primera ventana disponible; por ser un
    promedio recursivo converge en ~10 ventanas, así que el bot exige un
    calentamiento antes de operar.
    """

    WARMUP = 20

    def __init__(self):
        self.wins: Dict[int, Win15] = {}

    def ingest(self, bars: List[Bar]) -> None:
        for b in bars:
            key = (b.t // (WINDOW_SEC * 1000)) * (WINDOW_SEC * 1000)
            w = self.wins.setdefault(key, Win15(start=key))
            for i, ex in enumerate(w.bars):
                if ex.t == b.t:
                    w.bars[i] = b
                    break
            else:
                w.bars.append(b)
                w.bars.sort(key=lambda x: x.t)
        # no acumular memoria indefinidamente
        for key in sorted(self.wins)[:-400]:
            del self.wins[key]

    def save(self, path: str) -> None:
        """Persiste las ventanas a disco para no perder el calentamiento si el
        proceso se reinicia (crash, reinicio del servidor, etc.)."""
        data = {
            str(k): {"start": w.start, "bars": [[b.t, b.o, b.h, b.l, b.c] for b in w.bars]}
            for k, w in self.wins.items()
        }
        tmp = path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(data, fh)
        os.replace(tmp, path)

    def load(self, path: str) -> None:
        if not os.path.exists(path):
            return
        try:
            with open(path, "r", encoding="utf-8") as fh:
                data = json.load(fh)
        except (json.JSONDecodeError, OSError):
            return
        for k, w in data.items():
            bars = [Bar(t=b[0], o=b[1], h=b[2], l=b[3], c=b[4]) for b in w["bars"]]
            self.wins[int(k)] = Win15(start=w["start"], bars=bars)

    def _ha(self) -> Tuple[List[int], List[float], List[float]]:
        keys = [k for k in sorted(self.wins) if self.wins[k].complete]
        ha_o: List[float] = []
        ha_c: List[float] = []
        for i, k in enumerate(keys):
            w = self.wins[k]
            ha_c.append((w.o + w.h + w.l + w.c) / 4.0)
            ha_o.append((w.o + w.c) / 2.0 if i == 0
                        else (ha_o[i - 1] + ha_c[i - 1]) / 2.0)
        return keys, ha_o, ha_c

    def ready(self) -> bool:
        keys, _, _ = self._ha()
        return len(keys) >= self.WARMUP

    def last_complete_window(self) -> Optional[int]:
        """Inicio (unix s) de la última ventana de 15m con sus 15 velas de 1m."""
        keys = [k for k in sorted(self.wins) if self.wins[k].complete]
        return keys[-1] if keys else None

    def confirmed_flip(self, window_start: int) -> Optional[Tuple[str, float]]:
        """Color del flip confirmado de una ventana ya cerrada, o None."""
        keys, ha_o, ha_c = self._ha()
        if window_start not in keys:
            return None
        i = keys.index(window_start)
        if i == 0:
            return None
        green = ha_c[i] > ha_o[i]
        prev = ha_c[i - 1] > ha_o[i - 1]
        if green == prev:
            return None
        body = abs(ha_c[i] - ha_o[i]) / self.wins[window_start].c * 100.0
        return ("UP" if green else "DOWN"), body

    def provisional(self, window_start: int, use_bars: int
                    ) -> Optional[Tuple[str, float]]:
        """Flip provisional usando solo las primeras use_bars velas de 1m."""
        keys, ha_o, ha_c = self._ha()
        w = self.wins.get(window_start)
        if w is None or len(w.bars) < use_bars:
            return None
        prior = [k for k in keys if k < window_start]
        if not prior:
            return None
        i = keys.index(prior[-1])
        prev_green = ha_c[i] > ha_o[i]
        ha_o_now = (ha_o[i] + ha_c[i]) / 2.0
        if ha_o_now == 0:
            return None
        head = w.bars[:use_bars]
        prov_c = (w.bars[0].o + max(x.h for x in head)
                  + min(x.l for x in head) + head[-1].c) / 4.0
        dist = (prov_c - ha_o_now) / ha_o_now * 100.0
        prov_green = prov_c > ha_o_now
        if prov_green == prev_green:
            return None
        return ("UP" if prov_green else "DOWN"), dist


# ══════════════════════════════════════════════════════════════════════════
# POLYMARKET: mercados y libro
# ══════════════════════════════════════════════════════════════════════════

@dataclass
class Market:
    slug: str
    condition_id: str
    token_up: str
    token_down: str
    winner: Optional[str]

    def token(self, side: str) -> str:
        return self.token_up if side == "UP" else self.token_down


def _mj(v: Any) -> Any:
    if isinstance(v, str):
        try:
            return json.loads(v)
        except json.JSONDecodeError:
            return v
    return v


class Poly:
    def __init__(self):
        self.s = requests.Session()
        self.s.headers.update({"User-Agent": "polybot/1.0"})

    def market(self, window_start_s: int) -> Optional[Market]:
        slug = SLUG_PATTERN.format(ts=window_start_s)
        try:
            r = self.s.get(GAMMA_EVENTS, params={"slug": slug}, timeout=15)
            r.raise_for_status()
            evs = r.json()
        except Exception as exc:                              # noqa: BLE001
            log.warning("Gamma falló para %s: %s", slug, exc)
            return None
        if not evs:
            return None
        mkts = evs[0].get("markets") or []
        if not mkts:
            return None
        m = mkts[0]
        toks = _mj(m.get("clobTokenIds")) or []
        outs = _mj(m.get("outcomes")) or []
        prices = _mj(m.get("outcomePrices")) or []
        if len(toks) < 2 or len(outs) < 2:
            return None
        iu = next((i for i, o in enumerate(outs)
                   if str(o).strip().lower() in ("up", "yes")), 0)
        idn = 1 - iu
        winner = None
        if len(prices) >= 2:
            try:
                if float(prices[iu]) >= 0.99:
                    winner = "UP"
                elif float(prices[idn]) >= 0.99:
                    winner = "DOWN"
            except (TypeError, ValueError):
                pass
        return Market(slug, str(m.get("conditionId") or ""),
                      str(toks[iu]), str(toks[idn]), winner)

    def best_ask(self, token_id: str) -> Optional[Tuple[float, float]]:
        """Mejor precio de venta disponible y su tamaño en shares."""
        try:
            r = self.s.get(CLOB_BOOK, params={"token_id": token_id}, timeout=15)
            r.raise_for_status()
            book = r.json()
        except Exception as exc:                              # noqa: BLE001
            log.warning("Libro falló: %s", exc)
            return None
        asks = book.get("asks") or []
        best = None
        for lvl in asks:
            try:
                p, s = float(lvl["price"]), float(lvl["size"])
            except (KeyError, TypeError, ValueError):
                continue
            if best is None or p < best[0]:
                best = (p, s)
        return best


# ══════════════════════════════════════════════════════════════════════════
# BROKER  (adaptador: py-sdk preferido, py-clob-client-v2 de respaldo)
# ══════════════════════════════════════════════════════════════════════════

def _maybe_await(x: Any) -> Any:
    if inspect.iscoroutine(x):
        import asyncio
        return asyncio.get_event_loop().run_until_complete(x) \
            if asyncio.get_event_loop().is_running() else asyncio.run(x)
    return x


class Broker:
    """Envoltura mínima sobre el SDK de Polymarket.

    Todo el contacto con fondos pasa por aquí. Si el probe indica que el SDK
    instalado tiene otra firma, este es el único lugar que hay que tocar.
    """

    def __init__(self, live: bool):
        self.live = live
        self.client = None
        self.backend = "paper"
        if not live:
            return

        pk = os.environ.get("POLYMARKET_PRIVATE_KEY")
        if not pk:
            raise SystemExit("Falta POLYMARKET_PRIVATE_KEY en el entorno.")
        funder = os.environ.get("POLYMARKET_FUNDER") or None
        sig_type = int(os.environ.get("POLYMARKET_SIGNATURE_TYPE", "1"))

        creds = None
        if all(os.environ.get(k) for k in
               ("POLYMARKET_API_KEY", "POLYMARKET_API_SECRET", "POLYMARKET_API_PASSPHRASE")):
            creds = {
                "api_key": os.environ["POLYMARKET_API_KEY"],
                "api_secret": os.environ["POLYMARKET_API_SECRET"],
                "api_passphrase": os.environ["POLYMARKET_API_PASSPHRASE"],
            }

        try:
            from py_sdk import PolymarketClient          # type: ignore
            kw: Dict[str, Any] = {"private_key": pk}
            if funder:
                kw["funder"] = funder
            self.client = PolymarketClient(**kw)
            self.backend = "py-sdk"
            log.info("Broker: py-sdk")
            return
        except Exception as exc:                              # noqa: BLE001
            log.info("py-sdk no disponible (%s), probando py-clob-client-v2", exc)

        try:
            from py_clob_client_v2 import ApiCreds, ClobClient   # type: ignore
            kw = {"host": CLOB_HOST, "chain_id": 137, "key": pk,
                  "signature_type": sig_type}
            if funder:
                kw["funder"] = funder
            c = ClobClient(**kw)
            if creds:
                c.set_api_creds(ApiCreds(**creds))
            else:
                derive = getattr(c, "create_or_derive_api_key", None) \
                    or getattr(c, "create_or_derive_api_creds", None)
                if derive:
                    c.set_api_creds(_maybe_await(derive()))
            self.client = c
            self.backend = "py-clob-client-v2"
            log.info("Broker: py-clob-client-v2")
            return
        except Exception as exc:                              # noqa: BLE001
            raise SystemExit(
                "No pude inicializar ningún SDK de Polymarket.\n"
                f"  Último error: {type(exc).__name__}: {exc}\n"
                "  Instala: pip install py-clob-client-v2\n"
                "  NO uses py-clob-client (v1): sus órdenes ya no se aceptan."
            ) from exc

    def balance_usdc(self) -> Optional[float]:
        if not self.live or self.client is None:
            return None
        for name in ("get_balances", "get_balance", "balances"):
            fn = getattr(self.client, name, None)
            if not fn:
                continue
            try:
                res = _maybe_await(fn())
            except Exception:                                 # noqa: BLE001
                continue
            if isinstance(res, (int, float)):
                return float(res)
            if isinstance(res, dict):
                for k in ("usdc", "USDC", "collateral", "balance", "available"):
                    if k in res:
                        try:
                            return float(res[k])
                        except (TypeError, ValueError):
                            pass
        return None

    def buy(self, token_id: str, usd: float, max_price: float,
            order_type: str) -> Tuple[bool, str, float, float]:
        """Compra por importe. Devuelve (ok, order_id, precio_medio, shares).

        max_price es la garantía: si el libro no ofrece ese precio o mejor, la
        orden no se llena y no entramos.
        """
        if not self.live or self.client is None:
            return True, "PAPER", max_price, usd / max_price

        fn = getattr(self.client, "place_market_order", None)
        if fn:
            try:
                res = _maybe_await(fn(
                    token_id=token_id, side="BUY", amount=f"{usd:.2f}",
                    max_spend=f"{usd:.2f}", max_price=max_price,
                    order_type=order_type,
                ))
                return self._parse(res, usd, max_price)
            except Exception as exc:                           # noqa: BLE001
                log.error("place_market_order falló: %s", exc)
                return False, "", 0.0, 0.0

        try:
            from py_clob_client_v2 import OrderArgs, Side      # type: ignore
            shares = round(usd / max_price, 2)
            res = _maybe_await(self.client.create_and_post_order(   # type: ignore
                order_args=OrderArgs(token_id=token_id, price=max_price,
                                     side=Side.BUY, size=shares)))
            return self._parse(res, usd, max_price)
        except Exception as exc:                               # noqa: BLE001
            log.error("create_and_post_order falló: %s", exc)
            return False, "", 0.0, 0.0

    @staticmethod
    def _parse(res: Any, usd: float, max_price: float
               ) -> Tuple[bool, str, float, float]:
        if not isinstance(res, dict):
            return True, str(res)[:60], max_price, usd / max_price
        ok = res.get("success", True) and not res.get("errorMsg")
        oid = str(res.get("orderID") or res.get("orderId") or res.get("id") or "")
        shares = 0.0
        price = max_price
        for k in ("makingAmount", "size", "matchedAmount", "filledSize"):
            if k in res:
                try:
                    shares = float(res[k])
                    break
                except (TypeError, ValueError):
                    pass
        for k in ("price", "avgPrice", "averagePrice"):
            if k in res:
                try:
                    price = float(res[k])
                    break
                except (TypeError, ValueError):
                    pass
        if shares <= 0:
            shares = usd / price if price else 0.0
        if not ok:
            log.error("Orden rechazada: %s", json.dumps(res)[:300])
        return bool(ok), oid, price, shares


# ══════════════════════════════════════════════════════════════════════════
# RIESGO
# ══════════════════════════════════════════════════════════════════════════

class Risk:
    def __init__(self, cfg: Config):
        self.cfg = cfg

    def check(self, st: State) -> Optional[str]:
        """Devuelve el motivo del paro, o None si se puede seguir operando."""
        if os.path.exists(KILL_FILE):
            return f"kill switch: existe el archivo {KILL_FILE}"
        if st.halted:
            return st.halt_reason or "estado marcado como detenido"

        floor = st.equity_inicial * (1.0 - self.cfg.stop_drawdown_pct / 100.0)
        if st.curve <= floor:
            return (f"PARO POR DRAWDOWN: capital {st.curve:.2f} <= "
                    f"{floor:.2f} ({self.cfg.stop_drawdown_pct:.0f}% del inicial)")

        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if st.day_utc != today:
            st.day_utc = today
            st.day_start_equity = st.curve
            st.save()
        if st.day_start_equity > 0:
            day_dd = (st.day_start_equity - st.curve) / st.day_start_equity * 100.0
            if day_dd >= self.cfg.daily_loss_pct:
                return (f"límite diario alcanzado: -{day_dd:.1f}% hoy "
                        f"(tope {self.cfg.daily_loss_pct:.0f}%). Sigue mañana UTC.")

        if st.consec_losses >= self.cfg.max_consec_losses:
            return (f"{st.consec_losses} pérdidas consecutivas "
                    f"(tope {self.cfg.max_consec_losses})")
        return None

    def stake(self, st: State) -> Tuple[float, Optional[str]]:
        cfg = self.cfg
        if st.step == 0:
            base = (st.equity if cfg.compound else st.equity_inicial) * cfg.base_pct / 100.0
        else:
            base = st.pot
        if base > cfg.max_stake_usd:
            return cfg.max_stake_usd, (
                f"posición recortada de {base:.2f} a {cfg.max_stake_usd:.2f} "
                f"por max_stake_usd")
        if base > st.equity + st.pot:
            return 0.0, "saldo insuficiente"
        if base < cfg.min_order_usd:
            return 0.0, f"posición {base:.2f} por debajo del mínimo {cfg.min_order_usd:.2f}"
        return base, None


# ══════════════════════════════════════════════════════════════════════════
# BOT
# ══════════════════════════════════════════════════════════════════════════

class Bot:
    def __init__(self, cfg: Config, live: bool):
        self.cfg = cfg
        self.live = live
        self.feed = Feed(cfg)
        self.poly = Poly()
        self.ha = HAEngine()
        self.ha.load(HA_CACHE_FILE)
        self.risk = Risk(cfg)
        self.broker = Broker(live)
        self.st = State.load(cfg.capital_inicial)
        self.stop = False
        if self.st.equity_inicial == 0:
            self.st.equity_inicial = cfg.capital_inicial
        self._csv_header()
        if self.ha.wins:
            log.info("Calentamiento recuperado de %s: %d ventanas en memoria.",
                     HA_CACHE_FILE, len(self.ha.wins))

    # ---------- registro ----------

    def _csv_header(self) -> None:
        if not os.path.exists(TRADES_CSV):
            with open(TRADES_CSV, "w", newline="", encoding="utf-8") as fh:
                csv.writer(fh).writerow([
                    "hora_utc", "modo", "ventana_utc", "lado", "tipo",
                    "dist_ha_pct", "precio", "payout", "stake", "shares",
                    "resultado", "paso", "capital_cobrado", "bote", "capital_total",
                    "order_id"])

    def _csv(self, p: Pending, resultado: str) -> None:
        with open(TRADES_CSV, "a", newline="", encoding="utf-8") as fh:
            csv.writer(fh).writerow([
                datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "LIVE" if self.live else "PAPER",
                datetime.fromtimestamp(p.window_start, timezone.utc).isoformat(),
                p.side, p.kind, "", f"{p.price:.4f}", f"{p.payout:.4f}",
                f"{p.stake:.2f}", f"{p.shares:.2f}", resultado, self.st.step,
                f"{self.st.equity:.2f}", f"{self.st.pot:.2f}", f"{self.st.curve:.2f}",
                p.order_id])

    # ---------- resolución de la apuesta pendiente ----------

    def _resolve(self) -> None:
        if not self.st.pending:
            return
        p = Pending(**self.st.pending)
        end = p.window_start + WINDOW_SEC
        now = int(time.time())
        if now < end + 5:
            return

        mkt = self.poly.market(p.window_start)
        winner = mkt.winner if mkt else None
        if winner is None:
            if now < end + self.cfg.resolve_timeout_sec:
                return
            log.warning("Polymarket no publicó resultado en %ds; "
                        "no puedo resolver la ventana %s con certeza.",
                        self.cfg.resolve_timeout_sec,
                        datetime.fromtimestamp(p.window_start, timezone.utc))
            log.warning("El bot se detiene para no desincronizar el parlay. "
                        "Revisa la posición a mano en polymarket.com y ajusta "
                        f"{STATE_FILE} antes de reiniciar.")
            self.st.halted = True
            self.st.halt_reason = "resolución desconocida; requiere revisión manual"
            self.st.save()
            self.stop = True
            return

        won = (winner == p.side)
        if won:
            self.st.pot = p.stake * p.payout
            self.st.n_win += 1
            self.st.consec_losses = 0
            self.st.consec_wins += 1
            self.st.max_consec_wins = max(self.st.max_consec_wins, self.st.consec_wins)
            self.st.step += 1
            if self.st.step >= self.cfg.chain_len:
                self.st.equity += self.st.pot
                log.info("CICLO COMPLETO x%d — cobrado %.2f. Capital: %.2f",
                         self.cfg.chain_len, self.st.pot, self.st.equity)
                self.st.pot = 0.0
                self.st.step = 0
                self.st.chains += 1
                self.st.chains_won += 1
            else:
                log.info("GANADA paso %d/%d — bote %.2f (aún no cobrado)",
                         self.st.step, self.cfg.chain_len, self.st.pot)
        else:
            self.st.n_loss += 1
            self.st.consec_wins = 0
            self.st.consec_losses += 1
            self.st.max_consec_losses = max(self.st.max_consec_losses,
                                            self.st.consec_losses)
            perdido = self.st.pot if self.st.step > 0 else p.stake
            self.st.pot = 0.0
            self.st.step = 0
            self.st.chains += 1
            log.info("PERDIDA — se pierde %.2f. Capital: %.2f", perdido, self.st.equity)

        self._csv(p, "GANADA" if won else "PERDIDA")
        self.st.pending = None
        self.st.save()

    # ---------- envío de una apuesta ----------

    def _place(self, window_start: int, side: str, kind: str, dist: float) -> None:
        stake, note = self.risk.stake(self.st)
        if note:
            log.info("  %s", note)
        if stake <= 0:
            return

        mkt = self.poly.market(window_start)
        if mkt is None:
            log.warning("  No encontré el mercado de la ventana %s; no opero.",
                        datetime.fromtimestamp(window_start, timezone.utc))
            return

        token = mkt.token(side)
        ask = self.poly.best_ask(token)
        if ask is None:
            log.warning("  Sin libro para %s; no opero.", side)
            return
        price, size = ask
        if price > self.cfg.max_entry_price:
            log.info("  SALTADA: %s a %.4f supera max_entry_price %.4f "
                     "(payout %.3f < %.3f). No entro.",
                     side, price, self.cfg.max_entry_price,
                     1 / price, 1 / self.cfg.max_entry_price)
            return
        if size * price < stake:
            log.info("  Profundidad insuficiente: el mejor nivel aguanta %.2f USD, "
                     "necesito %.2f. Recorto.", size * price, stake)
            stake = size * price
            if stake < self.cfg.min_order_usd:
                log.info("  Queda por debajo del mínimo; no opero.")
                return

        log.info("  ENVIANDO %s %s  stake=%.2f  precio<=%.4f  payout=%.3f  dist=%.3f%%",
                 side, kind, stake, self.cfg.max_entry_price, 1 / price, dist)

        ok, oid, fill_px, shares = self.broker.buy(
            token, stake, self.cfg.max_entry_price, self.cfg.order_type)
        if not ok or shares <= 0:
            log.error("  Orden no se llenó. No queda posición abierta.")
            return

        if self.st.step == 0:
            self.st.equity -= stake
            self.st.pot = stake
        self.st.pending = asdict(Pending(
            window_start=window_start, side=side, kind=kind, stake=stake,
            price=fill_px, shares=shares, order_id=oid))
        self.st.last_signal_window = window_start
        self.st.save()
        log.info("  LLENADA a %.4f — %.2f shares. payout real %.3f",
                 fill_px, shares, 1 / fill_px if fill_px else 0)

    # ---------- un tick ----------

    def tick(self) -> None:
        self.ha.ingest(self.feed.last_1m(120))
        self.ha.save(HA_CACHE_FILE)
        if not self.ha.ready():
            log.info("Calentando Heikin Ashi (%d ventanas necesarias)...", HAEngine.WARMUP)
            return

        self._resolve()
        if self.stop:
            return

        reason = self.risk.check(self.st)
        if reason:
            log.error("DETENIDO — %s", reason)
            if "DRAWDOWN" in reason or "kill switch" in reason:
                self.st.halted = True
                self.st.halt_reason = reason
                self.st.save()
                self.stop = True
            return

        now = int(time.time())
        cur_start = (now // WINDOW_SEC) * WINDOW_SEC
        cur_ms = cur_start * 1000
        target = cur_start + WINDOW_SEC          # la ventana que apostaríamos
        secs_left = cur_start + WINDOW_SEC - now
        use_bars = (WINDOW_SEC - self.cfg.advance_sec) // 60

        # La ventana que "acaba de cerrar" es la fuente correcta para la señal
        # al cierre: cur_ms es la ventana EN FORMACIÓN y, por construcción,
        # nunca tiene sus 15 velas de 1m completas mientras secs_left > 0, así
        # que confirmed_flip(cur_ms) jamás detectaba nada. Se usa la última
        # ventana con datos completos en su lugar.
        last_closed = self.ha.last_complete_window()   # unix ms, o None
        close_target = (last_closed // 1000 + WINDOW_SEC) if last_closed is not None else None

        if self.st.pending:
            # Conflicto estructural: la señal anticipada de la ventana siguiente
            # cae antes de conocer el resultado de la apuesta en curso. No se
            # adivina el tamaño; se aplaza al cierre.
            if (self.cfg.use_early and self.cfg.allow_late
                    and self.st.last_signal_window != target):
                prov = self.ha.provisional(cur_ms, use_bars)
                if prov and abs(prov[1]) >= self.cfg.min_dist_pct:
                    self.st.deferred = {"window": target, "side": prov[0],
                                        "dist": prov[1]}
                    self.st.save()
                    log.info("Señal anticipada %s aplazada: hay apuesta sin "
                             "resolver. Se reevalúa al cierre.", prov[0])
            return

        # 1) señal aplazada que ya se puede ejecutar
        if self.st.deferred and self.st.deferred.get("window") == close_target:
            d = self.st.deferred
            self.st.deferred = None
            conf = self.ha.confirmed_flip(last_closed)
            if conf and conf[0] == d["side"]:
                log.info("Señal aplazada CONFIRMADA al cierre: %s", d["side"])
                self._place(close_target, d["side"], "CIE_DIFERIDA", d["dist"])
                return
            log.info("Señal aplazada NO se confirmó al cierre; descartada.")
            self.st.save()

        # 2) entrada anticipada
        if self.cfg.use_early and secs_left <= self.cfg.advance_sec + 30 \
                and self.st.last_signal_window != target:
            prov = self.ha.provisional(cur_ms, use_bars)
            if prov:
                side, dist = prov
                if abs(dist) >= self.cfg.min_dist_pct and self._allowed(side):
                    log.info("SEÑAL ANTICIPADA %s dist=%.3f%% (faltan %ds)",
                             side, dist, secs_left)
                    self._place(target, side, "ANT", dist)
                    return

        # 3) entrada al cierre: se evalúa sobre la ventana que ACABA de cerrar
        # (close_target), no sobre la que sigue en curso.
        if self.cfg.allow_late and close_target is not None \
                and self.st.last_signal_window != close_target \
                and close_target <= now < close_target + WINDOW_SEC:
            conf = self.ha.confirmed_flip(last_closed)
            if conf:
                side, body = conf
                if body >= self.cfg.min_body_pct and self._allowed(side):
                    log.info("SEÑAL AL CIERRE %s cuerpo=%.3f%%", side, body)
                    self._place(close_target, side, "CIE", body)

    def _allowed(self, side: str) -> bool:
        return (side == "UP" and self.cfg.trade_up) or \
               (side == "DOWN" and self.cfg.trade_down)

    # ---------- bucle ----------

    def run(self) -> None:
        self.banner()
        while not self.stop:
            try:
                self.tick()
            except KeyboardInterrupt:
                raise
            except Exception:                                 # noqa: BLE001
                log.exception("Error en el tick; continúo en 20s")
                time.sleep(20)
                continue
            time.sleep(10)
        log.info("Bot detenido. Resumen: %d ganadas / %d perdidas, "
                 "%d ciclos completos, capital %.2f",
                 self.st.n_win, self.st.n_loss, self.st.chains_won, self.st.curve)

    def banner(self) -> None:
        c = self.cfg
        log.info("=" * 62)
        log.info("  polybot — %s", "LIVE (fondos reales)" if self.live else "PAPER (sin órdenes)")
        log.info("  feed=%s/%s  ciclo=x%d  base=%.1f%%  compuesto=%s",
                 c.feed, c.symbol, c.chain_len, c.base_pct, c.compound)
        log.info("  precio máx entrada=%.4f (payout mín %.3f)  tope posición=%.2f",
                 c.max_entry_price, 1 / c.max_entry_price, c.max_stake_usd)
        log.info("  paro drawdown=%.0f%%  límite diario=%.0f%%  máx pérdidas seg=%d",
                 c.stop_drawdown_pct, c.daily_loss_pct, c.max_consec_losses)
        log.info("  capital: inicial=%.2f actual=%.2f  paso=%d/%d",
                 self.st.equity_inicial, self.st.curve, self.st.step, c.chain_len)
        if self.live:
            bal = self.broker.balance_usdc()
            if bal is not None:
                log.info("  saldo USDC en Polymarket: %.2f", bal)
                if bal < self.st.equity * 0.9:
                    log.warning("  El saldo real es menor que el capital del estado. "
                                "Revisa %s antes de seguir.", STATE_FILE)
        log.info("  para detener: Ctrl+C, o crea un archivo llamado %s", KILL_FILE)
        log.info("=" * 62)


# ══════════════════════════════════════════════════════════════════════════
# PROBE
# ══════════════════════════════════════════════════════════════════════════

def cmd_probe(cfg: Config, args: argparse.Namespace) -> int:
    ok = True
    print("\n[1/5] Feed de precio ...")
    try:
        bars = Feed(cfg).last_1m(60)
        print(f"      OK — {len(bars)} velas de 1m. Último cierre {bars[-1].c}")
    except Exception as exc:                                  # noqa: BLE001
        ok = False
        print(f"      FALLO: {exc}")

    print("\n[2/5] Heikin Ashi (calentamiento) ...")
    try:
        ha = HAEngine()
        ha.ingest(Feed(cfg).last_1m(1000))
        keys, hao, hac = ha._ha()
        print(f"      {len(keys)} ventanas de 15m completas "
              f"({'suficiente' if ha.ready() else 'INSUFICIENTE'})")
        if keys:
            print(f"      última: haOpen={hao[-1]:.2f} haClose={hac[-1]:.2f} "
                  f"-> {'VERDE' if hac[-1] > hao[-1] else 'ROJA'}")
        if not ha.ready():
            ok = False
    except Exception as exc:                                  # noqa: BLE001
        ok = False
        print(f"      FALLO: {exc}")

    print("\n[3/5] Gamma: mercado de la ventana siguiente ...")
    poly = Poly()
    nxt = ((int(time.time()) // WINDOW_SEC) + 1) * WINDOW_SEC
    mkt = poly.market(nxt)
    if mkt:
        print(f"      OK — {mkt.slug}")
        print(f"      token UP {mkt.token_up[:22]}...  DOWN {mkt.token_down[:22]}...")
    else:
        ok = False
        print(f"      No hallé el mercado para slug={SLUG_PATTERN.format(ts=nxt)}")
        print("      -> Busca el evento en polymarket.com, copia el slug de la URL")
        print("         y ajusta SLUG_PATTERN en este archivo.")

    print("\n[4/5] Libro de órdenes ...")
    if mkt:
        for side in ("UP", "DOWN"):
            ask = poly.best_ask(mkt.token(side))
            if ask:
                p, s = ask
                verdict = "ENTRARÍA" if p <= cfg.max_entry_price else "SALTARÍA"
                print(f"      {side}: mejor ask {p:.4f} ({s:.0f} shares) "
                      f"payout {1/p:.3f}  -> {verdict}")
            else:
                print(f"      {side}: sin libro")
                ok = False
    else:
        print("      omitido (sin mercado)")

    print("\n[5/5] SDK y credenciales ...")
    if not os.environ.get("POLYMARKET_PRIVATE_KEY"):
        print("      POLYMARKET_PRIVATE_KEY no está en el entorno.")
        print("      Normal si sólo vas a correr paper. Para live es obligatorio.")
    else:
        try:
            br = Broker(live=True)
            print(f"      OK — backend {br.backend}")
            bal = br.balance_usdc()
            print(f"      saldo USDC: {bal:.2f}" if bal is not None
                  else "      no pude leer el saldo (no bloquea el envío de órdenes)")
        except SystemExit as exc:
            ok = False
            print(f"      FALLO: {exc}")
        except Exception as exc:                              # noqa: BLE001
            ok = False
            print(f"      FALLO: {type(exc).__name__}: {exc}")

    print("\n" + "-" * 62)
    if ok:
        print("Probe OK. Siguiente paso:  python polybot.py paper")
    else:
        print("Probe con fallos. Pásame la salida y lo ajusto.")
    return 0 if ok else 1


# ══════════════════════════════════════════════════════════════════════════

def main() -> int:
    ap = argparse.ArgumentParser(description="Bot HA Flip + Parlay para Polymarket 15m")
    ap.add_argument("modo", choices=["probe", "paper", "live"])
    ap.add_argument("--confirmo-live", action="store_true",
                    help="Obligatorio para el modo live: envía órdenes con fondos reales")
    ap.add_argument("--config", default=CONFIG_FILE)
    args = ap.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-7s %(message)s",
        datefmt="%H:%M:%S",
        handlers=[logging.FileHandler(LOG_FILE, encoding="utf-8"),
                  logging.StreamHandler(sys.stdout)])

    cfg = Config.load(args.config)

    if args.modo == "probe":
        return cmd_probe(cfg, args)

    if args.modo == "live" and not args.confirmo_live:
        print("\nEl modo live envía órdenes reales con tu dinero.")
        print("Si es lo que quieres, vuelve a correr con --confirmo-live\n")
        return 2

    if os.path.exists(KILL_FILE):
        print(f"Existe el archivo {KILL_FILE}. Bórralo para poder arrancar.")
        return 2

    bot = Bot(cfg, live=(args.modo == "live"))

    def _sig(_s, _f):
        log.info("Señal de salida recibida; cierro limpio.")
        bot.stop = True
    sigmod.signal(sigmod.SIGINT, _sig)
    sigmod.signal(sigmod.SIGTERM, _sig)

    bot.run()
    return 0


if __name__ == "__main__":
    sys.exit(main())
