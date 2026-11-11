# Single-page architecture

The site was four hand-authored HTML pages (Home, About, Gallery, Contact) sharing a duplicated header. When we made the site mobile-first (2026-06), we collapsed it into one scrollable page: visitors arrive from social apps on phones, where scrolling is the native gesture and the content (a hero, a bio, 18 photos, three contact links) fits in a few screens. With no templating engine, one page also ends the four-way duplication of every header change.

## Considered Options

- **Keep four pages + a mobile tab bar** — rejected: solves thumb reach but keeps the duplication and still asks social-app visitors to make navigation decisions.
- **Hybrid (one-pager + separate gallery page)** — rejected: at 18 thumbnails the gallery is light enough to inline; revisit if the gallery grows to hundreds of photos.

## Consequences

- The old URLs (`about.html`, `gallery.html`, `contact.html`) are live and indexed, so they remain as meta-refresh redirect stubs pointing at `index.html#<section>`. Don't delete them.
- Google Analytics page views collapse into one page.
- The Film Strip (a drifting photo row added to the hero in the multi-page era to advertise the gallery) was removed — the gallery itself now sits one scroll below the hero.
