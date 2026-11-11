// Shared image derivation for the gallery (macOS `sips`).
// For each original in dist/gallery/ we publish:
//   thumbs/<file>        480px wide — grid
//   thumbs/960/<file>    960px wide — grid on high-DPR / wide columns
//   large/1600/<file>    1600px — lightbox on phones
//   large/3000/<file>    3000px — lightbox on large/retina screens
// The original stays untouched and is linked as "View original".
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const GALLERY = path.join(ROOT, "dist", "gallery");
const MANIFEST = path.join(GALLERY, "images.json");
// Thumbs are sized by WIDTH (the grid's columns are width-constrained), so
// portrait photos stay as sharp as landscape ones. 480 is the base; 960 serves
// high-DPR phones and desktop columns via srcset.
const THUMB_WIDTH = 480;
const THUMB_WIDTH_2X = 960;
const LARGE_SIZES = [1600, 3000];
const LARGE_QUALITY = "90"; // visually lossless at display size

function sips(args) {
  return execFileSync("sips", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

function dims(file) {
  const out = sips(["-g", "pixelWidth", "-g", "pixelHeight", path.join(GALLERY, file)]);
  const w = Number(/pixelWidth:\s*(\d+)/.exec(out)[1]);
  const h = Number(/pixelHeight:\s*(\d+)/.exec(out)[1]);
  return { w, h };
}

// Resize to `size` on the long edge (or on the width when `byWidth`) — never
// upscale a smaller original.
function resize(file, size, outDir, quality, byWidth) {
  fs.mkdirSync(outDir, { recursive: true });
  const src = path.join(GALLERY, file);
  const { w, h } = dims(file);
  if ((byWidth ? w : Math.max(w, h)) <= size) {
    fs.copyFileSync(src, path.join(outDir, file));
    return;
  }
  const args = [byWidth ? "--resampleWidth" : "-Z", String(size)];
  if (quality) args.push("-s", "formatOptions", quality);
  sips([...args, src, "--out", outDir]);
}

// Generate every derivative for one original; returns its dimensions for the manifest.
function derive(file) {
  resize(file, THUMB_WIDTH, path.join(GALLERY, "thumbs"), null, true);
  resize(file, THUMB_WIDTH_2X, path.join(GALLERY, "thumbs", "960"), null, true);
  for (const size of LARGE_SIZES) {
    resize(file, size, path.join(GALLERY, "large", String(size)), LARGE_QUALITY);
  }
  return dims(file);
}

const readManifest = () => JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const writeManifest = (m) => fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n");

module.exports = { GALLERY, ROOT, derive, readManifest, writeManifest };
