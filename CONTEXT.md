# Portfolio

Smart's personal portfolio site — a single scrollable page presenting who he is, his photos, and how to reach him.

## Language

**Restyle**:
A change to the site's visual layer only. The architecture (hand-authored HTML, SCSS, vanilla JS) and the page copy are untouched.
_Avoid_: Rebuild, rewrite, redesign (when only visuals change)

**Minimal Dark**:
The site's visual identity: a dark, whitespace-heavy design where typography and the photos carry the visual interest. Dark is the default; a header toggle switches to a light variant and the choice persists per visitor. (Supersedes the earlier "Minimal Light" light-only identity.)
_Avoid_: Modern (too vague), Minimal Light (the old default)

**Mobile-First**:
The phone experience is the primary design target; desktop is the adaptation. Visitors arrive mostly from social apps on phones.
_Avoid_: Responsive (that's the mechanism, not the priority)

**Accent**:
The single muted green used sparingly to mark interactive and active states (links, anchor hovers, active filter). There is exactly one accent, rendered lighter on the dark theme for contrast.
_Avoid_: Secondary color, highlight color, neon green

**Section**:
One of the four scroll destinations on the single page: Home (the Hero), About, Gallery, Contact. Reached by scrolling or by an anchor link in the header. Scrolling is the primary navigation; anchors are shortcuts.
_Avoid_: Page (the site no longer has separate pages), screen, view

**Hero**:
The opening Section: the greeting and the social icons. Kept compact so the Gallery peeks above the fold — the photos directly beneath it provide the photographic half of Minimal Dark.
_Avoid_: Banner, splash, jumbotron

**Bio**:
The self-description in the About Section. Deliberately short: profession first (Full-Stack Engineer), then what he loves (singing, gaming, anime). Detail lives on GitHub and in the education cards, not here.
_Avoid_: Profile, intro

**Gallery**:
The photo showcase Section. Each image has exactly one category, defined in the gallery's image metadata. Photos are shown clean: the grid has no text on the images, and a caption appears in the lightbox only when it's a real title (camera filenames like "IMG 1026" are hidden). Browsing uses lightweight thumbnails; the lightbox shows the full image.
_Avoid_: Album (as a term for the whole Section)

**Category**:
A grouping of gallery images that the visitor can filter by (currently Portrait, Daily, Events, Travel). A photo's category is whatever folder it was published from — one per photo, and the set is open.
_Avoid_: Tag, album, collection

**Publishing**:
Adding photos to the Gallery: edited exports are dropped into a category folder and published with one command. Captions come from filenames; nobody writes metadata by hand.
_Avoid_: Uploading (nothing is uploaded anywhere yet — see ADR-0002)
