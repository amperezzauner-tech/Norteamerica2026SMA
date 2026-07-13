#!/usr/bin/env python3
"""Protege marcadores reglamentarios conocidos después de actualizar desde ESPN.

La polla se califica con el marcador a los 90 minutos. ESPN puede devolver el
resultado final después del alargue cuando no incluye un desglose utilizable
por períodos. Este script restaura los marcadores reglamentarios confirmados,
sin alterar el equipo clasificado ni la construcción de la llave.
"""
from __future__ import annotations

import json
from pathlib import Path

RESULTADOS = Path("resultados.json")

OVERRIDES_90_MIN = {
    "p099": {
        "golesLocal": 1,
        "golesVisitante": 1,
        "golesLocalFinal": 1,
        "golesVisitanteFinal": 2,
        "ganador": "Inglaterra",
        "clasificado": "Inglaterra",
        "bloqueo_manual": True,
        "formaDefinicion": "alargue",
    },
    "p100": {
        "golesLocal": 1,
        "golesVisitante": 1,
        "golesLocalFinal": 3,
        "golesVisitanteFinal": 1,
        "ganador": "Argentina",
        "clasificado": "Argentina",
        "bloqueo_manual": True,
        "formaDefinicion": "alargue",
    },
}


def main() -> int:
    if not RESULTADOS.exists():
        raise SystemExit("ERROR: no existe resultados.json")

    data = json.loads(RESULTADOS.read_text(encoding="utf-8"))
    changed = []
    found = set()

    for partido in data.get("partidos", []):
        pid = partido.get("id")
        override = OVERRIDES_90_MIN.get(pid)
        if not override:
            continue
        found.add(pid)

        before = {key: partido.get(key) for key in override}
        partido.update(override)
        after = {key: partido.get(key) for key in override}
        if before != after:
            changed.append(pid)

    missing = set(OVERRIDES_90_MIN) - found
    if missing:
        raise SystemExit(
            "ERROR: faltan partidos protegidos en resultados.json: "
            + ", ".join(sorted(missing))
        )

    meta = data.setdefault("_meta", {})
    meta["nota_correccion_90min"] = (
        "p099 Noruega-Inglaterra y p100 Argentina-Suiza se califican 1-1 "
        "a 90 minutos; clasifican Inglaterra y Argentina por alargue."
    )

    RESULTADOS.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    if changed:
        print("Marcadores reglamentarios restaurados:", ", ".join(changed))
    else:
        print("Marcadores reglamentarios ya estaban protegidos.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
