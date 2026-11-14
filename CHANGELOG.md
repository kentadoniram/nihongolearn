# Changelog

Version format: MAJOR.MINOR.BUILD
- MAJOR: breaking change to saved memory or content schema
- MINOR: new feature
- BUILD: release date as YYYYMMDD (a second release on the same day adds a letter, for example 20261106b). Releases before v1.5.20261106 used a running number instead.

The single source of truth is `version.json`. Lesson data has its own version in `data/content.json` (contentVersion).

## v1.17.20261114
- Fix: if saved progress cannot be read, a copy is kept under `nihongoLab1.corrupt` instead of being overwritten by the next save
- Fix: when the browser refuses to save (storage full or blocked), a warning with a Save (backup) button now appears instead of failing silently
- App icons (192, 512 and maskable 512) and a fuller manifest so the app can be installed; icons are precached and included in releases
- Housekeeping: restored `.editorconfig` and `.gitignore` (the code-style test was failing without them); removed the stale root copies of `content.json` (v1.3.0, 3 packs) and `SCHEMA.md` and a stray `mnt/` folder; `package.json` version aligned and `engines.node` added
- Accessibility: labelled navigation, live status region; clearer start-up error message
- Tests: saved-data tests, plus version, manifest and stale-file checks (241 tests)

## v1.17.20261113
- Formatting, no change in behaviour: all scripts and the stylesheet are formatted (one statement per line, one declarator per line, wrapped long lines); the syntax tree of every script was checked identical to before
- tools/format-js.js (no dependencies) with npm run format and format:check; code-style tests; .editorconfig, .gitignore, README.md and npm scripts
- Release tool now includes README.md, .editorconfig and .gitignore

## v1.17.20261112
- Refactor, no change in behaviour: index.html is now only markup; styles are in css/app.css; the code is split into 27 numbered scripts in js/ (each with a purpose header); docs/ARCHITECTURE.md explains the layout
- Service worker reads the stylesheet and scripts from index.html
- Tests load the scripts in order; new structure tests; release tool builds patch zips with only modified files (tools/build-release.py, --full for everything)

## v1.17.20261111b
- N4 pack 9 (n4i.json) and N3 pack 2 (n3b.json): new words; kanji2.json adds 114 missing kanji entries, including some used by N5 pack 2, so every kanji in the deck now has an entry
- N3 grammar 1 (n3grammar.json): 12 practice questions (ようにする, ことにする, ことになる, ばかり, はず, について, によって, として, ながら, causative, passive, ても), 4 sentence patterns and 6 typed sentences with readings
- Content 1.15.0

## v1.17.20261111
- Time-based regression: after 3 or more days away, question stage follows your effective memory strength, your ability estimate eases back, and a welcome-back card shows the estimated recall drop
- N5 pack 2: more vocabulary, verbs, kanji and sample sentences; verb conjugation table (11 forms with examples) in the dictionary
- Reading help points in passages: 1 point for a tap, 3 in total for a double tap or opening the full entry; tracked under Memory > Learning
- N4 pack 8 (n4h.json)
- tools/build-release.py builds the full zip with every data JSON file in its original folder, one copy of each

## v1.16.20261110b
- Forgetting model is fitted to your own reviews (time scale and curve shape, maximum likelihood with a prior); shown under Memory > Learning
- Casual speech and office phrases: 〜てしまう > 〜ちゃう, 〜ている > 〜てる, 〜ておく > 〜とく, 〜なければ > 〜なきゃ, 〜ては > 〜ちゃ, generated for your own verbs, plus 29 casual office phrases, in the Lab
- Unit tests for every statistical model
- N4 pack 7 (content 1.13.0)

## v1.15.20261110
- Synonym check for conjugated verbs: a close-meaning verb in the same form is accepted (習います > 学びます), an opposite verb is explained; covers ます, ません, ました, て, た, ない, なかった for ichidan, godan, 行く and 来る
- 10 hand-written reading passages with 20 questions (data/passages1.json), shown in the Lab
- N4 pack 6 (content 1.12.0): new words and kanji; 18 verb relations (data/semantics2.json)

