#!/usr/bin/env python3
"""
Parse Czech recipe XLSX files into db.json (stdlib only).
"""
from __future__ import annotations

import json
import re
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

FILE_CATEGORIES = [
    ("Zrcadlové glazury.xlsx", "Zrcadlové glazury"),
    ("Potahování, čokolády.xlsx", "Potahování, čokolády"),
    ("Omáčky s pektinem.xlsx", "Omáčky s pektinem"),
    ("Krémy, šlehačky, créumex.xlsx", "Krémy, šlehačky, créumex"),
    ("Korpusy.xlsx", "Korpusy"),
    ("Karamel.xlsx", "Karamel"),
    ("Dekorování.xlsx", "Dekorování"),
]


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "x"


def col_row(ref: str) -> tuple[str, int]:
    col, row = "", ""
    for c in ref:
        if c.isalpha():
            col += c
        else:
            row += c
    return col, int(row)


def load_shared_strings(z: zipfile.ZipFile) -> list[str]:
    try:
        data = z.read("xl/sharedStrings.xml")
    except KeyError:
        return []
    root = ET.fromstring(data)
    strings: list[str] = []
    for si in root.findall(".//main:si", NS):
        parts: list[str] = []
        for t in si.findall(".//main:t", NS):
            if t.text:
                parts.append(t.text)
        strings.append("".join(parts) if parts else "")
    return strings


def cell_value(c, ss: list[str]) -> Any:
    cell_type = c.attrib.get("t")
    v_el = c.find("main:v", NS)
    is_el = c.find("main:is", NS)
    if cell_type == "s" and v_el is not None and v_el.text is not None:
        return ss[int(v_el.text)]
    if cell_type == "inlineStr" and is_el is not None:
        ts = is_el.findall(".//main:t", NS)
        return "".join(t.text or "" for t in ts)
    if v_el is not None and v_el.text is not None:
        try:
            v = float(v_el.text)
            if v == int(v):
                return int(v)
            return v
        except ValueError:
            return v_el.text
    return None


def read_workbook(path: Path) -> list[tuple[str, list[list[Any]]]]:
    """Return list of (sheet_name, matrix rows) with columns A..max used."""
    with zipfile.ZipFile(path, "r") as z:
        ss = load_shared_strings(z)
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_to_target: dict[str, str] = {}
        for rel in rels.findall(
            "{http://schemas.openxmlformats.org/package/2006/relationships}Relationship"
        ):
            rid_to_target[rel.attrib["Id"]] = rel.attrib["Target"]

        sheets_el = wb.find("main:sheets", NS)
        assert sheets_el is not None
        out: list[tuple[str, list[list[Any]]]] = []

        for sh in sheets_el.findall("main:sheet", NS):
            name = sh.attrib.get("name", "")
            rid = sh.attrib.get(
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            )
            target = rid_to_target[rid]
            if not target.startswith("xl/"):
                target = "xl/" + target.lstrip("/")
            root = ET.fromstring(z.read(target))
            rows_data: list[tuple[int, dict[str, Any]]] = []
            for row in root.findall("main:sheetData/main:row", NS):
                row_idx = int(row.attrib.get("r", 0))
                cells: dict[str, Any] = {}
                for c in row.findall("main:c", NS):
                    ref = c.attrib.get("r", "")
                    col, _ = col_row(ref)
                    cells[col] = cell_value(c, ss)
                rows_data.append((row_idx, cells))

            letters = set()
            for _, cells in rows_data:
                for col in cells:
                    letters.add(col)

            def col_index(col: str) -> int:
                n = 0
                for ch in col:
                    n = n * 26 + (ord(ch.upper()) - 64)
                return n

            idx_to_col = sorted(letters, key=col_index)
            max_r = max(r[0] for r in rows_data)
            row_map = {r: cells for r, cells in rows_data}
            mat: list[list[Any]] = []
            for r in range(1, max_r + 1):
                cells = row_map.get(r, {})
                mat.append([cells.get(c) for c in idx_to_col])
            out.append((name, mat))
        return out


