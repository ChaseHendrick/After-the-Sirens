# Contributing

Start with a bug report or a focused feature proposal. Include the seed, difficulty, game mode, browser version and reproducible steps. Save exports are useful for game-state bugs; inspect them before sharing and never upload credentials or personal data.

Use original code and art, or document compatible third-party licenses. Do not submit proprietary game code, maps or assets.

Run `python3 build.py`, `npm test`, and `npm run test:browser` for changes to simulation or UI. Install test dependencies with `npm ci` and Chromium with `npx playwright install chromium`. Keep generated `index.html` synchronized with source. Include a test for meaningful behavior or save regressions. Update the catalogue or documentation when gameplay changes.

Module ownership is explicit: one registration per `window.Sirens` system. Keep state finite, bounded and serializable; validate imported data rather than trusting it. Maintain legacy saves where practical, or document deliberate migrations.

Pull requests should explain the trigger, resulting behavior, and relevant verification. Keep scope focused and describe remaining limitations honestly.
