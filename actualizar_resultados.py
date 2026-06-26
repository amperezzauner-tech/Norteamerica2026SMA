#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Actualiza resultados.json automáticamente usando el marcador público de ESPN.
No requiere API key.

Protecciones incluidas:
- No permite que un mismo evento de ESPN actualice dos partidos distintos.
- Respeta el orden local/visitante del archivo resultados.json.
- Evita que partidos futuros queden marcados por error por coincidencias difusas.
"""

import json
import re
import sys
import unicodedata
from datetime import date, datetime, timedelta, timezone
from difflib import SequenceMatcher
from pathlib import Path
from urllib.request import Request, urlopen

RESULTADOS_PATH = Path("resultados.json")
API_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard"

# Ventana móvil: alcanza partidos recientes/futuros sin volver a recorrer todo el torneo.
START_DATE = date.today() - timedelta(days=10)
END_DATE = date.today() + timedelta(days=10)

FINAL_STATES = {"post", "final", "complete", "completed"}
LIVE_STATES = {"in", "live", "in progress", "inprogress", "halftime", "half time"}

ALIASES = {
    "mexico": ["mexico", "méxico", "mex"],
    "sudafrica": ["south africa", "rsa", "sudafrica", "sudáfrica"],
    "corea del sur": ["south korea", "korea republic", "kor", "corea del sur"],
    "chequia": ["czechia", "czech republic", "cze", "chequia"],
    "canada": ["canada", "canadá", "can"],
    "bosnia": ["bosnia and herzegovina", "bosnia-herzegovina", "bih", "bosnia"],
    "qatar": ["qatar", "qat"],
    "suiza": ["switzerland", "sui", "suiza"],
    "brasil": ["brazil", "bra", "brasil"],
    "marruecos": ["morocco", "mar", "marruecos"],
    "haiti": ["haiti", "haití", "hti"],
    "escocia": ["scotland", "sco", "escocia"],
    "eeuu": ["united states", "usa", "united states of america", "eeuu", "ee uu"],
    "ee uu": ["united states", "usa", "united states of america", "eeuu", "ee uu", "ee.uu."],
    "paraguay": ["paraguay", "par"],
    "australia": ["australia", "aus"],
    "turquia": ["turkey", "turkiye", "türkiye", "turquia", "turquía"],
    "alemania": ["germany", "ger", "alemania"],
    "curazao": ["curacao", "curaçao", "cuw", "curazao"],
    "c de marfil": ["ivory coast", "côte d’ivoire", "cote d'ivoire", "civ", "c de marfil"],
    "ecuador": ["ecuador", "ecu"],
    "p bajos": ["netherlands", "ned", "holland", "paises bajos", "países bajos", "p bajos"],
    "japon": ["japan", "jpn", "japon", "japón"],
    "suecia": ["sweden", "swe", "suecia"],
    "tunez": ["tunisia", "tun", "tunez", "túnez"],
    "belgica": ["belgium", "bel", "belgica", "bélgica"],
    "egipto": ["egypt", "egy", "egipto"],
    "iran": ["iran", "iri", "irán"],
    "n zelanda": ["new zealand", "nzl", "n zelanda", "nueva zelanda"],
    "espana": ["spain", "esp", "espana", "españa"],
    "cabo verde": ["cape verde", "cpv", "cabo verde"],
    "arabia saudita": ["saudi arabia", "ksa", "arabia saudita"],
    "uruguay": ["uruguay", "uru"],
    "francia": ["france", "fra", "francia"],
    "senegal": ["senegal", "sen"],
    "irak": ["iraq", "irq", "irak"],
    "noruega": ["norway", "nor", "noruega"],
    "argentina": ["argentina", "arg"],
    "argelia": ["algeria", "dza", "argelia"],
    "austria": ["austria", "aut"],
    "jordania": ["jordan", "jor", "jordania"],
    "ghana": ["ghana", "gha"],
    "panama": ["panama", "panamá", "pan"],
    "portugal": ["portugal", "por"],
    "congo": ["dr congo", "congo dr", "democratic republic of congo", "cod", "congo"],
    "inglaterra": ["england", "eng", "inglaterra"],
    "croacia": ["croatia", "cro", "croacia"],
    "uzbekistan": ["uzbekistan", "uzbekistán", "uzb"],
    "colombia": ["colombia", "col"],
}

def norm(value):
    value = str(value or "").strip().lower()
    value = unicodedata.normalize("NFD", value)
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()

def names_match(ours, api_name):
    a, b = norm(ours), norm(api_name)
    if not a or not b:
        return False
    options = [norm(x) for x in ALIASES.get(a, [])] + [a]
    if b in options:
        return True
    if any(opt and (opt == b or opt in b or b in opt) for opt in options):
        return True
    return max(SequenceMatcher(None, opt, b).ratio() for opt in options if opt) >= 0.90

def fetch_day(day):
    url = f"{API_URL}?dates={day.strftime('%Y%m%d')}&limit=500"
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def status_info(event):
    comp = (event.get("competitions") or [{}])[0]
    status = comp.get("status") or event.get("status") or {}
    typ = status.get("type") or {}
    state = norm(typ.get("state") or typ.get("name") or typ.get("description"))
    completed = bool(typ.get("completed"))
    if completed or state in FINAL_STATES:
        return "finalizado"
    if state in LIVE_STATES or str(typ.get("id")) in {"2", "3", "4", "5", "6", "7"}:
        return "en_vivo"
    return "pendiente"

def extract_event(event):
    comp = (event.get("competitions") or [{}])[0]
    competitors = comp.get("competitors") or []
    if len(competitors) < 2:
        return None

    home = next((c for c in competitors if c.get("homeAway") == "home"), competitors[0])
    away = next((c for c in competitors if c.get("homeAway") == "away"), competitors[1])

    def team_name(c):
        t = c.get("team") or {}
        return t.get("displayName") or t.get("shortDisplayName") or t.get("name") or t.get("abbreviation")

    def get_score(c):
        val = c.get("score")
        if val is None or val == "":
            return None
        try:
            return int(val)
        except Exception:
            return None

    return {
        "id": str(event.get("id") or ""),
        "home": team_name(home),
        "away": team_name(away),
        "home_score": get_score(home),
        "away_score": get_score(away),
        "estado": status_info(event),
    }

def all_events():
    events = []
    day = START_DATE
    while day <= END_DATE:
        try:
            payload = fetch_day(day)
            for ev in payload.get("events", []):
                parsed = extract_event(ev)
                if parsed:
                    events.append(parsed)
        except Exception as exc:
            print(f"Advertencia: no pude leer ESPN {day}: {exc}", file=sys.stderr)
        day += timedelta(days=1)
    return events

def find_match(partido, fixtures, used_espn_ids):
    local, visitante = partido.get("local"), partido.get("visitante")
    candidates = []
    for fx in fixtures:
        if fx["id"] in used_espn_ids:
            continue
        direct = names_match(local, fx["home"]) and names_match(visitante, fx["away"])
        reverse = names_match(local, fx["away"]) and names_match(visitante, fx["home"])
        if direct or reverse:
            # Priorizar coincidencia en el mismo orden. La invertida queda solo como respaldo.
            candidates.append((0 if direct else 1, fx, reverse))
    if not candidates:
        return None, False
    candidates.sort(key=lambda x: x[0])
    return candidates[0][1], candidates[0][2]


def aplicar_correcciones_manuales(data):
    """Correcciones confirmadas que no deben depender del matching automático."""
    manuales = {
        "p059": {
            "estado": "finalizado",
            "golesLocal": 3,
            "golesVisitante": 2,
            "espn_id": "66456948",
            "nota_manual": "Corrección manual: Turquía 3-2 EE.UU. (25 junio 2026)",
        }
    }
    cambios = []
    for partido in data.get("partidos", []):
        mid = partido.get("id")
        if mid in manuales:
            antes = {k: partido.get(k) for k in manuales[mid]}
            partido.update(manuales[mid])
            despues = {k: partido.get(k) for k in manuales[mid]}
            if antes != despues:
                cambios.append(f"{mid}: corrección manual aplicada")
    return cambios

def main():
    if not RESULTADOS_PATH.exists():
        print("ERROR: no encontré resultados.json en la raíz del repo.", file=sys.stderr)
        sys.exit(1)

    data = json.loads(RESULTADOS_PATH.read_text(encoding="utf-8"))
    manual_changes = aplicar_correcciones_manuales(data)
    fixtures = all_events()
    print(f"ESPN eventos leídos: {len(fixtures)} | ventana {START_DATE} a {END_DATE}")

    changed = []
    used_espn_ids = set()
    duplicate_skips = []

    for partido in data.get("partidos", []):
        match, reversed_match = find_match(partido, fixtures, used_espn_ids)
        if not match:
            continue

        gl = match["away_score"] if reversed_match else match["home_score"]
        gv = match["home_score"] if reversed_match else match["away_score"]
        estado = match["estado"]

        if estado not in {"finalizado", "en_vivo"}:
            continue
        if gl is None or gv is None:
            continue

        if match["id"] in used_espn_ids:
            duplicate_skips.append(f"{partido.get('id')}: ESPN {match['id']} ya usado")
            continue

        used_espn_ids.add(match["id"])

        updates = {
            "estado": estado,
            "golesLocal": int(gl),
            "golesVisitante": int(gv),
            "espn_id": match["id"],
        }

        before = {k: partido.get(k) for k in updates}
        partido.update(updates)
        after = {k: partido.get(k) for k in updates}

        if before != after:
            changed.append(
                f"{partido['id']}: {partido['local']} {partido['golesLocal']}-{partido['golesVisitante']} {partido['visitante']} ({partido['estado']})"
            )

    manual_changes += aplicar_correcciones_manuales(data)
    changed.extend(manual_changes)

    total = len(data.get("partidos", []))
    jugados = sum(1 for p in data.get("partidos", []) if p.get("estado") == "finalizado")
    en_vivo = sum(1 for p in data.get("partidos", []) if p.get("estado") == "en_vivo")

    data.setdefault("_meta", {})
    data["_meta"].update({
        "total_partidos": total,
        "jugados": jugados,
        "pendientes": total - jugados - en_vivo,
        "en_vivo": en_vivo,
        "ultima_revision_auto": datetime.now(timezone.utc).isoformat(),
        "fuente_auto": "ESPN public scoreboard",
    })

    if changed:
        data["_meta"]["ultima_actualizacion_auto"] = datetime.now(timezone.utc).isoformat()
        RESULTADOS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Partidos actualizados:")
        print("\n".join(changed))
    else:
        print("Sin cambios nuevos de marcador.")
        if duplicate_skips:
            print("Omitidos por protección anti-duplicado:")
            print("\n".join(duplicate_skips))

if __name__ == "__main__":
    main()
