// Gobble Run — main loop and state machine. States: title → playing →
// caught | escaped, with pause. The turkey auto-runs; the player jumps,
// slides and hides while the farmer closes in on every stumble.

import { CONFIG, speedAt, spawnGapAt } from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { World } from './world.js';
import { makeObstacle, spawnPick, updateObstacle, obstacleBox, boxesOverlap, drawObstacle } from './obstacles.js';
import { drawHud, drawTitle, drawEnd, drawPaused } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const sounds = new SoundBank();
const input = new Input(canvas);

class Game {
  constructor() {
    this.world = new World(window.innerWidth, window.innerHeight);
    this.turkey = new Turkey(this.world.groundY);
    this.farmer = new Farmer();
    this.state = 'title';
    this.paused = false;
    this.distance = 0;
    this.score = 0;
    this.corn = 0;
    this.lives = CONFIG.LIVES;
    this.obstacles = [];
    this.spawnTimer = 1.1;
    this.stumbleFlash = false;
    this.escaped = false;
    this.best = 0;
    try { this.best = Number(window.localStorage.getItem('gobble-run-best') || 0) || 0; } catch { this.best = 0; }
    this.shotMode = new URLSearchParams(window.location.search).get('shot');
    this.announced = '';
  }

  resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.world.resize(window.innerWidth, window.innerHeight);
    this.turkey.groundY = this.world.groundY;
    if (this.turkey.onGround) this.turkey.y = this.world.groundY;
  }

  startRun() {
    this.distance = 0;
    this.score = 0;
    this.corn = 0;
    this.lives = CONFIG.LIVES;
    this.obstacles = [];
    this.spawnTimer = 1.0;
    this.turkey.reset(this.world.groundY);
    this.farmer.reset();
    this.state = 'playing';
    this.escaped = false;
    sounds.startMusic();
    sounds.gobble();
    this.announce('Run! Jump the ovens, slide under the knives, and reach the forest gate.');
  }

  announce(text) {
    if (text === this.announced) return;
    this.announced = text;
    statusEl.textContent = text;
  }

  endRun(escaped) {
    this.state = escaped ? 'escaped' : 'caught';
    this.escaped = escaped;
    sounds.stopMusic();
    if (escaped) sounds.fanfare();
    if (this.score > this.best) {
      this.best = Math.floor(this.score);
      try { window.localStorage.setItem('gobble-run-best', String(this.best)); } catch { /* storage unavailable */ }
    }
    this.announce(escaped
      ? `You escaped! Score ${Math.floor(this.score)}. Press space to run again.`
      : `Caught! Score ${Math.floor(this.score)}, distance ${Math.floor(this.distance)} metres. Press space to run again.`);
  }

  loseLife() {
    this.lives -= 1;
    if (this.lives <= 0) this.endRun(false);
  }

  spawnAhead() {
    const kind = spawnPick(this.distance, Math.random);
    const x = window.innerWidth + 80 + Math.random() * 120;
    this.obstacles.push(makeObstacle(kind, x, this.world.groundY));
    // Corn often travels in a little trail after a hazard.
    if (kind === 'oven' || kind === 'fence') {
      for (let i = 1; i <= 2; i++) {
        this.obstacles.push(makeObstacle('corn', x + i * 60, this.world.groundY));
      }
    }
  }

  update(dt) {
    if (this.state !== 'playing' || this.paused) return;
    const speed = speedAt(this.distance);
    this.distance += (speed * dt) / 9; // ~9 px per metre
    this.score += speed * dt * 0.11; // distance points accrue smoothly; shown floored
    this.world.update(dt, speed);

    // Spawning.
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnAhead();
      this.spawnTimer = spawnGapAt(this.distance) * (0.8 + Math.random() * 0.5);
    }

    // Player actions.
    if (input.consumeJump()) this.turkey.jump(sounds);
    if (input.consumeHide()) {
      const nearHay = this.obstacles.some((o) => o.kind === 'hay' && Math.abs(o.x - this.turkey.x) < 110);
      if (nearHay && this.turkey.hide(sounds)) this.announce('Hidden in the haystack! The farmer is searching...');
    }
    this.turkey.update(dt, input.isSliding(), sounds);

    // Hazards and pickups.
    const tBox = this.turkey.box();
    let stumbled = false;
    this.obstacles = this.obstacles.filter((o) => updateObstacle(o, dt, speed));
    for (const o of this.obstacles) {
      if (o.hit || o.passed) continue;
      if (o.kind === 'corn') {
        if (boxesOverlap(tBox, obstacleBox(o))) {
          o.hit = true;
          this.corn += 1;
          this.score += CONFIG.CORN_SCORE;
          sounds.corn();
        }
        continue;
      }
      if (o.kind === 'hay') continue; // haystacks never hurt; they hide you
      if (o.x + 40 < this.turkey.x - 30) { o.passed = true; continue; }
      if (!this.turkey.hidden && boxesOverlap(tBox, obstacleBox(o))) {
        o.hit = true;
        stumbled = this.turkey.stumble(sounds);
        if (stumbled) {
          if (o.kind === 'oven') sounds.ovenRoar();
          if (o.kind === 'knife' || o.kind === 'knifeThrow') sounds.knifeWhoosh();
          this.loseLife();
          this.announce(`Ouch! ${this.lives} ${this.lives === 1 ? 'life' : 'lives'} left — the farmer is closing in!`);
        }
      }
    }

    // The farmer: gains on every stumble, falls behind on clean running.
    const wasClose = this.farmer.gap < 110;
    this.farmer.update(dt, this.turkey.hidden, stumbled, !stumbled);
    if (this.farmer.gap < 110 && !wasClose) sounds.spotted();
    if (this.farmer.caught) { this.endRun(false); return; }
    if (this.distance >= CONFIG.ESCAPE_DISTANCE) { this.endRun(true); return; }
  }

  draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.world.draw(ctx, this.distance);
    // Obstacles behind the turkey, haystack in front when hiding.
    for (const o of this.obstacles) {
      if (o.kind === 'hay' && this.turkey.hidden) continue;
      drawObstacle(ctx, o);
    }
    this.farmer.draw(ctx, this.world.groundY);
    this.turkey.draw(ctx);
    for (const o of this.obstacles) {
      if (o.kind === 'hay' && this.turkey.hidden) drawObstacle(ctx, o);
    }
    if (this.state === 'playing') {
      drawHud(ctx, { score: Math.floor(this.score), distance: this.distance, lives: this.lives, farmerGap: this.farmer.gap }, w);
    } else if (this.state === 'title') {
      drawTitle(ctx, w, h, this.best);
    } else if (this.state === 'caught' || this.state === 'escaped') {
      drawEnd(ctx, w, h, { score: Math.floor(this.score), distance: this.distance, corn: this.corn, best: this.best }, this.escaped);
    }
    if (this.paused && this.state === 'playing') drawPaused(ctx, w, h);
  }
}

const game = new Game();
game.resize();
window.addEventListener('resize', () => game.resize());
window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyM') {
    sounds.unlock();
    const muted = sounds.toggleMute();
    game.announce(muted ? 'Sound muted.' : 'Sound on.');
  }
  if (event.code === 'KeyP' && game.state === 'playing') {
    game.paused = !game.paused;
    game.announce(game.paused ? 'Paused.' : 'Running!');
  }
});

// Screenshot staging (?shot=...) poses the game before the first frame.
if (game.shotMode) applyShot(game, game.shotMode);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  sounds.unlock();
  if (game.state === 'title') {
    game.world.update(dt, 60);
    if (input.consumeAction() || input.consumeClick()) game.startRun();
  } else if (game.state === 'caught' || game.state === 'escaped') {
    if (input.consumeAction() || input.consumeClick()) game.startRun();
  } else {
    game.update(dt);
  }
  // Drain stale clicks so a title click never leaks into the run.
  if (game.state === 'playing') input.consumeClick();
  game.draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
