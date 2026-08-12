// Regenerates the resume PDF from data/profile.json.
// 1. Starts the static server (needed because fetch() is blocked on file://).
// 2. Prints resume.html to PDF with headless Chrome.
// 3. Saves it to assets/resume/<file-named-in-profile.json>.
import path from 'node:path';
import fs from 'node:fs';
import { listen, ROOT } from './server.mjs';
import { printToPdf } from './chrome.mjs';

async function main() {
  const profile = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/profile.json'), 'utf8'));
  const resumeFile = profile.profile.resumeFile; // e.g. assets/resume/Kiran_AB_Resume.pdf
  const outPath = path.join(ROOT, resumeFile);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  console.log('Starting local server…');
  const { server, url } = await listen();

  try {
    console.log('Printing resume.html to PDF…');
    await printToPdf(`${url}/resume.html?print=0`, outPath, { virtualTimeBudget: 15000 });
    const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`\n  ✔ Resume PDF written to ${path.relative(ROOT, outPath)} (${sizeKb} KB)\n`);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error('\n  ✖ Failed to generate resume PDF:\n');
  console.error(err.message || err);
  process.exit(1);
});
