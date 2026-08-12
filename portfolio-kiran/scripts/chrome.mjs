// Locates an installed Chrome / Edge / Chromium binary and drives it in
// headless mode via child_process — no puppeteer/playwright dependency.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';

const CANDIDATES = {
  win32: [
    'C\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ],
  linux: [
    '/opt/google/chrome/chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable',
    '/snap/bin/chromium'
  ]
};

export function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const platform = os.platform();
  const paths = CANDIDATES[platform] || [];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    'Could not find a Chrome / Edge / Chromium install.\n' +
    'Set the CHROME_PATH environment variable to the full path of your browser executable, e.g.\n' +
    '  CHROME_PATH="/path/to/chrome" npm run pdf'
  );
}

// Runs Chrome headless with the given CLI flags and resolves when it exits.
export function runChrome(args, { timeoutMs = 45000 } = {}) {
  const bin = findChrome();
  return new Promise((resolve, reject) => {
    const child = spawn(bin, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      ...args
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Chrome timed out after ${timeoutMs}ms.\nstderr:\n${stderr}`));
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`Chrome exited with code ${code}\nstderr:\n${stderr}`));
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export async function printToPdf(url, outPath, { virtualTimeBudget = 30000 } = {}) {
  await runChrome([
    '--print-to-pdf=' + outPath,
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=' + virtualTimeBudget,
    url
  ], { timeoutMs: virtualTimeBudget + 20000 });
}

export async function screenshot(url, outPath, { width = 1280, height = 800, virtualTimeBudget = 30000 } = {}) {
  await runChrome([
    '--screenshot=' + outPath,
    `--window-size=${width},${height}`,
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=' + virtualTimeBudget,
    url
  ], { timeoutMs: virtualTimeBudget + 20000 });
}