## v1.14.20261109b
- Unit tests: tests/unit/*.unit.test.js with shared helpers in tests/helpers (run with `npm test` or `node --test`)
- ROADMAP.md is generated from data/roadmap.json and checked by a test; Today shows how many builds are still pending
- Content 1.11.0 also fills 94 missing kanji entries, found by the new content test, so every kanji in the deck now has a tooltip entry
- N4 pack 5 (content 1.11.0): 74 words and 48 kanji, integrated into practice, the vocabulary list, tooltips and the Lab

## v1.13.20261109
- Fix: romaji answers now work for every typed word question (tomodachi, ukeru, gakkou, gakkō); the converter handles nn, n', macrons, doubled consonants and the long vowels ou/oo, ei/ee
- New typed question: type the Japanese word from its English meaning, in romaji, hiragana or kanji
- Questions get harder as a word is learned: four stages with more production questions, cloze sentences and sharper look-alike distractors; the same word never comes back in the same form, with the same wrong options, or in the same order
- New words keep coming when nothing is due, instead of drilling items that are not due; more new words per day when you are doing well
- New question: pick the word from its reading (kanji words); every word cycles through all its question forms before any form repeats
- Romaji output writes ん before a vowel as n' (gen'in, hon'yaku), and typed answers accept it with or without the apostrophe
- Japanese font setting (textbook, rounded, plain sans, mincho); the default is no longer the sharp mincho style
- N4 pack 4 (content 1.10.0): 受ける and 13 more verbs and nouns with kanji

## v1.12.20261108b
- N4 pack 3: 83 words and 52 kanji (content 1.9.0)
- Answers show furigana, romaji and English: words, typed and tile sentences, Lab answers, check-up answers
- Words and grammar expressions in explanations, answers and passages are tappable: a tooltip first, a second tap on the tooltip opens the full window; 30 expressions with explanations and examples
- Fix: Build feedback no longer fails for sentences without stored readings

## v1.11.20261108
- Vocabulary list with progress per level, status filters, search (also by romaji) and optional lesson tags
- Roadmap view loaded from data/roadmap.json
- Explanations: Japanese text is set apart with spacing, kanji from the deck get furigana, and answers show reading and spaced romaji on separate lines
- Back: visible Back buttons, a message on the first question, and Next from a reviewed question now steps forward instead of skipping
- The check-up is built from fresh questions each time; fixed grammar questions vary their subject; new identity-sentence generator
- Sentence generator: grammar lint (particle and verb compatibility, tense matches the time word, subject differs from the noun), three natural word orders accepted and shown

## v1.10.20261107c
- Behaviour log: engaged time versus idle time (pauses over 20 s are not counted as thinking), robust z-score outliers (slow, fast, long pause), recorded per question type
- Context of slow questions is kept (words, options, picked answer, sentence) and aggregated into slow-prone keys
- Skip button in Play, Lab, typing and Build; skips are stored apart from mistakes
- Sentence building is recorded: first full arrangement versus final, removals, drafts, deletions, revisions; patterns where you start with English order appear more often
- Typing evaluator: word-relation graph with shortest-path distance accepts valid variations (確認 or チェック), partial credit with a percentage, particle explanations (が versus を and others), long-vowel and katakana normalisation
- Learning data card in Memory with size, and Download learning log only; all logs merge on import
- Content 1.7.0: 17 workplace and everyday words, 29 more relations with usage notes

## v1.9.20261107b
- Everyday-use tiers (1 very common to 5 rare or specialised) rank new words; a Rare words slider (0 to 40%) mixes rare words in between
- Word relation graph (synonyms, antonyms, gradable antonyms, transitive/intransitive pairs) shown in the dictionary
- Lab gains Meaning questions: same idea with synonyms or antonyms, and sentences with different structure but the same meaning (comparison swap, negated antonym, time word fronting, polite and plain forms, ので and だから)
- Content 1.6.0

## v1.8.20261107
- New Today screen: one Start button runs a mixed 10-activity session across Play, Lab, typing and Build; shows Zipf-weighted coverage, a daily goal from a Poisson model, a 14-day Monte Carlo forecast and the most worthwhile next words
- Word order now uses frequency value divided by study cost (greedy knapsack, unknown kanji add cost)
- Naive Bayes and softmax level classifiers on character n-grams (used for imported words without a level)
- Response times get a robust z-score (median and MAD): fast wrong answers are treated as slips, slow right answers as weaker memories
- Softer card, button and type styling

## v1.7.20261106c (2026-11-06)
- Generators: sentence frames now feed Build, typing and Lab with unlimited unique sentences; Lab gains particle and tense questions
- 9 reading templates (N5 to N3, one for work) that fill slots, giving thousands of distinct passages with 2 to 4 questions each; Lab filter chips (All, Reading, Grammar, Words)
- Generated questions are fingerprinted so none repeats

## v1.6.20261106b (2026-11-06)
- Build: type the Japanese for an English sentence (romaji, hiragana or kanji) with explanations of tense, word order and particles
- Play: tap the right edge for next and the left edge for previous (arrow keys on a keyboard)
- Distractors use a Dirichlet-smoothed confusion model; the difficulty model is calibrated and shows a calibration table; questions are fingerprinted so exact repeats are avoided
- Content 1.4.0: work vocabulary pack (plant engineering), N4 pack 2, typing exercises

## v1.5.20261106 (2026-11-06)
- Fix: Lab now picks activities with the forgetting model, Thompson sampling and the difficulty regression, shuffles answer options and avoids repeats; it also generates word-decoding puzzles from the data
- Content 1.3.0: first large N4 batch (95 words, 95 kanji)
- Release zips are named with the version

## v1.5.2026109 (2026-11-06)
- Kanji details are now tooltips (tap a kanji); settings choose what they show
- New words show in a timed study card that hides before the question, so the answer is never on screen
- Compact table format for words and kanji; part of speech derived by rule with optional overrides
- Content 1.2.0: full N5 kanji set and more N5 vocabulary

## v1.4.2026108 (2026-11-06)
- New words are taught inside the first question (no confirm button); correct answers move on automatically (can be turned off)
- Sentence patterns: pattern cards with formulas, examples and the English-order trap; Build practices them
- Lab shows one activity at a time; navigation moved to the bottom; sticky feedback; round progress bar
- Content 1.1.0: more vocabulary, kanji, sentences and 9 patterns

## v1.3.2026107 (2026-11-06)
- Fix: lesson loader also works when all files sit in one flat folder; data manifest renamed content.json (it clashed with the app manifest.json); load errors now name the missing file

## v1.3.2026106 (2026-11-06)
- Lesson content moved out of the code into data/*.json packs (see data/SCHEMA.md)
- Content packs can be imported in the Memory tab
- Settings grouped into sections, slimmer backup reminder, version shown under About
