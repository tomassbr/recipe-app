/**
 * One-off import of recipes from Tabulky/*.xlsx into db.json + seed SQL.
 *
 * Usage: npx tsx scripts/import-xlsx.ts
 *
 * Outputs:
 *  - db.json (existing recipes + newly imported ones appended)
 *  - supabase/seed_recipes_import.sql (INSERTs for new recipes only)
 *
 * Existing recipes (matched by normalized name + category) are never touched;
 * differences against the xlsx source are only logged for manual review.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";
import { parseRecipeDatabase } from "../src/utils/recipeDb";
import type { Ingredient, Recipe } from "../src/types/recipe";

const ROOT = path.resolve(__dirname, "..");
const TABULKY_DIR = path.join(ROOT, "Tabulky");
const DB_JSON = path.join(ROOT, "db.json");
const SEED_SQL = path.join(ROOT, "supabase", "seed_recipes_import.sql");

/** filename (without .xlsx) → app category */
const CATEGORY_MAP: Record<string, string> = {
  "Tartaletky přepočet": "Tartaletky",
  "Makronky náplně 2026": "Makronky náplně",
};

const EXACT_ROUNDING_RE = /pektin|agar|zelatin|gelatin|vanilk\w*\s+lusk/;

/** Sheets that duplicate an existing recipe under a slightly different title. */
const SKIP_SHEETS: Record<string, string> = {
  "Potahování - Callebaut Gold":
    'duplicate of existing "Potahování – Callebaut Gold (měkkší)" (identical amounts, title adds "VEJCE")',
};

type Row = (string | number | undefined)[];

function deaccent(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normName(s: string): string {
  return deaccent(s).toLowerCase().replace(/\s+/g, " ").trim();
}

function slugify(s: string): string {
  return deaccent(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) {
    // kill float noise from xlsx (1.4999999999999999E-2 → 0.015)
    return Math.round(v * 1e6) / 1e6;
  }
  return undefined;
}

function cellStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
}

/** Strip spreadsheet-mechanics suffixes from a recipe title. */
function cleanTitle(title: string): string {
  return title
    .replace(/\s*[–-]\s*přepoč(et|tová)[^)]*(\)|$)/i, "")
    .replace(/\s+$/, "")
    .trim();
}

interface ParsedRecipe extends Omit<Recipe, "id"> {
  sheetName: string;
  file: string;
}

const log: string[] = [];
function note(msg: string) {
  log.push(msg);
  console.log(msg);
}

function findRow(rows: Row[], prefix: string): Row | undefined {
  return rows.find((r) => cellStr(r[0]).startsWith(prefix));
}

