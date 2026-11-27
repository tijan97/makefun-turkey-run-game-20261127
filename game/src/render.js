// Screens and HUD: the title screen, the in-run HUD (score, distance, lives,
// farmer gap, stage), and the caught / escaped end screens with restart.

import { CONFIG, stageAt } from './config.js';

export function drawHud(ctx, state, width) {
  const stage = stageAt(state.distance);
  ctx.save();
  // Top bar.
  ctx.fillStyle = 'rgba(43,26,14,0.82)';
  ctx.beginPath(); ctx.roundRect(12, 12, width - 24, 54, 12); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${state.score}`, 28, 48);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`${Math.floor(state.distance)} m  ·  ${stage.name}`, 260, 47);
  // Lives as hearts.
  for (let i = 0; i < CONFIG.LIVES; i++) {
    const hx = width - 150 + i * 34;
    const hy = 39;
    ctx.fillStyle = i < state.lives ? '#e63946' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 6);
    ctx.bezierCurveTo(hx - 11, hy - 6, hx - 5, hy - 14, hx, hy - 6);
    ctx.bezierCurveTo(hx + 5, hy - 14, hx + 11, hy - 6, hx, hy + 6);
    ctx.fill();
  }
  // Farmer gap meter: how close the farmer is behind the turkey.
  const gapT = Math.max(0, Math.min(1, state.farmerGap / 420));
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath(); ctx.roundRect(28, 74, 220, 14, 7); ctx.fill();
  ctx.fillStyle = gapT > 0.45 ? '#4caf50' : gapT > 0.2 ? '#ffb703' : '#e63946';
  ctx.beginPath(); ctx.roundRect(28, 74, 220 * gapT, 14, 7); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(state.farmerGap < 110 ? 'THE FARMER IS RIGHT BEHIND YOU!' : 'Farmer distance', 260, 86);
  // Controls hint.
  ctx.font = '15px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'right';
  ctx.fillText('SPACE / CLICK jump ×2  ·  ↓ slide  ·  H hide in hay  ·  M mute', width - 28, 86);
  ctx.restore();
}

function panel(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = 'rgba(43,26,14,0.78)';
  ctx.beginPath(); ctx.roundRect(width / 2 - 330, height / 2 - 190, 660, 380, 20); ctx.fill();
  ctx.strokeStyle = '#f6b352';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

export function drawTitle(ctx, width, height, best) {
  panel(ctx, width, height);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f6b352';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('GOBBLE RUN', width / 2, height / 2 - 110);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText("A turkey's Thanksgiving escape", width / 2, height / 2 - 66);
  ctx.font = '19px sans-serif';
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText('The farmer wants you for dinner. Outrun him from the', width / 2, height / 2 - 18);
  ctx.fillText('farmyard, through the barn, past the kitchen oven — and', width / 2, height / 2 + 10);
  ctx.fillText('reach the forest gate 1500 m away to escape!', width / 2, height / 2 + 38);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('SPACE / CLICK — jump (twice for a flap)    ↓ — slide under knives', width / 2, height / 2 + 82);
  ctx.fillText('H — hide in a haystack    Grab corn for points    Dodge ovens & knives', width / 2, height / 2 + 110);
  ctx.fillStyle = '#f6b352';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('▶  CLICK OR PRESS SPACE TO RUN', width / 2, height / 2 + 156);
  if (best > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Best escape so far: ${best} points`, width / 2, height / 2 + 182);
  }
  ctx.restore();
}

export function drawEnd(ctx, width, height, state, escaped) {
  panel(ctx, width, height);
  ctx.save();
  ctx.textAlign = 'center';
  if (escaped) {
    ctx.fillStyle = '#7ee787';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText('YOU ESCAPED!', width / 2, height / 2 - 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.fillText('The turkey slipped through the forest gate —', width / 2, height / 2 - 56);
    ctx.fillText('no Thanksgiving dinner this year. Gobble gobble!', width / 2, height / 2 - 26);
  } else {
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText('CAUGHT!', width / 2, height / 2 - 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.fillText('The farmer grabbed you by the drumstick...', width / 2, height / 2 - 56);
    ctx.fillText('The oven was already warm. Better luck next run!', width / 2, height / 2 - 26);
  }
  ctx.fillStyle = '#f6b352';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`Score ${state.score}   ·   Distance ${Math.floor(state.distance)} m   ·   Corn ${state.corn}`, width / 2, height / 2 + 22);
  if (state.best > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Best score: ${state.best}`, width / 2, height / 2 + 56);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('↻  CLICK OR PRESS SPACE TO RUN AGAIN', width / 2, height / 2 + 104);
  ctx.restore();
}

export function drawPaused(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED — press P to keep running', width / 2, height / 2);
  ctx.restore();
}
