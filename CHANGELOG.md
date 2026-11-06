# Changelog

Version format: MAJOR.MINOR.BUILD
- MAJOR: breaking change to saved memory or content schema
- MINOR: new feature
- BUILD: release date as YYYYMMDD (a second release on the same day adds a letter, for example 20261106b). Releases before v1.5.20261106 used a running number instead.

The single source of truth is `version.json`. Lesson data has its own version in `data/content.json` (contentVersion).

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
