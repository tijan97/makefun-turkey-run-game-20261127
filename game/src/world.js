// The world: parallax autumn scenery that changes with the stage — farmyard
// fences and pumpkins, the barn, then the kitchen windows — plus the forest
// gate the turkey is running toward.

import { stageAt } from './config.js';

export class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.groundY = height - 90;
    this.scroll = 0;
    this.clouds = [
      { x: 80, y: 70, s: 1 }, { x: 420, y: 110, s: 0.7 }, { x: 760, y: 60, s: 1.2 },
      { x: 1100, y: 100, s: 0.8 },
    ];
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.groundY = height - 90;
  }

  update(dt, speed) { this.scroll += speed * dt; }

  draw(ctx, distance) {
    const stage = stageAt(distance);
    const w = this.width;
    const h = this.height;
    const gy = this.groundY;
    // Sky.
    const sky = ctx.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, stage.sky);
    sky.addColorStop(1, '#f8d98a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, gy + 2);
    // Sun.
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath(); ctx.arc(w - 130, 90, 44, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe98a';
    ctx.beginPath(); ctx.arc(w - 130, 90, 34, 0, Math.PI * 2); ctx.fill();
    // Clouds drift slowly.
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (const c of this.clouds) {
      const cx = ((c.x - this.scroll * 0.08) % (w + 240) + w + 240) % (w + 240) - 120;
      ctx.beginPath();
      ctx.ellipse(cx, c.y, 46 * c.s, 16 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 30 * c.s, c.y + 4, 30 * c.s, 12 * c.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Far hills.
    ctx.fillStyle = stage.hills;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    for (let x = 0; x <= w; x += 40) {
      const px = x - (this.scroll * 0.15 % 320);
      ctx.lineTo(x, gy - 60 - Math.sin((px + this.scroll * 0.15) * 0.008) * 34);
    }
    ctx.lineTo(w, gy);
    ctx.closePath(); ctx.fill();
    // Stage dressing: fences and pumpkins in the farmyard, barn, kitchen windows.
    this.drawDressing(ctx, stage, gy, w);
    // Ground.
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, gy, w, h - gy);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, gy, w, 6);
    // Ground tufts rushing past.
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const gx = ((i * 173 - this.scroll) % (w + 80) + w + 80) % (w + 80) - 40;
      ctx.beginPath(); ctx.moveTo(gx, gy + 22); ctx.lineTo(gx + 6, gy + 12); ctx.moveTo(gx + 8, gy + 22); ctx.lineTo(gx + 14, gy + 14); ctx.stroke();
    }
    // The forest gate: visible once the turkey is close to escaping.
    const remaining = 1500 - distance;
    if (remaining < 420) {
      const gx = w - 120 + (420 - remaining) * 0.4;
      ctx.fillStyle = '#2f6b2f';
      ctx.fillRect(gx - 8, gy - 150, 16, 150);
      ctx.fillRect(gx + 92, gy - 150, 16, 150);
      ctx.fillStyle = '#3d8b3d';
      ctx.beginPath(); ctx.moveTo(gx - 20, gy - 150); ctx.lineTo(gx + 124, gy - 150); ctx.lineTo(gx + 52, gy - 190); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FREEDOM!', gx + 52, gy - 196);
    }
  }

  drawDressing(ctx, stage, gy, w) {
    if (stage.name === 'The Farmyard') {
      // Fence posts and pumpkins along the field.
      ctx.fillStyle = '#8a5a28';
      for (let i = 0; i < 8; i++) {
        const fx = ((i * 260 - this.scroll * 0.35) % (w + 260) + w + 260) % (w + 260) - 130;
        ctx.fillRect(fx, gy - 46, 8, 46);
        ctx.fillRect(fx + 8, gy - 40, 60, 5);
      }
      for (let i = 0; i < 5; i++) {
        const px = ((i * 430 + 90 - this.scroll * 0.5) % (w + 200) + w + 200) % (w + 200) - 100;
        ctx.fillStyle = '#e67e22';
        ctx.beginPath(); ctx.ellipse(px, gy - 12, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2f6b2f';
        ctx.fillRect(px - 2, gy - 30, 4, 8);
      }
    } else if (stage.name === 'The Barn') {
      // The big red barn sliding past.
      const bx = ((400 - this.scroll * 0.3) % (w + 700) + w + 700) % (w + 700) - 350;
      ctx.fillStyle = '#a83226';
      ctx.beginPath();
      ctx.moveTo(bx, gy); ctx.lineTo(bx, gy - 130); ctx.lineTo(bx + 110, gy - 180); ctx.lineTo(bx + 220, gy - 130); ctx.lineTo(bx + 220, gy);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7d241a';
      ctx.fillRect(bx + 85, gy - 80, 50, 80);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx + 85, gy - 80); ctx.lineTo(bx + 135, gy); ctx.moveTo(bx + 135, gy - 80); ctx.lineTo(bx + 85, gy); ctx.stroke();
    } else {
      // Kitchen: warm windows with the oven glow inside.
      for (let i = 0; i < 4; i++) {
        const wx = ((i * 340 + 60 - this.scroll * 0.3) % (w + 340) + w + 340) % (w + 340) - 170;
        ctx.fillStyle = '#ffe9a8';
        ctx.beginPath(); ctx.roundRect(wx, gy - 170, 90, 110, 8); ctx.fill();
        ctx.strokeStyle = '#5f3a20';
        ctx.lineWidth = 5;
        ctx.strokeRect(wx, gy - 170, 90, 110);
        ctx.beginPath(); ctx.moveTo(wx + 45, gy - 170); ctx.lineTo(wx + 45, gy - 60); ctx.moveTo(wx, gy - 115); ctx.lineTo(wx + 90, gy - 115); ctx.stroke();
      }
    }
  }
}