function parseSheet(
  file: string,
  category: string,
  sheetName: string,
  rows: Row[]
): ParsedRecipe | null {
  const title = cellStr(rows[0]?.[0]) || sheetName;

  if (/nepouzivame/.test(normName(sheetName)) || /nepouzivame/.test(normName(title))) {
    note(`SKIP (nepoužíváme): ${file} / ${sheetName}`);
    return null;
  }
  if (SKIP_SHEETS[sheetName]) {
    note(`SKIP: ${file} / ${sheetName} — ${SKIP_SHEETS[sheetName]}`);
    return null;
  }

  // ── ingredient header row ────────────────────────────────────────────────
  const headerIdx = rows.findIndex((r) => cellStr(r[0]) === "Surovina");
  if (headerIdx === -1) {
    note(`SKIP (no Surovina header): ${file} / ${sheetName}`);
    return null;
  }
  const header = rows[headerIdx].map(cellStr);

  let amountCol = 1;
  let unitCol = -1;
  let fixedUnit: string | undefined;
  let prepocetCol = -1;
  let ingNoteCol = -1;

  if (header[1] === "Jednotka") {
    // ["Surovina","Jednotka","Základ","Přepočet"] (Buflery)
    unitCol = 1;
    amountCol = 2;
    prepocetCol = 3;
  } else {
    amountCol = 1;
    unitCol = header.indexOf("Jednotka");
    prepocetCol = header.findIndex((h) => h.startsWith("Přepočt") || h.startsWith("Přepočet"));
    ingNoteCol = header.indexOf("Poznámka");
    if (unitCol === -1) {
      // unit implied by amount-column header, e.g. "Referenční dávka (g)", "Referenční (kg)"
      const m = header[amountCol].match(/\((g|kg|ks)\)/);
      fixedUnit = m ? m[1] : "g";
    }
  }

  // ── ingredients (single component; multi-component sheets already exist) ─
  const ingredients: Ingredient[] = [];
  const trailingNotes: string[] = [];
  let ringSumG = 0;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const name = cellStr(r[0]);
    const restText = r
      .slice(1)
      .map(cellStr)
      .filter((s) => s.length > 1)
      .join(" ");

    if (/^(Součet|Použití)/.test(name)) continue;
    const amount = cleanNumber(r[amountCol]);
    // note-label rows ("Poznámka:", "Pečení:", "Základ: 1 plech…") never carry a
    // numeric amount — a row WITH an amount is always an ingredient (e.g. the
    // ingredient "Základní žloutkový krém" must not be mistaken for a label)
    if (amount === undefined && /^(Poznámka|Forma|Pečení|Základ|Dávkování|Brutto)/.test(name)) {
      const label = name.replace(/:$/, "");
      const inline = cellStr(r[1]);
      const value = inline || cellStr(rows[i + 1]?.[0]);
      if (!inline && value) i++; // value lives on the following line — consume it
      if (value) {
        trailingNotes.push(name.startsWith("Poznámka") ? value : `${label}: ${value}`);
      }
      continue;
    }
    if (!name) continue;
    if (name === "Surovina") continue; // second component header — should not happen for new sheets
    if (name.length <= 2 && amount === undefined) continue; // junk like "Ø"
    if (amount === undefined) {
      // free-text line after ingredients (e.g. "1 porce 116 g buchtiček", "160 °C, 10 minut")
      if (ingredients.length > 0 && !restText) trailingNotes.push(name);
      continue;
    }

    let unit = unitCol >= 0 ? cellStr(r[unitCol]) : fixedUnit ?? "g";
    let ingNote: string | undefined;
    const unitMatch = unit.match(/^(g|kg|ks)\s*\((.+)\)$/); // "g (2 ks)"
    if (unitMatch) {
      unit = unitMatch[1];
      ingNote = unitMatch[2];
    }
    if (!["g", "kg", "ks"].includes(unit)) {
      note(`WARN unit "${unit}" → "g": ${file} / ${sheetName} / ${name}`);
      unit = "g";
    }

    if (ingNoteCol >= 0) {
      const cellNote = cellStr(r[ingNoteCol]);
      if (cellNote && /zaokrouhl/i.test(cellNote)) {
        note(`DROP ingredient note (obsolete rounding warning): ${sheetName} / ${name}: "${cellNote}"`);
      } else if (cellNote) {
        ingNote = ingNote ? `${ingNote}; ${cellNote}` : cellNote;
      }
    }

    const ing: Ingredient = { name, baseAmount: amount, unit };
    if (ingNote) ing.note = ingNote;
    if (EXACT_ROUNDING_RE.test(normName(name))) {
      ing.rounding = "exact";
      note(`EXACT flag: ${sheetName} / ${name}`);
    }
    ingredients.push(ing);
    if (unit === "g") ringSumG += amount;
    else if (unit === "kg") ringSumG += amount * 1000;
  }

  if (ingredients.length === 0) {
    note(`SKIP (no ingredients): ${file} / ${sheetName}`);
    return null;
  }

  // ── yield detection ──────────────────────────────────────────────────────
  const pre = rows.slice(0, headerIdx);
  let baseYield: number | undefined;
  let yieldUnit: Recipe["yieldUnit"] = "g";
  let name = cleanTitle(title);
  const recipeNotes: string[] = [];

  const grab = (prefix: string) => cleanNumber(findRow(pre, prefix)?.[1]);

  const ringRow = findRow(pre, "Referenční průměr");
  if (ringRow) {
    // ring-size calculator (quadratic scaling — imported as reference batch)
    const d = cleanNumber(ringRow[1]);
    const h = cleanNumber(findRow(pre, "Referenční výška")?.[1]);
    baseYield = Math.round(ringSumG * 10) / 10;
    yieldUnit = "g";
    recipeNotes.push(`Referenční ráfek Ø ${d} cm, výška ${h} cm`);
    if (title.startsWith("Kalkulačka")) {
      const after = title.split(/[–-]/).slice(1).join("–").trim();
      name = after || `${sheetName} korpus`;
    }
    note(`RING calculator imported as fixed batch (${baseYield} g): ${sheetName} — future feature: quadratic Ø scaling`);
  } else if (grab("Původní netto (g)") !== undefined) {
    baseYield = grab("Původní netto (g)");
    yieldUnit = "g";
  } else if (grab("Původní počet (ks)") !== undefined) {
    baseYield = grab("Původní počet (ks)");
    yieldUnit = "ks";
  } else if (grab("Referenční netto po upečení") !== undefined) {
    baseYield = grab("Referenční netto po upečení");
    yieldUnit = "kg";
  } else if (grab("Referenční výtěžnost") !== undefined) {
    baseYield = grab("Referenční výtěžnost");
    yieldUnit = "ks";
  } else if (grab("Referenční počet") !== undefined) {
    baseYield = grab("Referenční počet");
    yieldUnit = "ks";
  } else if (findRow(pre, "Počet plátů")) {
    baseYield = 1;
    yieldUnit = "ks";
    recipeNotes.push("Základ pro 1 plát");
  } else {
    // derived: only "Cílové netto/množství" present — base = cílové / koeficient,
    // koeficient reconstructed from first ingredient (přepočet ÷ základ)
    const target =
      grab("Cílové netto") ?? grab("Cílové množství");
    const firstIng = rows[headerIdx + 1];
    const zaklad = cleanNumber(firstIng?.[amountCol]);
    const prep = prepocetCol >= 0 ? cleanNumber(firstIng?.[prepocetCol]) : undefined;
    if (target !== undefined && zaklad && prep !== undefined && prep > 0) {
      const koef = prep / zaklad;
      baseYield = Math.round(target / koef);
      yieldUnit = "g";
      note(`DERIVED baseYield ${baseYield} g (cílové ${target} ÷ koef ${koef.toFixed(4)}): ${sheetName}`);
    } else {
      note(`SKIP (cannot determine yield): ${file} / ${sheetName}`);
      return null;
    }
  }

  if (baseYield === undefined || !(baseYield > 0)) {
    note(`SKIP (invalid yield): ${file} / ${sheetName}`);
    return null;
  }

  // inline note next to "Cílové netto"/"Původní netto" row (cell index 3)
  for (const prefix of ["Cílové netto", "Cílové množství", "Původní netto", "Původní počet"]) {
    const r = findRow(pre, prefix);
    // when both cells 3 and 4 hold text, cell 3 is a stale template leftover — keep the last one
    const s = cellStr(r?.[4]) || cellStr(r?.[3]);
    if (s && s !== "Poznámka" && !recipeNotes.includes(s)) recipeNotes.push(s);
  }
  for (const t of trailingNotes) if (!recipeNotes.includes(t)) recipeNotes.push(t);

  const recipe: ParsedRecipe = {
    sheetName,
    file,
    name,
    category,
    baseYield,
    yieldUnit,
    components: [{ id: "zaklad", name: "Základ", ingredients }],
  };
  const noteStr = recipeNotes.join("; ").trim();
  if (noteStr) recipe.note = noteStr;
  return recipe;
}

