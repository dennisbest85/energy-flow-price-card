#!/usr/bin/env python3
"""Minimal bundler for this card (fallback when npm/rollup is not available).

Takes the already-bundled lit library from the top of the original
dist/energy-flow-price-card.js (everything before the card's own code) and
appends the card source files in dependency order with their import/export
statements removed. Output: dist/energy-flow-price-card.js

Normal way (if Node/npm work):  npm install && npm run build
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
LIT_PRELUDE = ROOT / "build" / "lit-prelude.js"
ORDER = [
    "src/constants.js",
    "src/translations.js",
    "src/assets/visual-house.js",
    "src/energy-flow-price-card-editor.js",
    "src/energy-flow-price-card.js",
]


def strip_modules(code: str) -> str:
    # drop import lines (single-line imports only, as used in this project)
    code = re.sub(r'^import[^\n]*;\s*$', "", code, flags=re.M)
    # "export const X" / "export function f" -> plain declarations
    code = re.sub(r'^export\s+(?=(const|let|function|class)\b)', "", code, flags=re.M)
    return code


def main():
    prelude = LIT_PRELUDE.read_text()
    parts = [
        "// lit (BSD-3-Clause, Google LLC) — bundled\n",
        "const { LitElement, html, css, svg, nothing } = (() => {\n",
        prelude,
        "\nreturn { LitElement: i, html: b, css: i$3, svg: w, nothing: A };\n})();\n",
    ]
    for f in ORDER:
        parts.append(f"\n// ---- {f} ----\n")
        parts.append(strip_modules((ROOT / f).read_text()))
    out = ROOT / "dist" / "energy-flow-price-card.js"
    out.write_text("".join(parts))
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
