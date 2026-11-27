// Gobble Run — make.fun turkey-run-game-01 entry point (Node 22, standard library only).
//
// The game lives in game/ as plain static files (game/index.html plus its ES modules,
// no library, no network request). This program hands it in: it copies game/ and
// screenshots/ from beside this file into the output directory and writes
// /output/dossier.json with buildDossier from the vendored make.fun library.
//
// Outside the grader MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameDir = join(here, 'game');
const shotsDir = join(here, 'screenshots');
if (!existsSync(join(gameDir, 'index.html'))) {
  throw new Error('game/index.html is missing; cannot hand in an entry without a game');
}

mkdirSync(out, { recursive: true });
cpSync(gameDir, join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the dossier bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files in game/ or 48 MiB of game files in all, or a path
// under game/ over 1000 bytes).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);

const shotCount = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((f) => !f.startsWith('.')).length
  : 0;
console.log(
  `Gobble Run handed in: ${statSync(join(out, 'dossier.json')).size} byte dossier, ` +
    `${shotCount} screenshot(s) -> ${out}`,
);
