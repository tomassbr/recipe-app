-- Zadání cílového množství po kusech (např. odpalované těsto: věneček 30 g, větrník 37,5 g).
-- JSONB pole: [{"name": "Věneček", "grams": 30}, …] — null = receptura bez kusového zadání.
alter table public.recipes
  add column if not exists piece_options jsonb;
