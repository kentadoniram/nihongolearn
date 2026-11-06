# Changelog

Version format: MAJOR.MINOR.BUILD
- MAJOR: breaking change to saved memory or content schema
- MINOR: new feature
- BUILD: year followed by a 3-digit release number within that year (2026106 = release 106 of 2026)

The single source of truth is `version.json`. Lesson data has its own version in `data/manifest.json` (contentVersion).

## v1.3.2026106 (2026-11-06)
- Lesson content moved out of the code into data/*.json packs (see data/SCHEMA.md)
- Content packs can be imported in the Memory tab
- Settings grouped into sections, slimmer backup reminder, version shown under About
