# Tests

Run everything with `npm test` (or `node --test`). Needs Node 18 or newer, no packages.

Naming rules
- Test files live in `tests/unit/` and are named `<area>.unit.test.js` (for example `romaji-conversion.unit.test.js`).
- Shared utilities live in `tests/helpers/` and are named `<name>.helper.js`. They are never run as tests.
- Every test case title starts with "should" and says what behaviour it protects.
- Tests use a seeded random generator, so a failure can be reproduced.

The app is loaded from `index.html` in a sandbox with a fake page, so no browser is needed.
These files are not needed on the website; leave the `tests` folder out of the Netlify upload if you prefer.
