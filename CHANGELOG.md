# Changelog

Version format: MAJOR.MINOR.BUILD
- MAJOR: breaking change to saved memory or content schema
- MINOR: new feature
- BUILD: release date as YYYYMMDD (a second release on the same day adds a letter, for example 20261106b). Releases before v1.5.20261106 used a running number instead.

The single source of truth is `version.json`. Lesson data has its own version in `data/content.json` (contentVersion).

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
