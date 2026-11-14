# Architecture

Nihongo Lab is a plain web app: no build step, no packages. `index.html` holds the markup, `css/app.css` the styles, `js/*.js` the code and `data/*.json` the lessons.

## Scripts (load order)

The scripts are classic scripts, so they share one global scope. They must load in the order listed in `index.html`: a file may use anything defined above it at start-up, and anything at all once start-up has finished.

| File | Purpose | Main names |
|---|---|---|
| `01-core-state.js` | Global state, saved data and small helpers | V, $, KEY, S, svn, W, hira |
| `02-forgetting-model.js` | Forgetting curve and its personal fit to your reviews | FK, ret, fmNLL, fitFm, applyFm, refitFm, rvPush, fmStatus, cur |
| `03-difficulty-model.js` | Look-alike similarity, difficulty regression (Rasch style), calibration and random samplers | look, bg, sim, FN, sg, feat, pr, pc, nrm, rg, rb |
| `04-practice-selection.js` | Learning update, screen router and choosing the next item (Thompson sampling) | learn, go, ruby, pick, practice, meet, goq, opts |
| `05-question-builder.js` | Difficulty stages, building questions and checking answers | sEff, stg, cloze, build, build0, show, ans, nq |
| `06-lab-and-casual.js` | Lab activities, casual speech rules and phrases | wpick, labObj, CAS, tev, CAS_FN, ruleQ, phraseQ, labItems, labPick, lc... |
| `07-progress-and-memory-screens.js` | Progress screen, memory export and import, settings screen, tile builder helpers | prog, exp, addCp, isPack, mrg, imp, impt, rst, LV, strip, oddg, bshow,... |
| `08-content-loading.js` | Loading data packs into the shared content tables | rows, applyPacks, loadContent |
| `09-display-helpers.js` | Romaji output, tappable kanji and explanations for wrong answers | RM, romaji, kc, lk, lvb, why, tyWhy |
| `10-dictionary.js` | Dictionary and kanji views | dv, dict, kd |
| `11-build-tab.js` | Sentence patterns and the Build tab | nlq, PT, fm, blk, bld, bsh, sp, pat, pats, sc |
| `12-tooltips.js` | Part of speech, kanji tooltips and tap handling | posOf, tipHTML, showTip |
| `13-play-navigation.js` | Previous and next navigation in Play | hist, snap, nav, calq, attr |
| `14-typed-translation.js` | Fonts, romaji to kana and typed translation | RK, FONTS, setFont, toKana, toK1, EN, ending, PR, diagT, tq, typ, TB, ... |
| `15-generators-and-lint.js` | Sentence generators and the grammar lint | FRM, kindOf, labChips, gsB, PVR, lintS, gsI, gs, identLab, genLab |
| `16-statistics.js` | Statistics layer: Zipf, knapsack, classifiers, robust z-score, Poisson and Monte Carlo forecast | ZR, zv, knownK, cost, nextW, cov, topW, ft, nbP, smP, trainLv, predLv,... |
| `17-today-screen.js` | Today screen and mixed session | MX, mixStart, mixGo, mixNext, adv, today |
| `18-word-relations.js` | Synonym, antonym and verb-pair relations | rareOne, gr, relLab, paraLab |
| `19-behaviour-log.js` | Behaviour log: engaged time, skips and slow-question context | ET, etTouch, etStart, etEnd, robZ, logEv, ctxP, ctxL, skipQ, lskip, ts... |
| `20-typed-answer-check.js` | Semantic evaluator and romaji, hiragana and kanji answer checking | VM, lvn, nkana, lc, rkOk, lr, near, oppOf, PW |
| `21-verb-conjugation.js` | Verb conjugation and the synonym check for conjugated verbs | GOD1, ROW, IE, vclass, conj, _vf, vfMap, verbAlt, evalT |
| `22-lexicon.js` | Tappable words and expressions inside Japanese text | JPR, mkLex, ej, ENDS, rj, tokH, trioT, trioS, trioW, tn, placeTip, sho... |
| `23-checkup-vocab-roadmap.js` | Randomised check-up builder, vocabulary list and roadmap | diagBuild, vf, vocab, vocabList, roadmap |
| `24-time-regression-and-reading-points.js` | Time-based regression after time away and reading help points | absence, wbCard, LKE, kLook, kiStatus |
| `25-verb-table.js` | Verb conjugation table for the dictionary | CLASS_LBL, VFORMS, vtab |
| `26-checkup-screen-and-banner.js` | Backup banner and the check-up screen | banner, dg, diag, dq, da, dn |
| `99-boot.js` | Start-up: service worker registration and loading the content | (runs at start-up) |

## How the pieces fit

- Lessons: `data/content.json` lists the packs; `08-content-loading.js` merges them into the shared tables (`V` words, `KJ` kanji, `SN` sentences, `LAB` activities, `FM` patterns, `CAS` casual speech). See `data/SCHEMA.md`.
- Practice: `pick` (04) chooses the next item, `build` (05) makes the question, `show` and `ans` (05) display and mark it, `learn` (04) updates the models.
- Models: forgetting curve and its fit (02), difficulty regression and calibration (03), Thompson sampling (04), statistics and Monte Carlo forecast (16), time away (24).
- Answers in romaji, hiragana, katakana or kanji are checked in 14 and 20; verbs in 21.

## Conventions

- One concern per file, numbered by load order, each starting with the standard header (the structure test checks it). Keep files under 30 KB.
- No inline scripts or styles in `index.html`.
- Formatting is automatic: run `npm run format` (`tools/format-js.js`, no packages needed). `npm run format:check` and the code-style test fail when a script or the stylesheet is not formatted. The formatter only changes white space and line breaks. Long HTML template strings are left as they are.
- Editors pick up the same rules from `.editorconfig` (2 spaces, LF, final newline).
- A top-level name is defined in exactly one file.
- New file: add its `<script>` tag to `index.html` (the service worker reads it from there) and describe it in this table.
- New lesson content goes in `data/`, never in the code.

## Tests and releases

- `npm test` runs `tests/unit/*.unit.test.js` (see `tests/README.md`).
- Releases: update `version.json` and `CHANGELOG.md`, run the tests, then `python3 tools/build-release.py`. By default it builds a patch zip with only the modified files in their folders; `--full` includes everything.
