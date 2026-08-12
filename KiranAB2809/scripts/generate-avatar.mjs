// Crops + background-removes + composites assets/img/avatar-source.* onto a
// studio-style gradient backdrop, saving the result to assets/img/avatar.jpg.
//
// If no source photo exists, this exits cleanly with instructions rather
// than failing — the site already falls back to a monogram automatically.
import path from 'node:path';
import fs from 'node:fs';
import { listen, ROOT } from './server.mjs';
import { runChrome, findChrome } from './chrome.mjs';

const SOURCE_CANDIDATES = ['avatar-source.jpg', 'avatar-source.jpeg', 'avatar-source.png'];

async function main() {
  const imgDir = path.join(ROOT, 'assets/img');
  const source = SOURCE_CANDIDATES.map((f) => path.join(imgDir, f)).find((p) => fs.existsSync(p));

  if (!source) {
    console.log(
      '\n  No source photo found.\n\n' +
      '  Put a photo at assets/img/avatar-source.jpg (or .png) and re-run `npm run avatar`.\n' +
      '  Until then, the hero will show a styled monogram instead — nothing is broken.\n'
    );
    return;
  }

  findChrome(); // fail fast with a clear message if Chrome isn't installed

  const rawPng = path.join(ROOT, '.tmp-avatar.png');
  fs.mkdirSync(path.dirname(rawPng), { recursive: true });

  console.log('Starting local server…');
  const { server, url } = await listen();

  try {
    const srcName = path.basename(source);
    const templateUrl = `${url}/scripts/avatar-template.html?src=../assets/img/${encodeURIComponent(srcName)}`;

    console.log('Rendering portrait (crop, background removal, compositing)…');
    await runChrome([
      '--screenshot=' + rawPng,
      '--window-size=800,1000',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=30000', // generous headroom: this loads a WASM model from a CDN
      templateUrl
    ], { timeoutMs: 50000 });

    if (!fs.existsSync(rawPng)) {
      throw new Error('Chrome did not produce a screenshot.');
    }

    const outPath = path.join(imgDir, 'avatar.jpg');
    await reencodeToJpeg(rawPng, outPath);
    fs.unlinkSync(rawPng);

    const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`\n  ✔ Portrait written to assets/img/avatar.jpg (${sizeKb} KB)\n`);
  } finally {
    server.close();
  }
}

// Re-encodes the Chrome screenshot (PNG) to a smaller JPEG using whatever
// image tool is already on the machine — no npm dependency added. Tries
// ImageMagick/GraphicsMagick (mac/Linux), then a PowerShell System.Drawing
// call (Windows), then Python+Pillow if present. If none are available,
// falls back to copying the PNG bytes as-is: browsers render it fine
// regardless of the .jpg extension, it just won't be as compact.
async function reencodeToJpeg(pngPath, outPath) {
  const { spawnSync } = await import('node:child_process');
  const attempts = [
    () => spawnSync('convert', [pngPath, '-quality', '82', outPath]),
    () => spawnSync('gm', ['convert', pngPath, '-quality', '82', outPath]),
    () => spawnSync('powershell', ['-NoProfile', '-Command',
      `Add-Type -AssemblyName System.Drawing; ` +
      `$img = [System.Drawing.Image]::FromFile('${pngPath}'); ` +
      `$img.Save('${outPath}', [System.Drawing.Imaging.ImageFormat]::Jpeg); $img.Dispose()`]),
    () => spawnSync('python3', ['-c',
      `from PIL import Image; Image.open(r"${pngPath}").convert("RGB").save(r"${outPath}", quality=82)`])
  ];
  for (const attempt of attempts) {
    try {
      const result = attempt();
      if (result.status === 0 && fs.existsSync(outPath)) return;
    } catch (e) { /* tool not installed — try the next one */ }
  }
  console.warn(
    '  (Optional) No image conversion tool found (ImageMagick/PowerShell/Pillow).\n' +
    '  Copying the screenshot as-is — it will display fine, just larger than ~100KB.\n'
  );
  fs.copyFileSync(pngPath, outPath);
}

main().catch((err) => {
  console.error('\n  ✖ Failed to generate the portrait:\n');
  console.error(err.message || err);
  process.exit(1);
});
