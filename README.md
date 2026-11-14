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
