#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Actualiza resultados.json automáticamente usando API-Football / API-SPORTS.

Requisitos:
- Crear en GitHub Secrets: API_FOOTBALL_KEY
- Este script conserva tus IDs internos p001, p002, etc.
- Solo cambia partidos que la API ya marque como finalizados.
"""

import json
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

RESULTADOS_PATH = Path("resultados.json")
API_BASE = "https://v3.football.api-sports.io/fixtures"
LEAGUE_ID = os.getenv("API_FOOTBALL_LEAGUE_ID", "1")
SEASON = os.getenv("API_FOOTBALL_SEASON", "2026")
API_KEY = os.getenv("API_FOOTBALL_KEY")
FINAL_STATUS = {"FT", "AET", "PEN"}

# Alias para resolver español ↔ nombres habituales en API-Football.
ALIASES = {
    "mexico": ["mexico"],
    "sudafrica": ["south africa", "sudafrica"],
    "corea del sur": ["south korea", "korea republic", "corea del sur"],
    "chequia": ["czech republic", "czechia", "chequia"],
    "canada": ["canada"],
    "bosnia": ["bosnia and herzegovina", "bosnia-herzegovina", "bosnia"],
    "qatar": ["qatar"],
    "suiza": ["switzerland", "suiza"],
    "brasil": ["brazil", "brasil"],
    "marruecos": ["morocco", "marruecos"],
    "haiti": ["haiti"],
    "escocia": ["scotland", "escocia"],
    "eeuu": ["usa", "united states", "united states of america", "eeuu", "ee uu"],
    "paraguay": ["paraguay"],
    "australia": ["australia"],
    "turquia": ["turkey", "turkiye", "türkiye", "turquia"],
    "alemania": ["germany", "alemania"],
    "curazao": ["curacao", "curaçao", "curazao"],
    "c de marfil": ["ivory coast", "cote d'ivoire", "côte d’ivoire", "c de marfil"],
    "ecuador": ["ecuador"],
    "p bajos": ["netherlands", "holland", "paises bajos", "p bajos"],
    "japon": ["japan", "japon"],
    "suecia": ["sweden", "suecia"],
    "tunez": ["tunisia", "tunez"],
    "belgica": ["belgium", "belgica"],
    "egipto": ["egypt", "egipto"],
    "iran": ["iran"],
    "n zelanda": ["new zealand", "n zelanda"],
    "espana": ["spain", "espana", "españa"],
    "cabo verde": ["cape verde", "cabo verde"],
    "arabia saudita": ["saudi arabia", "arabia saudita"],
    "uruguay": ["uruguay"],
    "francia": ["france", "francia"],
    "senegal": ["senegal"],
    "irak": ["iraq", "irak"],
    "noruega": ["norway", "noruega"],
    "argentina": ["argentina"],
    "argelia": ["algeria", "argelia"],
    "austria": ["austria"],
    "jordania": ["jordan", "jordania"],
    "ghana": ["ghana"],
    "panama": ["panama", "panamá"],
    "portugal": ["portugal"],
    "congo": ["congo", "dr congo", "democratic republic of congo"],
    "inglaterra": ["england", "inglaterra"],
    "croacia": ["croatia", "croacia"],
    "uzbekistan": ["uzbekistan", "uzbekistán"],
    "colombia": ["colombia"],
}


def norm(value: str) -> str:
    value = str(value or "").strip().lower()
    value = unicodedata.normalize("NFD", value)
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def names_match(ours: str, api_name: str) -> bool:
    a = norm(ours)
    b = norm(api_name)
    if a == b:
        return True
    options = [norm(x) for x in ALIASES.get(a, [])] + [a]
    if b in options:
        return True
    if any(opt and (opt == b or opt in b or b in opt) for opt in options):
        return True
    return max(SequenceMatcher(None, opt, b).ratio() for opt in options if opt) >= 0.86


def fetch_fixtures():
    if not API_KEY:
        print("ERROR: falta el secret API_FOOTBALL_KEY en GitHub.", file=sys.stderr)
        sys.exit(1)
    params = urlencode({"league": LEAGUE_ID, "season": SEASON})
    req = Request(
        f"{API_BASE}?{params}",
        headers={"x-apisports-key": API_KEY, "Accept": "application/json"},
    )
    with urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    if payload.get("errors"):
        print("ERROR API-Football:", payload.get("errors"), file=sys.stderr)
        sys.exit(1)
    return payload.get("response", [])


def fixture_score(fixture):
    goals = fixture.get("goals") or {}
    home = goals.get("home")
    away = goals.get("away")
    if home is None or away is None:
        score = fixture.get("score") or {}
        fulltime = score.get("fulltime") or {}
        home = fulltime.get("home")
        away = fulltime.get("away")
    return home, away


def main():
    data = json.loads(RESULTADOS_PATH.read_text(encoding="utf-8"))
    fixtures = fetch_fixtures()
    final_fixtures = []
    for fx in fixtures:
        status = ((fx.get("fixture") or {}).get("status") or {}).get("short")
        if status in FINAL_STATUS:
            teams = fx.get("teams") or {}
            final_fixtures.append({
                "id": ((fx.get("fixture") or {}).get("id")),
                "home": ((teams.get("home") or {}).get("name")),
                "away": ((teams.get("away") or {}).get("name")),
                "score": fixture_score(fx),
                "status": status,
            })

    changed = []
    for partido in data.get("partidos", []):
        # No tocamos partidos ya finalizados salvo que estén sin goles.
        already_final = partido.get("estado") == "finalizado" and partido.get("golesLocal") is not None and partido.get("golesVisitante") is not None
        if already_final:
            continue
        local, visitante = partido.get("local"), partido.get("visitante")
        match = None
        for fx in final_fixtures:
            if names_match(local, fx["home"]) and names_match(visitante, fx["away"]):
                match = fx
                break
        if match:
            gl, gv = match["score"]
            if gl is not None and gv is not None:
                partido["estado"] = "finalizado"
                partido["golesLocal"] = int(gl)
                partido["golesVisitante"] = int(gv)
                partido["apifootball_id"] = match["id"]
                changed.append(f"{partido['id']}: {local} {gl}-{gv} {visitante}")

    jugados = sum(1 for p in data.get("partidos", []) if p.get("estado") == "finalizado")
    total = len(data.get("partidos", []))
    data.setdefault("_meta", {})["jugados"] = jugados
    data["_meta"]["pendientes"] = total - jugados
    data["_meta"]["total_partidos"] = total
    data["_meta"]["ultima_actualizacion_auto"] = datetime.now(timezone.utc).isoformat()

    RESULTADOS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if changed:
        print("Partidos actualizados:")
        print("\n".join(changed))
    else:
        print("Sin cambios: no encontré partidos nuevos finalizados.")


if __name__ == "__main__":
    main()
