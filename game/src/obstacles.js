// Hazards and pickups: the oven (flame jets to jump), the carving knife
// (swings low — slide under it, or jump its thrown arc), fences to hop,
// haystacks to hide in, and corn to gobble for points.

import { CONFIG, speedAt } from './config.js';

let nextId = 1;

export function makeObstacle(kind, x, groundY) {
  const base = { id: nextId++, kind, x, groundY, passed: false, hit: false, phase: Math.random() * Math.PI * 2 };
  if (kind === 'oven') return { ...base, w: 74, h: 96, flame: 0 };
  if (kind === 'knife') return { ...base, w: 58, h: 70, swing: 0 };
  if (kind === 'knifeThrow') return { ...base, w: 46, h: 26, vy: -260, y: groundY - 90 };
  if (kind === 'fence') return { ...base, w: 26, h: 58 };
  if (kind === 'hay') return { ...base, w: 78, h: 62 };
  if (kind === 'corn') return { ...base, w: 30, h: 34, bob: 0 };
  return base;
}

export function spawnPick(distance, rand) {
  const r = rand();
  if (r < 0.34) return 'corn';
  if (r < 0.52) return 'hay';
  if (distance < 120) return 'corn';
  if (r < 0.72) return 'oven';
  if (r < 0.86) return 'knife';
  if (r < 0.94) return 'fence';
  return 'knifeThrow';
}

export function updateObstacle(o, dt, speed) {
  o.x -= speed * dt;
  o.phase += dt * 4;
  if (o.kind === 'oven') o.flame = 0.5 + 0.5 * Math.sin(o.phase * 1.6);
  if (o.kind === 'knife') o.swing = Math.sin(o.phase * 1.4);
  if (o.kind === 'knifeThrow') {
    o.vy += 1400 * dt;
    o.y += o.vy * dt;
    if (o.y > o.groundY - 20) { o.y = o.groundY - 20; o.vy = -Math.abs(o.vy) * 0.45; }
  }
  if (o.kind === 'corn') o.bob = Math.sin(o.phase) * 4;
  return o.x > -140;
}

export function obstacleBox(o) {
  if (o.kind === 'oven') return { x: o.x - 34, y: o.groundY - 96 - o.flame * 26, w: 68, h: 96 + o.flame * 26 };
  if (o.kind === 'knife') return { x: o.x - 26, y: o.groundY - 70 + Math.max(0, o.swing) * 12, w: 52, h: 58 };
  if (o.kind === 'knifeThrow') return { x: o.x - 20, y: o.y - 12, w: 40, h: 22 };
  if (o.kind === 'fence') return { x: o.x - 11, y: o.groundY - 58, w: 22, h: 58 };
  if (o.kind === 'corn') return { x: o.x - 14, y: o.groundY - 86 + o.bob, w: 28, h: 30 };
  if (o.kind === 'hay') return { x: o.x - 38, y: o.groundY - 62, w: 76, h: 62 };
  return { x: o.x, y: o.groundY, w: 10, h: 10 };
}

export function boxesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function drawObstacle(ctx, o) {
  const gy = o.groundY;
  ctx.save();
  if (o.kind === 'oven') {
    // A squat iron oven with a roaring flame jet on top.
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.roundRect(o.x - 37, gy - 62, 74, 62, 6); ctx.fill();
    ctx.fillStyle = '#555555';
    ctx.fillRect(o.x - 30, gy - 52, 60, 30);
    ctx.fillStyle = '#ff8c1a';
    ctx.fillRect(o.x - 22, gy - 44, 44, 16);
    ctx.fillStyle = '#222222';
    ctx.beginPath(); ctx.arc(o.x - 18, gy - 14, 3, 0, Math.PI * 2); ctx.arc(o.x + 18, gy - 14, 3, 0, Math.PI * 2); ctx.fill();
    const fh = 34 + o.flame * 34;
    const grad = ctx.createLinearGradient(0, gy - 62, 0, gy - 62 - fh);
    grad.addColorStop(0, '#ffdd33');
    grad.addColorStop(0.6, '#ff7b1c');
    grad.addColorStop(1, '#e63900');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(o.x - 16, gy - 62);
    ctx.quadraticCurveTo(o.x - 22, gy - 62 - fh * 0.7, o.x, gy - 62 - fh);
    ctx.quadraticCurveTo(o.x + 22, gy - 62 - fh * 0.7, o.x + 16, gy - 62);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OVEN!', o.x, gy - 62 - fh - 8);
  } else if (o.kind === 'knife') {
    // A carving knife on a swinging stand: slide under the blade.
    ctx.strokeStyle = '#7a5a2e';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(o.x, gy); ctx.lineTo(o.x, gy - 66); ctx.stroke();
    ctx.save();
    ctx.translate(o.x, gy - 66);
    ctx.rotate(o.swing * 0.55);
    ctx.fillStyle = '#dfe6ea';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(44, 6); ctx.lineTo(44, 14); ctx.lineTo(0, 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-18, 0, 18, 10);
    ctx.restore();
  } else if (o.kind === 'knifeThrow') {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(0.6);
    ctx.fillStyle = '#dfe6ea';
    ctx.beginPath(); ctx.moveTo(-22, -4); ctx.lineTo(16, -4); ctx.lineTo(24, 0); ctx.lineTo(16, 4); ctx.lineTo(-22, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-30, -4, 10, 8);
    ctx.restore();
  } else if (o.kind === 'fence') {
    ctx.fillStyle = '#8a5a28';
    ctx.fillRect(o.x - 13, gy - 58, 6, 58);
    ctx.fillRect(o.x + 7, gy - 58, 6, 58);
    ctx.fillRect(o.x - 16, gy - 50, 32, 6);
    ctx.fillRect(o.x - 16, gy - 28, 32, 6);
  } else if (o.kind === 'hay') {
    // A haystack: press H beside it to hide from the farmer.
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.moveTo(o.x - 39, gy);
    ctx.quadraticCurveTo(o.x - 34, gy - 58, o.x, gy - 62);
    ctx.quadraticCurveTo(o.x + 34, gy - 58, o.x + 39, gy);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b07f22';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(o.x + i * 12, gy - 58 + Math.abs(i) * 8);
      ctx.lineTo(o.x + i * 14, gy - 8);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDE: H', o.x, gy - 72);
  } else if (o.kind === 'corn') {
    const y = gy - 72 + o.bob;
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath(); ctx.ellipse(o.x, y, 11, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(o.x + i * 5, y - 13); ctx.lineTo(o.x + i * 5, y + 13); ctx.stroke();
    }
    ctx.fillStyle = '#4e9b47';
    ctx.beginPath(); ctx.moveTo(o.x - 10, y + 8); ctx.lineTo(o.x, y + 22); ctx.lineTo(o.x + 10, y + 8); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function speedFor(distance) { return speedAt(distance); }
export function gapFor(distance) { return spawnGapAt(distance); }
export function configLives() { return CONFIG.LIVES; }
