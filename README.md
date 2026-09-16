# Gator Board

A one-page, landscape, full-screen health and sanity tracker built with Astro. It's tuned for a recent iPad.

## Features

- Arrows on each side of the resource, health and sanity icons lower or raise the value (0–99). Defaults are 5 resources, 7 health, 8 sanity.
- A campaign log (book button, bottom left) with undo and redo. Taps on the same stat within 3 seconds merge into one entry.
- A chaos bag (bag button, bottom left):
  - **Set up:** seed the bag from any campaign and difficulty (data in `src/scripts/tokens.ts`).
  - **Contents:** add or remove any token, including bless and curse (up to the physical token limits). Seal tokens and release them.
  - **Draw:** tap the bag or draw 1–5 at once, then "Draw another" as needed. Tap a drawn token to put just that one back, or return them all. Returning removes drawn bless and curse tokens from the bag unless you choose to keep them.
  - Keyboard: 1–9 draw that many, space draws or returns, 0 / Enter returns.
  - Every draw, return that removes bless/curse, token edit, seal, release and bag setup is written to the campaign log. Undo/redo only applies to resource, health and sanity changes.
- Reset lives in the campaign log and asks for confirmation first. It restores the defaults (including a Night of the Zealot / Standard bag), clears the log, and deletes the saved cookies.
- State is saved to first-party cookies (split into chunks) and restored on load.
- Search engines are told not to index the site: `robots` meta tag, `robots.txt`, and an `X-Robots-Tag` header in `public/_headers` (Netlify / Cloudflare Pages).

## Develop

```bash
npm install
npm run dev
```

`npm run build` writes the static site to `dist/`.

## iPad tips

Use Safari's **Share → Add to Home Screen** to launch it full screen with no browser chrome. Safari may delete cookies written by scripts after 7 days without a visit.
