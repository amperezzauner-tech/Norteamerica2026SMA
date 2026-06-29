#!/usr/bin/env python3
"""Actualiza resultados.json desde el marcador público de ESPN.
No toca predicciones.json ni la lógica de puntajes.

V5: corrige actualización de 16avos usando los IDs reales de ESPN
(matchId 73-88) y deja diagnóstico claro en el log.
"""
from __future__ import annotations

import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path

RESULTADOS = Path("resultados.json")
ESPN_LEAGUE = "fifa.world"
BASE = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{ESPN_LEAGUE}/scoreboard"

# IDs ESPN de 16avos. Estos son los IDs del calendario de eliminatorias,
# distintos a los 760xxx usados en fase de grupos.
ESPN_ID_BY_MATCH_ID = {
    73: "53452545",  # Sudáfrica vs Canadá
    74: "53452557",  # Brasil vs Japón
    75: "53452541",  # Alemania vs Paraguay
    76: "53452547",  # P. Bajos vs Marruecos
    77: "53452561",  # C. de Marfil vs Noruega
    78: "53452543",  # Francia vs Suecia
    79: "53452563",  # México vs Ecuador
    80: "53452565",  # Inglaterra vs Congo
    81: "53452555",  # Bélgica vs Senegal
    82: "53452553",  # EE.UU. vs Bosnia
    83: "53452551",  # España vs Austria
    84: "53452549",  # Portugal vs Croacia
    85: "53452505",  # Suiza vs Argelia
    86: "53452503",  # Australia vs Egipto
    87: "53452569",  # Argentina vs Cabo Verde
    88: "53452507",  # Colombia vs Ghana
}

ALIASES = {
    "ee uu": "estados unidos",
    "eeuu": "estados unidos",
    "eua": "estados unidos",
    "usa": "estados unidos",
    "us": "estados unidos",
    "united states": "estados unidos",
    "estados unidos": "estados unidos",
    "u s a": "estados unidos",
    "p bajos": "paises bajos",
    "paises bajos": "paises bajos",
    "países bajos": "paises bajos",
    "netherlands": "paises bajos",
    "holanda": "paises bajos",
    "n zelanda": "nueva zelanda",
    "nueva zelanda": "nueva zelanda",
    "new zealand": "nueva zelanda",
    "c de marfil": "costa de marfil",
    "costa marfil": "costa de marfil",
    "costa de marfil": "costa de marfil",
    "ivory coast": "costa de marfil",
    "czechia": "chequia",
    "czech republic": "chequia",
    "corea sur": "corea del sur",
    "corea del sur": "corea del sur",
    "south korea": "corea del sur",
    "saudi arabia": "arabia saudita",
    "arabia saudita": "arabia saudita",
    "cape verde": "cabo verde",
    "cabo verde": "cabo verde",
    "uzbekistan": "uzbekistan",
    "uzbekistán": "uzbekistan",
    "turkiye": "turquia",
    "turkey": "turquia",
    "turquia": "turquia",
    "turquía": "turquia",
    "dr congo": "congo",
    "d r congo": "congo",
    "rd congo": "congo",
    "r d congo": "congo",
    "democratic republic of congo": "congo",
    "congo dr": "congo",
    "congo": "congo",
    "bosnia and herzegovina": "bosnia",
    "bosnia y herzegovina": "bosnia",
    "bosnia": "bosnia",
}


def norm(s: str | None) -> str:
    s = s or ""
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = s.lower().replace(".", " ").replace("&", " and ")
    s = re.sub(r"[^a-z0-9ñ]+", " ", s).strip()
    s = re.sub(r"\s+", " ", s)
    return ALIASES.get(s, s)


def fetch_json(url: str) -> dict | None:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as exc:
        print(f"WARN no pude leer {url}: {exc}", file=sys.stderr)
        return None


def espn_event_dates() -> list[str]:
    # Revisa desde ayer hasta 6 días adelante para cubrir toda la ronda de 16avos.
    now = datetime.now(timezone.utc)
    days = [now + timedelta(days=d) for d in range(-1, 7)]
    return [d.strftime("%Y%m%d") for d in days]


def read_events() -> list[dict]:
    events: list[dict] = []
    seen = set()
    for date in espn_event_dates():
        url = BASE + "?" + urllib.parse.urlencode({"dates": date, "limit": 200})
        data = fetch_json(url)
        for ev in (data or {}).get("events", []):
            eid = str(ev.get("id", ""))
            if eid and eid not in seen:
                seen.add(eid)
                events.append(ev)
        time.sleep(0.2)
    return events


def event_teams(ev: dict) -> dict:
    comps = (ev.get("competitions") or [{}])[0].get("competitors") or []
    out = {}
    for c in comps:
        team = c.get("team") or {}
        names = [
            team.get("displayName"),
            team.get("name"),
            team.get("shortDisplayName"),
            team.get("abbreviation"),
        ]
        side = c.get("homeAway")
        raw_score = c.get("score")
        try:
            score = int(raw_score) if raw_score not in (None, "") else 0
        except Exception:
            score = 0
        out[side] = {
            "score": score,
            "winner": c.get("winner"),
            "names": [n for n in names if n],
            "norms": {norm(n) for n in names if n},
        }
    return out


def event_status(ev: dict) -> str:
    st = ((ev.get("status") or {}).get("type") or {})
    if st.get("completed") or st.get("state") == "post":
        return "finalizado"
    if st.get("state") == "in" or st.get("name") in {"STATUS_IN_PROGRESS", "STATUS_HALFTIME"}:
        return "en_vivo"
    return "pendiente"


