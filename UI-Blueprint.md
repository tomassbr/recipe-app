# PastryCalc — UI blueprint (Pencil + implementace)

Tento dokument slouží jako **jednotný zdroj** pro návrh v Pencil i pro vývoj (Next.js). Odpovídá `Specification.md`, `Design.md` a datům v `db.json`.

---

## 1. Účel obrazovky

**Hlavní otázka:** „Kolik surovin potřebuji při zadaném výstupu?“  
**Primární akce:** úprava **cílového výstupu** (Target yield) s okamžitým přepočtem.

---

## 2. Datově řízené UI (server-driven)

| Zdroj dat | UI |
|-----------|-----|
| `unique(recipe.category)` z JSON/API | **Postranní panel** — dynamický seznam kategorií |
| `recipes.filter(r => r.category === active)` | **Mřížka karet** receptů v hlavní oblasti |
| Vybraný `recipe` | **Detail** — název, poznámka, vstup výstupu, **N** sekcí podle `recipe.components.length` |
| Každý `component` | Podnadpis sekce + tabulka řádků `ingredients` |

Žádný pevný počet kategorií ani komponent — layout se **generuje** z payloadu.

---

## 3. Matematika (nezpochybnitelná)

- `coefficient = targetYield / baseYield`
- `calculatedAmount = baseAmount × coefficient`
- Zobrazení: max 2 desetinná místa; celá čísla bez `,00`. Jednotky **beze změny** (`g`, `kg`, `ks`).

---

## 4. Tok obrazovek

### A) Prohlížení (Browse)

1. **Pozadí:** full-viewport mesh gradient (mint `#e0f7fa`, lilac `#ede7f6`, modrá `#e3f2fd`) — měkký, rozostřený dojem.
2. **Levý sloupec:** skleněný panel (`GlassPanel`) — vertikální seznam kategorií.
   - Aktivní: pilulka `bg-white/60`, **tučný** text.
   - Neaktivní: jemnější sklo, `text-slate-500`.
3. **Hlavní plocha:** skleněný kontejner `rounded-2xl` / `rounded-3xl` — **mřížka RecipeCard** (název, `baseYield`, `yieldUnit`).
   - Hover karty: `hover:-translate-y-1`, silnější stín.

### B) Detail receptu

Stejný shell; hlavní oblast místo mřížky:

1. **Zpět** k seznamu (zachovat vybranou kategorii).
2. **Hlavička:** `recipe.name` (velký), `recipe.note` jako sekundární text (`slate-500`).
3. **Kalkulační blok (dominantní):**
   - Popisek: **Cílové netto / počet** + jednotka z `yieldUnit`.
   - `<input type="number">` — výchozí hodnota = `baseYield`, **žádné odeslání** — přepočet v reálném čase.
   - Volitelně řádek: **Koeficient** = `target / base` (read-only, `tabular-nums`).
4. **Ingredience:** pro každý `component` po pořadí:
   - **Podnadpis** = `component.name`
   - **Tabulka:** minimálně sloupce **Surovina** | **Původní** (`baseAmount` + jednotka) | **Přepočet** (vypočteno + jednotka), čísla `tabular-nums`.

**Prázdný stav:** žádné recepty v kategorii — zpráva uvnitř hlavního panelu.

---

## 5. Glassmorphism tokeny (Tailwind / Pencil)

Společné pro sidebar, karty, panely, obal tabulky:

| Vlastnost | Hodnota |
|-----------|---------|
| Pozadí | `bg-white/40` nebo `bg-white/30` |
| Rozostření | `backdrop-blur-xl` / `backdrop-blur-2xl` |
| Okraj | `border border-white/50` |
| Stín | `shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]` |
| Zaoblení | `rounded-2xl` / `rounded-3xl` |

**Typografie:** Inter nebo Geist.  
**Text:** primární `slate-800`, sekundární `slate-500`.

**Vstup cílového výstupu:**

`bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300/50`

---

## 6. Rámce pro Pencil (vrstvy)

| Rámec | Název | Obsah |
|-------|--------|--------|
| 1440×~900 | `PastryCalc / Browse` | Mesh pozadí → `Sidebar_Categories` → `Main_RecipeGrid` |
| 1440×~900 | `PastryCalc / Detail` | Stejné pozadí + sidebar → `Detail_Panel` (`Back`, `Recipe_Header`, `TargetYield`, `Ingredients_Stack`) |
| Symbol | `GlassPanel` | Základ skla (fill + blur + border + shadow) |
| Symbol | `RecipeCard` | Název + řádek výstupu + volitelná šipka |
| Symbol | `IngredientSection` | Podnadpis + řádek hlavičky tabulky + opakovatelné řádky (počet = data) |

**Poznámky na canvas:**

- „Sidebar položky = `unique(categories)` z JSON“
- „Karty = `filter(category)`“
- „Opakovat `IngredientSection` × `recipe.components.length`“
- „Koeficient = target / baseYield (live)“

---

## 7. Architektura kódu (návaznost na spec)

- Načítání dat za službou / hookem (`useRecipes()`), později snadná výměna za `fetch`/API.
- Komponenty: `RecipeCard`, `IngredientTable` / sekce, `CalculatorInput` (řízený vstup + přepočet).

---

## 8. Související soubory

| Soubor | Role |
|--------|------|
| `Specification.md` | Produkt a vzorce |
| `Design.md` | Vizuální tokeny |
| `db.json` | Zdroj receptů |
| `PastryCalc-UI.pen` | Vizuální návrh v Pencil (v tomto repu) |

### Pencil dokument (`PastryCalc-UI.pen`)

V souboru jsou **dva horní rámce** pod sebou (scroll v canvasu):

1. **`PastryCalc / Browse`** — mesh gradient pozadí, skleněný **sidebar** (ukázka kategorií + aktivní pilulka), hlavní panel **Recepty** s ukázkovými kartami (metadata z `db.json`).
2. **`PastryCalc / Detail`** — stejný shell, **detail receptu** s „Zpět“, nadpisem, blokem **Cílové netto / počet** + mock vstupu, **Koeficient (live)**, dvě sekce tabulky (**Odpalované těsto**, **Crumble**) jako příklad **více `components`**.

**Regenerace:** v Cursoru otevři `PastryCalc-UI.pen` v Pencil extension; při přepnutí editoru použij *Open* na tuto cestu.

**Poznámka:** styly odpovídají `Design.md` (bílé `fill` s průhledností, `background_blur`, jemný okraj). Pro implementaci použij stejné tokeny v Tailwindu.
