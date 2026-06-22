#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Actualiza resultados.json automáticamente usando el endpoint público de ESPN.
No necesita API key ni secrets.
"""
import json, re, sys, unicodedata
from datetime import date, datetime, timedelta, timezone
from difflib import SequenceMatcher
from pathlib import Path
from urllib.request import Request, urlopen

RESULTADOS_PATH = Path("resultados.json")
API_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard"
START_DATE = date(2026, 6, 11)
END_DATE = date(2026, 6, 30)
FINAL_STATES = {"post", "final", "complete", "completed"}

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
    return max(SequenceMatcher(None, opt, b).ratio() for opt in options if opt) >= 0.86

def fetch_day(day):
    url = f"{API_URL}?dates={day.strftime('%Y%m%d')}&limit=500"
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def is_final(event):
    comp = (event.get("competitions") or [{}])[0]
    status = comp.get("status") or event.get("status") or {}
    typ = status.get("type") or {}
    return bool(typ.get("completed")) or norm(typ.get("state") or typ.get("name") or typ.get("description")) in FINAL_STATES

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
    try:
        hs, aw = int(home.get("score")), int(away.get("score"))
    except Exception:
        return None
    return {"id": event.get("id"), "home": team_name(home), "away": team_name(away), "home_score": hs, "away_score": aw}

def all_final_events():
    events, day = [], START_DATE
    while day <= END_DATE:
        try:
            payload = fetch_day(day)
            for ev in payload.get("events", []):
                if is_final(ev):
                    parsed = extract_event(ev)
                    if parsed:
                        events.append(parsed)
        except Exception as exc:
            print(f"Advertencia: no pude leer ESPN {day}: {exc}", file=sys.stderr)
        day += timedelta(days=1)
    return events

def main():
    if not RESULTADOS_PATH.exists():
        print("ERROR: no encontré resultados.json en la raíz del repo.", file=sys.stderr)
        sys.exit(1)
    data = json.loads(RESULTADOS_PATH.read_text(encoding="utf-8"))
    fixtures = all_final_events()
    changed = []
    for partido in data.get("partidos", []):
        already_final = partido.get("estado") == "finalizado" and partido.get("golesLocal") is not None and partido.get("golesVisitante") is not None
        if already_final:
            continue
        local, visitante = partido.get("local"), partido.get("visitante")
        match, reversed_match = None, False
        for fx in fixtures:
            if names_match(local, fx["home"]) and names_match(visitante, fx["away"]):
                match = fx; break
            if names_match(local, fx["away"]) and names_match(visitante, fx["home"]):
                match = fx; reversed_match = True; break
        if match:
            gl, gv = (match["away_score"], match["home_score"]) if reversed_match else (match["home_score"], match["away_score"])
            partido["estado"] = "finalizado"
            partido["golesLocal"] = int(gl)
            partido["golesVisitante"] = int(gv)
            partido["espn_id"] = match["id"]
            changed.append(f"{partido['id']}: {local} {gl}-{gv} {visitante}")
    total = len(data.get("partidos", []))
    jugados = sum(1 for p in data.get("partidos", []) if p.get("estado") == "finalizado")
    data.setdefault("_meta", {})
    data["_meta"].update({
        "total_partidos": total,
        "jugados": jugados,
        "pendientes": total - jugados,
        "ultima_actualizacion_auto": datetime.now(timezone.utc).isoformat(),
        "fuente_auto": "ESPN public scoreboard",
    })
    RESULTADOS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if changed:
        print("Partidos actualizados:")
        print("\n".join(changed))
    else:
        print("Sin cambios: no encontré partidos nuevos finalizados.")

if __name__ == "__main__":
    main()