def match_event(partido: dict, events: list[dict]) -> dict | None:
    # Para 16avos, usa primero el ID oficial por matchId.
    match_id = int(partido.get("matchId") or 0)
    preferred_espn_id = ESPN_ID_BY_MATCH_ID.get(match_id) or str(partido.get("espn_id") or "").strip()

    if preferred_espn_id:
        for ev in events:
            if str(ev.get("id")) == str(preferred_espn_id):
                return ev

    # Fallback por nombres, útil si no hay espn_id o ESPN cambia un ID.
    a, b = norm(partido.get("local")), norm(partido.get("visitante"))
    if not a or not b:
        return None
    for ev in events:
        teams = event_teams(ev)
        norms = set()
        for info in teams.values():
            norms |= info["norms"]
        if a in norms and b in norms:
            return ev
    return None


def apply_event(partido: dict, ev: dict) -> bool:
    status = event_status(ev)
    teams = event_teams(ev)
    local_n = norm(partido.get("local"))
    visit_n = norm(partido.get("visitante"))
    local_score = visitante_score = None

    for info in teams.values():
        if local_n in info["norms"]:
            local_score = info["score"]
        if visit_n in info["norms"]:
            visitante_score = info["score"]

    # Si emparejó por ESPN ID pero los nombres de ESPN todavía salen como TBD,
    # no podemos asignar goles de forma segura por lado.
    if local_score is None or visitante_score is None:
        return False

    changed = False
    if partido.get("estado") != status:
        partido["estado"] = status
        changed = True

    if status in {"finalizado", "en_vivo"}:
        if partido.get("golesLocal") != local_score:
            partido["golesLocal"] = local_score
            changed = True
        if partido.get("golesVisitante") != visitante_score:
            partido["golesVisitante"] = visitante_score
            changed = True

        # Guardar ganador de llaves cuando ESPN lo indique.
        if status == "finalizado" and int(partido.get("matchId") or 0) >= 73:
            winner_name = None
            for info in teams.values():
                if info.get("winner") is True:
                    if local_n in info["norms"]:
                        winner_name = partido.get("local")
                    elif visit_n in info["norms"]:
                        winner_name = partido.get("visitante")
            if winner_name and partido.get("ganador") != winner_name:
                partido["ganador"] = winner_name
                changed = True

            detail = (((ev.get("status") or {}).get("type") or {}).get("detail") or "")
            low_detail = detail.lower()
            forma = None
            if "pen" in low_detail or "penal" in low_detail:
                forma = "penales"
            elif "aet" in low_detail or "extra" in low_detail or "alarg" in low_detail:
                forma = "alargue"
            if forma and partido.get("formaDefinicion") != forma:
                partido["formaDefinicion"] = forma
                changed = True

    # Actualiza espn_id si faltaba o si estaba viejo/incorrecto.
    ev_id = str(ev.get("id") or "")
    if ev_id and partido.get("espn_id") != ev_id:
        partido["espn_id"] = ev_id
        changed = True

    return changed


def main() -> int:
    if not RESULTADOS.exists():
        print("ERROR: no existe resultados.json en la raíz del repo", file=sys.stderr)
        return 1

    data = json.loads(RESULTADOS.read_text(encoding="utf-8"))
    before = deepcopy(data)
    events = read_events()
    print(f"Eventos ESPN encontrados: {len(events)}")

    event_ids = sorted(str(ev.get("id")) for ev in events if ev.get("id"))
    print("IDs ESPN encontrados:", ", ".join(event_ids[:40]))

    updates = []
    matched_no_change = []
    not_found = []

    for p in data.get("partidos", []):
        ev = match_event(p, events)
        if ev:
            old = f"{p.get('golesLocal')}-{p.get('golesVisitante')}"
            if apply_event(p, ev):
                new = f"{p.get('golesLocal')}-{p.get('golesVisitante')}"
                updates.append(
                    f"{p.get('id')} ESPN {ev.get('id')} {p.get('local')} {new} {p.get('visitante')} [{p.get('estado')}] antes={old}"
                )
            else:
                matched_no_change.append(f"{p.get('id')} ESPN {ev.get('id')} {p.get('local')} vs {p.get('visitante')}")
        else:
            # Solo reporta pendientes/en vivo para no llenar el log con partidos viejos.
            if p.get("estado") in {"pendiente", "en_vivo"}:
                not_found.append(f"{p.get('id')} {p.get('local')} vs {p.get('visitante')}")

    meta = data.setdefault("_meta", {})
    partidos = data.get("partidos", [])
    meta["jugados"] = sum(1 for p in partidos if p.get("estado") == "finalizado")
    meta["pendientes"] = sum(1 for p in partidos if p.get("estado") == "pendiente")
    meta["en_vivo"] = sum(1 for p in partidos if p.get("estado") == "en_vivo")

    now_iso = datetime.now(timezone.utc).isoformat()
    meta["ultima_revision_auto"] = now_iso
    if updates:
        meta["ultima_actualizacion_auto"] = now_iso
        meta["fuente_auto"] = "ESPN public scoreboard"
        meta["nota_auto"] = "; ".join(updates[:12])

    if data != before:
        RESULTADOS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Cambios aplicados:")
        for u in updates or ["solo metadatos de revisión"]:
            print(" -", u)
    else:
        print("Sin cambios en resultados.json")

    print(f"Resumen: actualizados={len(updates)} | encontrados_sin_cambio={len(matched_no_change)} | pendientes_no_encontrados={len(not_found)}")
    if not_found[:20]:
        print("Pendientes no encontrados en ESPN:")
        for x in not_found[:20]:
            print(" -", x)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
