# Content pack schema (schema 1)

List each pack file in `data/content.json` (`packs`). Every key below is optional. Ids must stay stable once published, because progress is saved against them.

- `pack` (name), `level` (default JLPT level 5, 4, 3, 2 or 1), `title`
- `words`: `{w, r, m, l?, e?: [japanese, english]}`. The word `w` is its id.
- `kanji`: `{k, m, on, kun, l?}`
- `questions`: `{c: "v"|"k"|"r"|"g", l, q, o: [options], a: index of the right option, y: explanation, w?: word id, id?: required for c "g", x?: 1 to keep out of the diagnostic}`
- `sentences`: `{en, t: [tokens], tail: number of final tokens that stay fixed, y?, l?, f?: pattern id}`
- `forms` (sentence patterns): `{id, l, name, blocks: [labels], note, trap, ex: [[jp, en]]}`
- `patterns`: `{id, t, l, ex: [[jp, en]], q, o, a, y}`
- `reading`: `{id, t, l, p: passage, q, o, a, y}`
- `lookalike`: groups of look-alike kanji such as "大太犬天"

To add N2, create `data/n2.json` and append it to `packs` in the manifest.
