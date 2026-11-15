# Nihongo Lab

Offline-first Japanese practice for JLPT N5 to N3: vocabulary, kanji, grammar patterns, sentence building and reading, with a memory model that adapts to your answers. It is a plain web app (no build step, no packages) that installs as a PWA.

## Run it

Serve the folder and open it in a browser (opening `index.html` directly will not load the lessons):

```
python3 -m http.server 8000
```

## Folders

| Folder | What is in it |
|---|---|
| `index.html` | markup and the list of scripts |
| `css/` | `app.css`, the only stylesheet |
| `js/` | the app, split into numbered scripts (see `docs/ARCHITECTURE.md`) |
| `icons/` | app icons for installing the PWA |
| `data/` | lessons as JSON packs (see `data/SCHEMA.md`) |
| `tests/` | unit tests (see `tests/README.md`) |
| `tools/` | formatter, release builder, roadmap generator |
| `docs/` | architecture guide |

## Everyday commands

| Command | What it does |
|---|---|
| `npm test` | runs all unit tests (Node 18 or newer) |
| `npm run format` | formats `js/*.js` and `css/app.css` |
| `npm run format:check` | fails if a file is not formatted |
| `npm run check` | format check, then tests |
| `npm run roadmap` | rebuilds `ROADMAP.md` from `data/roadmap.json` |
| `npm run release` | builds the release zip with only the modified files |

## Versions

`MAJOR.MINOR.YYYYMMDD` (a letter is added for a second release on the same day). The version lives in `version.json`; every release adds an entry to `CHANGELOG.md`.


## Real corpus frequency ranks

The word ranking is an estimate until you import a corpus list. The free BCCWJ word list from NINJAL (https://clrd.ninjal.ac.jp/bccwj/en/freq-list.html, short unit words, for research and education) or any CSV with a word column and a rank or count column works:

    python3 tools/import-corpus-freq.py BCCWJ_frequencylist_suw_ver1_0.tsv --name "BCCWJ short-unit words (NINJAL)"

This writes `data/corpus-freq.json` (only the words in the deck). The app then ranks words by corpus rank, shows "corpus rank N" in the dictionary and keeps estimates only for the words the list does not contain (Memory shows how many matched). Check the licence of the list you use before you share the file.
