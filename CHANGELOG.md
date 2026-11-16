# Changelog

Version format: MAJOR.MINOR.BUILD
- MAJOR: breaking change to saved memory or content schema
- MINOR: new feature
- BUILD: release date as YYYYMMDD (a second release on the same day adds a letter, for example 20261106b). Releases before v1.5.20261106 used a running number instead.

The single source of truth is `version.json`. Lesson data has its own version in `data/content.json` (contentVersion).

## v1.21.20261116
- Accessibility review, first part (`js/30-accessibility.js`, `css/app.css`, `index.html`):
  - Contrast: the green text colour in the light theme now passes 4.5 to 1, and buttons, tiles, inputs and chips use a new border colour (`--bdc`) that passes 3 to 1 in both themes
  - Keyboard: everything that reacts to a click (cards, rows, links, arrows) gets a button role and a tab stop, Enter and Space work on it and on tappable kanji, Tab stays inside a dialog, Escape closes the tooltip and then the dialog, and the arrow keys no longer change the question while a menu or dialog has the focus
  - Dialogs: the focus moves in when one opens and back to where it was when it closes, and the page behind it is made inert
  - Screen readers: answers and feedback are announced, tapped kanji tips are read out, each screen sets the page title and the current tab, Japanese text is marked lang="ja", fields and menus have labels, and file pickers can be reached with the keyboard
  - Other: skip link, a mark (✓ or ✗) on answers so colour is not the only cue, forced-colours styles
- Code: the long HTML template strings are built from small functions (22 templates over 350 characters before, none over 290 now), and scripts 07 and 14 are split into eight files; screen output was checked identical on 320 screens
- Tests: 377

## v1.20.20261116
- Tappable kanji everywhere in sentences: every kanji of every Japanese sentence (examples, dictionary pages, questions, fill-in-the-blank sentences, check-up, reading passages, feedback) is now its own tap target, including kanji inside words and kanji outside the word list
- A tap shows the kanji's hiragana reading (on and kun), its meaning and the word it is in, for example 宿題 (しゅくだい): homework, even when the study toggles hide readings or meanings elsewhere
- Furigana above your JLPT level is kept; tiles stay free of tap targets so a tile can still be chosen
- The dictionary page now shows its example sentence with the same tappable words and kanji
- Tests: 350

## v1.20.20261115
- Example sentences: every N5 and N4 word (1,349) now has a Japanese sentence with an English translation (`data/examples1.json`); kanji readings are shown as furigana above your level, and the names, counters and words the sentences needed were added (`data/n4l.json`)
- Verb relations: 29 close-meaning verb pairs (was 4), 29 antonym pairs, 31 transitive and intransitive pairs and honorific and humble pairs, each with a note shown in the dictionary under "How they differ" (`data/semantics3.json`)
- Verb conjugation: 23 forms in five groups (basic, polite, て-form, ability and voice, conditional and will): potential, passive, causative, causative-passive, ば, たら, volitional, imperative, ないで, たり, must; a line on how each verb class is built; now also for する compounds (勉強する) and the honorific verbs (いらっしゃいます)
- Corpus frequency: the app uses real corpus ranks when `data/corpus-freq.json` is present; `tools/import-corpus-freq.py` makes it from the BCCWJ word list or any rank or count list. No corpus list is bundled, so the ranking is still estimated until you import one (see README)
- Tests: 338

## v1.19.20261115
- Progress tab: vocabulary in collapsible groups by JLPT level (N5 to N1 and Work), difficulty (easy, medium, hard) and newly acquired words (today, last 7 days, last 30 days); groups fill when opened
- Furigana by level: kanji within your JLPT level are shown as they are even if not studied yet, kanji above it get furigana in sentences, passages, tiles and questions. Set your level in Memory, Display (automatic by default). Romaji under whole sentences is now off by default (setting: Show romaji under sentences)
- Kanji mastery now uses these rules instead of romaji-only passages; tapping a word still counts as help, and kanji shown with furigana earn half credit
- Content: N4 is completed (N4 packs 10 and 11: 248 words, 103 kanji), new N2 pack (222 words, 90 kanji) and N1 pack (181 words, 92 kanji), most common words first
- Levels: new `lvOpen`, `lvIntro` and `ulv` (js/29): N3, N2 and N1 content opens level by level, or when you choose your level
- Speed: look-alike lookup and word similarity are cached, so the first practice question appears about 5 times faster with the bigger deck
- Tests: 282

## v1.18.20261114
- Content: N5 pack 3 completes the N5 vocabulary (670 N5 words, up from 266) with 20 new kanji entries and about 50 sample sentences; about 130 words that were filed as N4 are moved to N5 (new `relevel` pack field)
- Content: Japanese counters pack (26 counters, special readings for 1 to 10, 25 questions)
- Fix: romaji output and typing now handle foreign-sound kana (フォーク fooku, パーティー paathii, ティ thi, ファ fa)
- Sentence writing: after every typed or tile answer you see your answer next to the correct one, with the differences marked and each mistake explained (`js/27-answer-review.js`)
- Kanji mastery (`js/28-kanji-mastery.js`): each kanji gets a score from your help requests (tap, See more) and independent reading; kanji you have not mastered appear as romaji in reading passages, tap to see the kanji, See more for the meaning and readings; weak kanji return in practice and show on Today and Memory
- Memory import merges kanji mastery; tests: 265

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
