#!/usr/bin/env node
// One-off repair: regenerate thumbnails + lightbox sizes for every photo in the
// manifest and backfill width/height. `npm run photos` handles new photos.
const { derive, readManifest, writeManifest } = require("./images");

const manifest = readManifest();
for (const img of manifest) {
  Object.assign(img, derive(img.file));
  console.log(`rebuilt: ${img.file}  ${img.w}×${img.h}`);
}
writeManifest(manifest);
console.log(`\n${manifest.length} photo(s) rebuilt.`);
