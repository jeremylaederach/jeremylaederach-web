// Renders the raster brand files from the one drawing of the mark, public/brand/mark.svg: the
// favicon, the app icons and the link preview. A headless Chromium browser takes the pictures.
// Edge and Chrome are found in their usual places; BROWSER_PATH names another one.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const mark = readFileSync(join(root, 'public/brand/mark.svg'), 'utf8');
const font = pathToFileURL(join(root, 'resources/fonts/instrument-sans-latin-wght-normal.woff2'));
const ground = '#07070a';
const ink = '#f4f1ea';
const muted = '#aaa6af';

// An icon is the mark in the middle of a square, at this share of its width.
const icon = (background, share) => `
    <body style="display: grid; place-items: center; background: ${background}">
        <div style="width: ${share * 100}vw">${mark}</div>
    </body>`;

const linkPreview = `
    <style>
        @font-face { font-family: 'Instrument Sans'; font-weight: 400 700; src: url('${font}') format('woff2'); }
        body { display: grid; place-content: center; justify-items: center; background: ${ground};
            color: ${ink}; font-family: 'Instrument Sans'; }
        div { width: 208px; }
        h1 { margin: 44px 0 0; font-size: 72px; font-weight: 560; line-height: 1; letter-spacing: -0.02em; }
        p { margin: 28px 0 0; color: ${muted}; font-size: 27px; line-height: 1; }
    </style>
    <body>
        <div>${mark}</div>
        <h1>Jeremy Läderach</h1>
        <p>jeremylaederach.ch</p>
    </body>`;

const pictures = [
    { file: 'public/brand/icons/favicon-64.png', width: 64, height: 64, body: icon('transparent', 1) },
    { file: 'public/brand/icons/apple-touch-180.png', width: 180, height: 180, body: icon(ground, 0.72) },
    { file: 'public/brand/icons/app-192.png', width: 192, height: 192, body: icon(ground, 0.72) },
    { file: 'public/brand/icons/app-512.png', width: 512, height: 512, body: icon(ground, 0.72) },
    { file: 'public/brand/link-preview.png', width: 1200, height: 630, body: linkPreview },
];

const browser = [
    process.env.BROWSER_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
].find((path) => path && existsSync(path));

if (!browser) {
    throw new Error('No Chromium browser found. Set BROWSER_PATH to Edge, Chrome or Chromium.');
}

const workspace = mkdtempSync(join(tmpdir(), 'render-brand-'));

try {
    for (const { file, width, height, body } of pictures) {
        const page = join(workspace, 'page.html');

        writeFileSync(page, `<!doctype html>
            <meta charset="utf-8">
            <style>html, body { height: 100%; margin: 0; overflow: hidden; } svg { display: block; width: 100%; height: auto; }</style>
            ${body}`);
        execFileSync(browser, [
            '--headless',
            '--disable-gpu',
            '--hide-scrollbars',
            '--force-device-scale-factor=1',
            '--default-background-color=00000000',
            '--virtual-time-budget=2000',
            `--user-data-dir=${join(workspace, 'profile')}`,
            `--window-size=${width},${height}`,
            `--screenshot=${join(root, file)}`,
            pathToFileURL(page).href,
        ], { stdio: 'ignore' });
        console.log(`${file} (${width} by ${height})`);
    }
} finally {
    rmSync(workspace, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