def norm_num(x: Any) -> float | int:
    if isinstance(x, bool):
        return int(x)
    if isinstance(x, int):
        return x
    if isinstance(x, float):
        if abs(x - round(x)) < 1e-9:
            return int(round(x))
        return round(x, 12)
    raise TypeError(f"expected number, got {type(x)}")


def is_ingredient_header(a: Any, b: Any) -> bool:
    if not isinstance(a, str) or not a.strip().startswith("Surovina"):
        return False
    if b is None:
        return True
    if isinstance(b, str) and "Množství" in b:
        return True
    return False


def is_soucet_row(a: Any) -> bool:
    if not isinstance(a, str):
        return False
    s = a.strip().lower()
    return s.startswith("součet") or s.startswith("soucet")


def is_pouziti_row(a: Any) -> bool:
    if not isinstance(a, str):
        return False
    return a.strip().lower().startswith("použití") or a.strip().lower().startswith("pouziti")


def is_meta_label(a: Any) -> bool:
    if not isinstance(a, str):
        return False
    s = a.strip().lower()
    if s.startswith("původní") or s.startswith("puvodni"):
        return True
    if s.startswith("cílové") or s.startswith("cilove"):
        return True
    if s.startswith("koeficient"):
        return True
    if s.startswith("počet ") or s.startswith("pocet "):
        return True
    if s.startswith("celkem"):
        return True
    if s.startswith("suroviny ("):
        return True
    return False


def is_section_title_row(row: list[Any]) -> bool:
    a, b = row[0] if row else None, row[1] if len(row) > 1 else None
    if not isinstance(a, str) or not a.strip():
        return False
    if is_meta_label(a):
        return False
    if a.strip().startswith("Surovina"):
        return False
    if is_pouziti_row(a):
        return False
    if isinstance(b, (int, float)):
        return False
    return True


def header_default_unit(b_hdr: Any) -> str | None:
    if isinstance(b_hdr, str):
        if "(g)" in b_hdr:
            return "g"
        if "(kg)" in b_hdr:
            return "kg"
    return None