// ── main ───────────────────────────────────────────────────────────────────

const existing = parseRecipeDatabase(JSON.parse(fs.readFileSync(DB_JSON, "utf8")));
// dedupe key: category + title with spreadsheet suffixes stripped from BOTH sides
const dedupeKey = (category: string, name: string) =>
  `${normName(category)}|${normName(cleanTitle(name))}`;
const existingKeys = new Set(existing.map((r) => dedupeKey(r.category, r.name)));
const existingIds = new Set(existing.map((r) => r.id));

const files = fs
  .readdirSync(TABULKY_DIR)
  .filter((f) => f.endsWith(".xlsx") && !f.startsWith("~"))
  .sort();

const imported: Recipe[] = [];

for (const file of files) {
  // macOS filenames are NFD — normalize so category strings match existing db entries
  const base = file.replace(/\.xlsx$/, "").normalize("NFC");
  const category = CATEGORY_MAP[base] ?? base;
  const wb = XLSX.read(fs.readFileSync(path.join(TABULKY_DIR, file)), { type: "buffer" });
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<Row>(wb.Sheets[sheetName], {
      header: 1,
      raw: true,
      defval: undefined,
    });
    const parsed = parseSheet(file, category, sheetName, rows);
    if (!parsed) continue;

    const key = dedupeKey(parsed.category, parsed.name);
    const sheetKey = dedupeKey(parsed.category, sheetName);
    if (existingKeys.has(key) || existingKeys.has(sheetKey)) {
      note(`EXISTS, skipping: ${parsed.category} / ${parsed.name}`);
      continue;
    }

    let id = `${slugify(parsed.category)}-${slugify(parsed.name)}`;
    while (existingIds.has(id)) id = `${id}-2`;
    existingIds.add(id);
    existingKeys.add(key);

    const { sheetName: _s, file: _f, ...rest } = parsed;
    imported.push({ id, ...rest });
  }
}

note(`\n=== ${imported.length} new recipes ===`);
for (const r of imported) {
  note(`+ ${r.category} / ${r.name} (${r.baseYield} ${r.yieldUnit}, ${r.components[0].ingredients.length} ingredients)`);
}

// validate combined output through the app's own parser
const combined = [...existing, ...imported];
parseRecipeDatabase(JSON.parse(JSON.stringify(combined)));
note("parseRecipeDatabase: OK");

fs.writeFileSync(DB_JSON, JSON.stringify(combined, null, 2) + "\n", "utf8");
note(`Wrote ${DB_JSON} (${combined.length} recipes)`);

// seed SQL — same format as supabase/seed_recipes.sql
const sqlEscape = (s: string) => s.replace(/'/g, "''");
const values = imported
  .map((r) => {
    const components = JSON.stringify(r.components);
    if (components.includes("$json$")) throw new Error(`$json$ collision in ${r.id}`);
    return `('${sqlEscape(r.name)}', '${sqlEscape(r.category)}', ${r.baseYield}, '${r.yieldUnit}', '${sqlEscape(r.note ?? "")}', $json$${components}$json$::jsonb)`;
  })
  .join(",\n");
const sql = `-- Generated by scripts/import-xlsx.ts — ${imported.length} new recipes from Tabulky/*.xlsx\nINSERT INTO public.recipes (name, category, base_yield, yield_unit, note, components) VALUES\n${values};\n`;
fs.writeFileSync(SEED_SQL, sql, "utf8");
note(`Wrote ${SEED_SQL}`);
