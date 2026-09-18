# Gator Board

A landscape, full-screen investigator board built with Astro and tuned for a recent iPad.

Live at **https://adriankruschke.github.io/gator-board/** — published by the workflow in
`.github/workflows/deploy.yml` on every push to `main`.

> Unofficial fan-made project. Not affiliated with, endorsed or sponsored by Fantasy Flight Games.
> All card images, card text, icons and related intellectual property are © Fantasy Flight Publishing, Inc.
> All rights reserved. This is a private, not-for-profit site made for personal use at the table.

## Pages

- **`/` — start page.** Pick from 98 investigators: the Revised Core Set, every campaign and investigator expansion, the 2026 Core Set, starter decks, novellas and promos, parallel investigators, and scenario-only investigators. Filter by class or search by name, set or section. Tap one to see the full card (front and back), then start playing.
  - If a session is saved you can **Continue** it. Choosing an investigator instead asks for confirmation before the saved session is replaced.
- **`/play/` — the board.** It opens with the session's investigator card. Visiting it without a session sends you back to `/`.

## Board features

- Clue, resource, health and sanity trackers with arrows (0–99). They start at 0 clues and 5 resources plus the investigator's printed health and sanity. The health / sanity plaque sits over the icons printed on the card.
- A button column down the left edge: back to the start page, view the card back, full screen, undo, redo and the campaign log.
- The chaos bag opens from the elder sign token on the counter row, sized to match the counter icons.
- A campaign log (book button) with undo and redo. Taps on the same stat within 3 seconds merge into one entry.
- The chaos bag panel:
  - **Set up:** seed the bag from any campaign and difficulty (data in `src/scripts/tokens.ts`).
  - **Contents:** add or remove any token, including bless and curse, with no limit on how many of each (up to 99). Seal tokens and release them.
  - **View all tokens in the bag:** a button in Contents shows every token currently in the bag, one row per kind of token with all of its copies across that row. Tokens shrink to keep every row on screen at once.
  - **Draw:** tap the bag or draw 1–5 at once, then "Draw another" as needed. Tap a drawn token to put just that one back, or return them all. Returning removes drawn bless and curse tokens from the bag unless you choose to keep them.
  - Keyboard: 1–9 draw that many, space draws or returns, 0 / Enter returns.
  - Every draw, return that removes bless/curse, token edit, seal, release and bag setup is written to the campaign log. Undo/redo only applies to resource, health and sanity changes.
- **Reset campaign** (in the log) asks for confirmation, then restarts the same investigator from their defaults with a Night of the Zealot / Standard bag and an empty log.
- The session is saved to first-party cookies (split into chunks) and restored on load. Older saves without an investigator load as Harvey Walters.
- Tapping a tracker arrow plays a short synthesized click (Web Audio, no audio file). It is silent when the value is already at its limit.
- Pulling a chaos token has its own sound (a cloth rustle and a soft thud) and animation: the token tumbles in and settles in about 0.8s. It plays only on a pull, not when returning tokens or editing the bag.
- Pulling the auto-fail plays `public/snd/losing-horn.mp3` (the Price is Right losing horn) instead of the usual pull sound. The file came from orangefreesounds.com, which states "private use only"; the underlying sound belongs to the show's owners. It is not ours to license, so treat it as placeholder audio.
- Every page carries the legal disclaimer above: a footer on the start page, one line in the corner of the board.
- Search engines are told not to index the site: `robots` meta tag on both pages, `robots.txt`, and an `X-Robots-Tag` header in `public/_headers`.
  - The meta tag is what counts on GitHub Pages. Pages serves no custom headers, so `_headers` is ignored, and crawlers only read `robots.txt` from the domain root (`adriankruschke.github.io/robots.txt`), not from this project's subdirectory.
  - A published Pages site is reachable by anyone who has the URL; noindex only keeps it out of search results.

## Card images

The four tracker icons in `public/img/` are the game's own token art (damage, horror, resource and
clue tokens), upscaled with Real-ESRGAN. `public/tok/` holds the game's art for all 20 chaos
tokens, used everywhere tokens appear (the bag, the log and the setup preview).

`public/inv/` holds, per investigator code: `<code>.webp` (front, 2800×2010), `<code>-back.webp` (2400 px wide, where available) and `<code>-thumb.webp`.

93 of the 98 cards come from the Tabletop Simulator mod's card sheets, which hold each card at roughly
1050×750 — far more detail than the 418×300 scans on ArkhamDB, so small print (illustrator line,
copyright line, card text) stays legible at iPad resolution. Each card is cut from its sheet cell,
oriented to landscape, upscaled ×4 with Real-ESRGAN, then aligned to one reference layout so the
printed health / sanity icons land in the same place on every card. The other five (the four
Disappearance at the Twilight Estate investigators and Shattered Self) are not in the mod and still
come from the lower-resolution ArkhamDB scans.

Investigator data lives in `src/data/investigators.json`.

## Develop

```bash
npm install
npm run dev
```

`npm run build` writes the static site to `dist/`. The site is served from a subdirectory
(`base: '/gator-board'` in `astro.config.mjs`), so the dev server and preview also run at
`http://localhost:4321/gator-board/`. Build paths in code come from `import.meta.env.BASE_URL`.

## iPad tips

Use Safari's **Share → Add to Home Screen** to launch it full screen with no browser chrome. Safari may delete cookies written by scripts after 7 days without a visit.
