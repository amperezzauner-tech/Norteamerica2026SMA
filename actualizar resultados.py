#!/usr/bin/env python3
"""Actualiza resultados.json desde el marcador público de ESPN.
No toca predicciones.json ni la lógica de puntajes.
Versión robusta: cruza por espn_id o por nombres normalizados y registra diagnóstico.
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

ALIASES = {
    # Estados Unidos
    "ee uu": "estados unidos", "eeuu": "estados unidos", "eua": "estados unidos",
    "usa": "estados unidos", "us": "estados unidos", "u s a": "estados unidos",
    "united states": "estados unidos", "estados unidos": "estados unidos",
    # Países Bajos
    "p bajos": "paises bajos", "paises bajos": "paises bajos", "países bajos": "paises bajos",
    "holanda": "paises bajos", "netherlands": "paises bajos", "ned": "paises bajos",
    # Nueva Zelanda
    "n zelanda": "nueva zelanda", "new zealand": "nueva zelanda", "nueva zelanda": "nueva zelanda", "nzl": "nueva zelanda",
    # Costa de Marfil
    "c de marfil": "costa de marfil", "costa marfil": "costa de marfil", "costa de marfil": "costa de marfil",
    "ivory coast": "costa de marfil", "civ": "costa de marfil",
    # Nombres frecuentes EN/abreviaturas
    "mexico": "mexico", "mex": "mexico",
    "south africa": "sudafrica", "rsa": "sudafrica", "sudafrica": "sudafrica",
    "south korea": "corea del sur", "korea republic": "corea del sur", "kor": "corea del sur", "corea sur": "corea del sur", "corea del sur": "corea del sur",
    "czechia": "chequia", "czech republic": "chequia", "cze": "chequia", "chequia": "chequia",
    "canada": "canada", "can": "canada",
    "bosnia": "bosnia", "bosnia and herzegovina": "bosnia", "bosnia y herzegovina": "bosnia", "bih": "bosnia",
    "qatar": "qatar", "qat": "qatar",
    "switzerland": "suiza", "sui": "suiza", "suiza": "suiza",
    "brazil": "brasil", "bra": "brasil", "brasil": "brasil",
    "morocco": "marruecos", "mar": "marruecos", "marruecos": "marruecos",
    "haiti": "haiti", "hti": "haiti",
    "scotland": "escocia", "sco": "escocia", "escocia": "escocia",
    "australia": "australia", "aus": "australia",
    "turkiye": "turquia", "turkey": "turquia", "tur": "turquia", "turquia": "turquia",
    "paraguay": "paraguay", "par": "paraguay",
    "germany": "alemania", "ger": "alemania", "alemania": "alemania",
    "curacao": "curazao", "cuw": "curazao", "curazao": "curazao",
    "ecuador": "ecuador", "ecu": "ecuador",
    "japan": "japon", "jpn": "japon", "japon": "japon",
    "sweden": "suecia", "swe": "suecia", "suecia": "suecia",
    "tunisia": "tunez", "tun": "tunez", "tunez": "tunez",
    "belgium": "belgica", "bel": "belgica", "belgica": "belgica",
    "egypt": "egipto", "egy": "egipto", "egipto": "egipto",
    "iran": "iran", "irn": "iran",
    "spain": "espana", "esp": "espana", "espana": "espana",
    "cape verde": "cabo verde", "cpv": "cabo verde", "cabo verde": "cabo verde",
    "saudi arabia": "arabia saudita", "ksa": "arabia saudita", "arabia saudita": "arabia saudita",
    "uruguay": "uruguay", "uru": "uruguay",
    "france": "francia", "fra": "francia", "francia": "francia",
    "senegal": "senegal", "sen": "senegal",
    "iraq": "irak", "irq": "irak", "irak": "irak",
    "norway": "noruega", "nor": "noruega", "noruega": "noruega",
    "argentina": "argentina", "arg": "argentina",
    "algeria": "argelia", "dza": "argelia", "argelia": "argelia",
    "austria": "austria", "aut": "austria",
    "jordan": "jordania", "jor": "jordania", "jordania": "jordania",
    "portugal": "portugal", "por": "portugal",
    "congo": "congo", "dr congo": "congo", "rd congo": "congo", "cod": "congo",
    "uzbekistan": "uzbekistan", "uzbekistán": "uzbekistan", "uzb": "uzbekistan",
    "colombia": "colombia", "col": "colombia",
    "ghana": "ghana", "gha": "ghana",
    "panama": "panama", "pan": "panama",
    "england": "inglaterra", "eng": "inglaterra", "inglaterra": "inglaterra",
    "croatia": "croacia", "cro": "croacia", "croacia": "croacia",
}

# IDs ESPN conocidos para 16avos cuando ESPN usa IDs de bracket 5345xxxx.
# No pasa nada si el ID cambia: también intenta cruzar por nombres.
ESPN_IDS_MANUALES = {
    "p073": "53452545",  # Sudáfrica vs Canadá
    "p074": "53452557",  # Brasil vs Japón
    "p075": "53452541",  # Alemania vs Paraguay/3rd slot
    "p076": "53452547",  # Países Bajos vs Marruecos
    "p079": "53452563",  # México vs Ecuador
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
    now = datetime.now(timezone.utc)
    days = [now + timedelta(days=d) for d in range(-2, 4)]
    return [d.strftime("%Y%m%d") for d in days]


def read_events() -> list[dict]:
    events: list[dict] = []
    seen = set()
    for date in espn_event_dates():
        url = BASE + "?" + urllib.parse.urlencode({"dates": date, "limit": 300})
        data = fetch_json(url)
        for ev in (data or {}).get("events", []):
            eid = str(ev.get("id", ""))
            if eid and eid not in seen:
                seen.add(eid)
                events.append(ev)
        time.sleep(0.2)
    return events


def regulation_score(competitor: dict, fallback: int) -> int:
    """Suma solo los períodos de tiempo reglamentario (los dos primeros
    linescores = 1er y 2do tiempo), ignorando los períodos de prórroga
    que ESPN agrega como linescores adicionales (3ro/4to) cuando el
    partido se define en tiempo extra. Los penales nunca están en
    linescores como goles, así que no afectan esto."""
    linescores = competitor.get("linescores") or []
    if len(linescores) >= 2:
        try:
            total = 0
            for period in linescores[:2]:
                val = period.get("value")
                total += int(val) if val is not None else 0
            return total
        except Exception:
            return fallback
    return fallback


def event_teams(ev: dict) -> dict:
    comps = (ev.get("competitions") or [{}])[0].get("competitors") or []
    out = {}
    for c in comps:
        team = c.get("team") or {}
        names = [team.get("displayName"), team.get("name"), team.get("shortDisplayName"), team.get("abbreviation")]
        side = c.get("homeAway") or str(len(out))
        score_raw = c.get("score")
        try:
            score_full = int(score_raw or 0)
        except Exception:
            score_full = 0
        score_90 = regulation_score(c, score_full)
        out[side] = {
            "score": score_90,
            "score_full": score_full,
            "winner": c.get("winner"),
            "names": [n for n in names if n],
            "norms": {norm(n) for n in names if n},
        }
    return out


def event_status(ev: dict) -> str:
    st = ((ev.get("status") or {}).get("type") or {})
    name = str(st.get("name") or "").upper()
    state = str(st.get("state") or "").lower()
    detail = str(st.get("detail") or "").lower()
    desc = str(st.get("description") or "").lower()
    if st.get("completed") or state == "post" or name in {"STATUS_FINAL", "STATUS_FULL_TIME", "STATUS_FINAL_PEN", "STATUS_FINAL_AET"}:
        return "finalizado"
    if "final" in detail or "full" in detail or "final" in desc:
        return "finalizado"
    if state == "in" or name in {"STATUS_IN_PROGRESS", "STATUS_HALFTIME", "STATUS_EXTRA_TIME", "STATUS_PENALTY_SHOOTOUT"}:
        return "en_vivo"
    return "pendiente"


def match_event(partido: dict, events: list[dict]) -> dict | None:
    candidate_ids = []
    if partido.get("espn_id"):
        candidate_ids.append(str(partido.get("espn_id")).strip())
    if partido.get("id") in ESPN_IDS_MANUALES:
        candidate_ids.append(ESPN_IDS_MANUALES[partido.get("id")])
    for wanted in candidate_ids:
        for ev in events:
            if str(ev.get("id")) == wanted:
                return ev

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
    if local_score is None or visitante_score is None:
        print(f"WARN sin score cruzado para {partido.get('id')} {partido.get('local')} vs {partido.get('visitante')} | ESPN {ev.get('id')} {[(v['names'], v['score']) for v in teams.values()]}")
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
            detail = str((((ev.get("status") or {}).get("type") or {}).get("detail") or "")).lower()
            forma = None
            if "pen" in detail or "penal" in detail:
                forma = "penales"
            elif "aet" in detail or "extra" in detail or "alarg" in detail:
                forma = "alargue"
            if forma and partido.get("formaDefinicion") != forma:
                partido["formaDefinicion"] = forma
                changed = True
    if ev.get("id") and partido.get("espn_id") != str(ev.get("id")):
        partido["espn_id"] = str(ev.get("id"))
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

    updates = []
    encontrados_sin_cambio = 0
    pendientes_no_encontrados = []
    for p in data.get("partidos", []):
        ev = match_event(p, events)
        if ev:
            if apply_event(p, ev):
                updates.append(f"{p.get('id')} {p.get('local')} {p.get('golesLocal')}-{p.get('golesVisitante')} {p.get('visitante')} [{p.get('estado')}] ESPN:{ev.get('id')}")
            else:
                encontrados_sin_cambio += 1
        elif p.get("estado") != "finalizado":
            pendientes_no_encontrados.append(f"{p.get('id')} {p.get('local')} vs {p.get('visitante')}")

    meta = data.setdefault("_meta", {})
    partidos = data.get("partidos", [])
    meta["jugados"] = sum(1 for p in partidos if p.get("estado") == "finalizado")
    meta["pendientes"] = sum(1 for p in partidos if p.get("estado") == "pendiente")
    meta["en_vivo"] = sum(1 for p in partidos if p.get("estado") == "en_vivo")
    now_iso = datetime.now(timezone.utc).isoformat()
    meta["ultima_revision_auto"] = now_iso
    meta["fuente_auto"] = "ESPN public scoreboard"
    meta["diagnostico_auto"] = f"actualizados={len(updates)}; encontrados_sin_cambio={encontrados_sin_cambio}; pendientes_no_encontrados={len(pendientes_no_encontrados)}"
    if updates:
        meta["ultima_actualizacion_auto"] = now_iso
        meta["nota_auto"] = "; ".join(updates[:12])
    elif pendientes_no_encontrados:
        meta["nota_auto"] = "Pendientes no encontrados: " + "; ".join(pendientes_no_encontrados[:8])

    if data != before:
        RESULTADOS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Cambios aplicados:")
        for u in updates or ["solo metadatos/diagnóstico de revisión"]:
            print(" -", u)
    else:
        print("Sin cambios en resultados.json")

    print(meta["diagnostico_auto"])
    if pendientes_no_encontrados[:12]:
        print("Pendientes no encontrados:")
        for x in pendientes_no_encontrados[:12]:
            print(" -", x)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
