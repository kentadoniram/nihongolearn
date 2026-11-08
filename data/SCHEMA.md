# Content pack schema (schema 1)

List each pack file in `data/content.json` (`packs`). Every key below is optional. Ids must stay stable once published, because progress is saved against them.

- `pack` (name), `level` (default JLPT level 5, 4, 3, 2 or 1), `title`
- `words`: objects `{w, r, m, l?, p?, e?: [japanese, english]}` or a compact table `{cols: ["w","r","m","p","e"], rows: [[...]]}`. The word `w` is its id. `p` (part of speech) is optional: verbs, い-adjectives, loanwords and nouns are detected automatically, so only set `p` for things like na-adjective or noun (suru).
- `kanji`: objects `{k, m, on, kun, l?}` or a table with cols `["k","m","on","kun"]`. Which kanji appear in which words is computed, never listed by hand.
- `questions`: `{c: "v"|"k"|"r"|"g", l, q, o: [options], a: index of the right option, y: explanation, w?: word id, id?: required for c "g", x?: 1 to keep out of the diagnostic}`
- `sentences`: `{en, t: [tokens], tail: number of final tokens that stay fixed, y?, l?, f?: pattern id}`
- `forms` (sentence patterns): `{id, l, name, blocks: [labels], note, trap, ex: [[jp, en]]}`
- `patterns`: `{id, t, l, ex: [[jp, en]], q, o, a, y}`
- `reading`: `{id, t, l, p: passage, q, o, a, y}`
- `lookalike`: groups of look-alike kanji such as "大太犬天"

To add N2, create `data/n2.json` and append it to `packs` in the manifest.

- `gen`: `{subj, tm, cues, frames: table, reads: [templates]}`. A reading template has `t` with {slot} markers, `slots` (lists of values), `qs` (question, English hint, explanation, each tied to a slot) and optional `tr: "work"`. Wrong options come from the other values of the asked slot.

- Optional word columns: `fr` (frequency rank, lower is more common; used for Zipf ordering when present). A pack with `"autolevel": true` assigns a level to words that have none, using the n-gram classifiers.

- `freq`: `{"1": "word,word,...", "2": ..., "4": ..., "5": ...}`: everyday-use tiers (3 is the default). The order inside a tier is the order of commonness.
- `rel`: table with cols `["a","b","t"]`; `t` is `s` synonym, `a` antonym, `g` gradable antonym, `p` transitive/intransitive pair. `grad`: `[adjective, opposite, "nouns that suit both"]`. `bec`: `[cause noun, effect clause]` for ので and だから paraphrases. Frames in `gen` may carry a `dc` (dictionary form) column.

- `rel` rows may carry a fourth column `n`: a usage note shown when a learner uses that word instead of the target (register, nuance).

- `gen.ident`: `{nouns: [[word, reading, English with article]], forms: [{k: pres|neg|past|q, j: tokens, r: readings}]}` for “A は B です” sentences.
- `roadmap`: `[{t, s: done|doing|planned, a: area, n?: note}]`. Words may carry `ls` (a lesson label) to track progress by lesson in the word list.
