// Regenerates assets/img/og-image.png from scripts/og-template.html, which
// reads the same data/profile.json as the site.
import path from 'node:path';
import fs from 'node:fs';
import { listen, ROOT } from './server.mjs';
import { screenshot } from './chrome.mjs';

async function main() {
  const outPath = path.join(ROOT, 'assets/img/og-image.png');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  console.log('Starting local server…');
  const { server, url } = await listen();

  try {
    console.log('Rendering OG image…');
    await screenshot(`${url}/scripts/og-template.html`, outPath, {
      width: 1200,
      height: 630,
      virtualTimeBudget: 15000
    });
    const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`\n  ✔ OG image written to ${path.relative(ROOT, outPath)} (${sizeKb} KB)\n`);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error('\n  ✖ Failed to generate OG image:\n');
  console.error(err.message || err);
  process.exit(1);
});
