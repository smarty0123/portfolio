# Phased gallery scaling

The owner may grow the Gallery toward photographer volume (potentially 10k+ images), but the number is not yet real. GitHub Pages caps a published site at 1 GB, which the current in-repo originals would hit around 3–4k images — so a full 10k gallery cannot live in this repo, ever. We decided to phase the cost: build the cheap halves now and defer external storage until the count approaches ~2k.

Done now:

- **Folder-based publishing** (`npm run photos`): photos dropped into `incoming/<Category>/` get their category from the folder and caption from the filename; the script generates the thumbnail and merges `images.json`. This removed the hand-edited-JSON workflow, which was the owner's actual pain.
- **Paginated rendering**: the grid renders in batches of 24 via IntersectionObserver — this is why an 18-image gallery has pagination code. It exists so the frontend never needs to change when the manifest grows.

- **Responsive lightbox sizes** (2026-11): the lightbox no longer loads the 6000px original (up to 7 MB on a phone). Each photo also gets 1600px and 3000px JPEGs at quality 90, chosen via `srcset`, so it stays pixel-sharp on phones and retina desktops; the untouched original is linked as "View original". Originals were deliberately *not* downsized — the owner wants visitors to see photos sharp. Cost: storage per photo grows ~1.3× (current 15 photos: 71 MB originals + 22 MB derivatives), which pulls the ~1 GB ceiling slightly closer (roughly 2.5–3k images instead of 3–4k).

- **Width-based thumbnails** (2026-11): thumbs were 480px on the *long* edge, which left portraits only 320px wide — soft in a phone column at 3× density. Thumbs are now 480px and 960px *wide*, chosen via `srcset`. Cost: about 0.2 MB more per photo (15 photos: 0.6 MB → 3.4 MB of thumbs).

Deferred until ~2k images: move image bytes to object storage + CDN (e.g. Cloudflare R2; zero egress fees, laptop-friendly CLI upload that slots into the same publish script). At that point only the image URL prefix changes — the rendering already scales.

## Considered Options

- **Object storage immediately** — rejected: infrastructure for a hypothetical; the 10k import isn't scheduled.
- **Photo platform (Flickr/SmugMug) as the archive** — rejected for now: the owner publishes from a laptop after editing and wants the site itself to be the gallery. Revisit if phone-upload ever becomes the workflow.
- **Accept a curated-only cap** — rejected: contradicts the stated requirement (easy bulk publishing).
