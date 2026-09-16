# Gator Board

A one-page, landscape, full-screen health and sanity tracker built with Astro. It's tuned for a recent iPad.

## Features

- Arrows on each side of the resource, health and sanity icons lower or raise the value (0–99). Defaults are 5 resources, 7 health, 8 sanity.
- A campaign log (book button, bottom left) with undo and redo. Taps on the same stat within 3 seconds merge into one entry.
- Reset lives in the campaign log and asks for confirmation first. It restores the defaults, clears the log, and deletes the saved cookies.
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