def parse_ingredient_block(
    mat: list[list[Any]], header_row_idx: int
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Return ingredients and header info."""
    hdr = mat[header_row_idx]
    has_jednotka = any(
        isinstance(c, str) and "Jednotka" in c for c in hdr if c is not None
    )
    default_u = header_default_unit(hdr[1] if len(hdr) > 1 else None)
    note_idx = None
    for i, c in enumerate(hdr):
        if isinstance(c, str) and "Poznámka" in c:
            note_idx = i
            break

    ingredients: list[dict[str, Any]] = []
    r = header_row_idx + 1
    while r < len(mat):
        row = mat[r]
        a = row[0] if row else None
        if a is None or (isinstance(a, str) and not str(a).strip()):
            break
        if is_soucet_row(a) or is_pouziti_row(a):
            break
        if not isinstance(a, str):
            break
        name = a.strip()
        b = row[1] if len(row) > 1 else None
        if not isinstance(b, (int, float)):
            break
        amount = norm_num(b)
        unit: str
        if has_jednotka:
            c = row[2] if len(row) > 2 else None
            unit = str(c).strip() if isinstance(c, str) else (default_u or "g")
        else:
            unit = default_u or "g"
        ing: dict[str, Any] = {"name": name, "baseAmount": amount, "unit": unit}
        if note_idx is not None and len(row) > note_idx:
            nv = row[note_idx]
            if isinstance(nv, str) and nv.strip():
                ing["note"] = nv.strip()
        ingredients.append(ing)
        r += 1
    return ingredients, {
        "has_jednotka": has_jednotka,
        "default_unit": default_u,
        "note_idx": note_idx,
    }


def component_name_before_header(mat: list[list[Any]], header_row_idx: int) -> str:
    r = header_row_idx - 1
    while r >= 0:
        row = mat[r]
        a = row[0] if row else None
        if a is None or (isinstance(a, str) and not str(a).strip()):
            r -= 1
            continue
        if isinstance(a, str) and a.strip().startswith("Suroviny ("):
            return "Základ"
        if is_section_title_row(row):
            return str(a).strip()
        break
    return "Základ"


def extract_yield(mat: list[list[Any]]) -> tuple[float | None, str | None]:
    for row in mat:
        a = row[0] if row else None
        if not isinstance(a, str):
            continue
        if "Původní netto (g)" in a or "Původní netto(g)" in a.replace(" ", ""):
            b = row[1] if len(row) > 1 else None
            if isinstance(b, (int, float)):
                return norm_num(b), "g"
        if "Původní počet (ks)" in a or (
            "Původní počet" in a and "ks" in a.lower()
        ):
            b = row[1] if len(row) > 1 else None
            if isinstance(b, (int, float)):
                return norm_num(b), "ks"
        if "Původní netto (kg)" in a:
            b = row[1] if len(row) > 1 else None
            if isinstance(b, (int, float)):
                return norm_num(b), "kg"
    for row in mat:
        a = row[0] if row else None
        if isinstance(a, str) and "Celkem těsta" in a:
            b = row[1] if len(row) > 1 else None
            if isinstance(b, (int, float)):
                return norm_num(b), "g"
    return None, None


def extract_note(mat: list[list[Any]]) -> str | None:
    parts: list[str] = []
    if len(mat) >= 4:
        r4 = mat[3]
        for cell in r4[3:]:
            if isinstance(cell, str):
                c = cell.strip()
                if c and c.lower() != "poznámka":
                    parts.append(c)
                    break
    for row in mat:
        a = row[0] if row else None
        if isinstance(a, str) and "Počet věnečků" in a:
            b = row[1] if len(row) > 1 else None
            if isinstance(b, (int, float)):
                parts.append(f"{a.strip()}: {norm_num(b)}")
        if isinstance(a, str) and "Počet větrníků" in a:
            b = row[1] if len(row) > 1 else None
            if isinstance(b, (int, float)):
                parts.append(f"{a.strip()}: {norm_num(b)}")
    if not parts:
        return None
    return "; ".join(parts)


def sheet_to_recipe(category: str, sheet_name: str, mat: list[list[Any]]) -> dict[str, Any] | None:
    if not mat or not mat[0]:
        return None
    title = mat[0][0]
    name = sheet_name
    if isinstance(title, str) and title.strip():
        name = title.strip()

    header_indices = []
    for i, row in enumerate(mat):
        a = row[0] if row else None
        b = row[1] if len(row) > 1 else None
        if is_ingredient_header(a, b):
            header_indices.append(i)

    if not header_indices:
        return None

    components: list[dict[str, Any]] = []
    used_names: dict[str, int] = {}

    for hi in header_indices:
        ings, _ = parse_ingredient_block(mat, hi)
        if not ings:
            continue
        comp_name = component_name_before_header(mat, hi)
        suffix = used_names.get(comp_name, 0)
        used_names[comp_name] = suffix + 1
        if suffix:
            comp_name_display = f"{comp_name} ({suffix + 1})"
        else:
            comp_name_display = comp_name
        cid = slug(comp_name_display)
        components.append(
            {
                "id": cid,
                "name": comp_name_display,
                "ingredients": ings,
            }
        )

    if not components:
        return None

    base_yield, yield_unit = extract_yield(mat)
    if base_yield is None or yield_unit is None:
        return None

    note = extract_note(mat)
    cat_slug = slug(category)
    rid = f"{cat_slug}-{slug(sheet_name)}"

    return {
        "id": rid,
        "name": name,
        "category": category,
        "baseYield": base_yield,
        "yieldUnit": yield_unit,
        **({"note": note} if note else {}),
        "components": components,
    }


def main() -> None:
    base = Path("/Users/tomasbrand/Desktop/Přepočty")
    recipes: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for fname, category in FILE_CATEGORIES:
        path = base / fname
        if not path.exists():
            raise SystemExit(f"Missing file: {path}")
        for sheet_name, mat in read_workbook(path):
            rec = sheet_to_recipe(category, sheet_name, mat)
            if rec is None:
                continue
            rid = rec["id"]
            if rid in seen_ids:
                rec["id"] = f"{rid}-dup"
                rid = rec["id"]
            seen_ids.add(rid)
            recipes.append(rec)

    out_path = Path(__file__).resolve().parent / "db.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Wrote {len(recipes)} recipes to {out_path}")


if __name__ == "__main__":
    main()
