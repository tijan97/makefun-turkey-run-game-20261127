// The turkey: physics (run, jump, double-jump, slide, haystack hide) and the
// hand-drawn bird itself — brown body, fanned tail, red wattle, orange beak.

import { CONFIG } from './config.js';

export class Turkey {
  constructor(groundY) {
    this.x = 150;
    this.groundY = groundY;
    this.y = groundY;
    this.vy = 0;
    this.width = 64;
    this.height = 64;
    this.sliding = false;
    this.hidden = false;
    this.hideTimer = 0;
    this.jumpsUsed = 0;
    this.runPhase = 0;
    this.stumbleTimer = 0;
    this.invulnerableTimer = 0;
    this.flapPhase = 0;
  }

  get onGround() { return this.y >= this.groundY; }
  get heightNow() { return this.sliding ? this.height * 0.55 : this.height; }

  reset(groundY) {
    this.groundY = groundY;
    this.y = groundY;
    this.vy = 0;
    this.sliding = false;
    this.hidden = false;
    this.hideTimer = 0;
    this.jumpsUsed = 0;
    this.stumbleTimer = 0;
    this.invulnerableTimer = 0;
  }

  jump(sounds) {
    if (this.hidden) return false;
    if (this.onGround) {
      this.vy = -CONFIG.JUMP_SPEED;
      this.jumpsUsed = 1;
      this.sliding = false;
      sounds.jump();
      return true;
    }
    if (this.jumpsUsed < 2) {
      this.vy = -CONFIG.DOUBLE_JUMP_SPEED;
      this.jumpsUsed = 2;
      this.flapPhase = 0.35;
      sounds.flap();
      return true;
    }
    return false;
  }

  hide(sounds) {
    if (!this.onGround || this.hidden) return false;
    this.hidden = true;
    this.hideTimer = CONFIG.HAY_DURATION;
    sounds.hide();
    return true;
  }

  stumble(sounds) {
    if (this.invulnerableTimer > 0) return false;
    this.stumbleTimer = 0.5;
    this.invulnerableTimer = 1.2;
    this.hidden = false;
    sounds.thud();
    return true;
  }

  update(dt, sliding, sounds) {
    this.runPhase += dt * 11;
    if (this.flapPhase > 0) this.flapPhase -= dt;
    if (this.stumbleTimer > 0) this.stumbleTimer -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    this.sliding = sliding && this.onGround && !this.hidden;
    if (this.hidden) {
      this.hideTimer -= dt;
      if (this.hideTimer <= 0) this.hidden = false;
    }
    if (!this.onGround || this.vy !== 0) {
      this.vy += CONFIG.GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y >= this.groundY) { this.y = this.groundY; this.vy = 0; this.jumpsUsed = 0; }
    }
    void sounds;
  }

  // Bounding box the hazards test against (tighter than the drawn bird).
  box() {
    return {
      x: this.x - 22, y: this.y - this.heightNow + 8,
      w: 46, h: this.heightNow - 12,
    };
  }

  draw(ctx) {
    if (this.hidden) return; // tucked inside the haystack, drawn by the world
    const blink = this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer * 12) % 2 === 0;
    if (blink) return;
    const x = this.x;
    const y = this.y;
    const squash = this.sliding ? 0.62 : 1;
    const bob = this.onGround && !this.sliding ? Math.sin(this.runPhase) * 2 : 0;
    const stumble = this.stumbleTimer > 0 ? Math.sin(this.stumbleTimer * 30) * 5 : 0;
    ctx.save();
    ctx.translate(x + stumble, y + bob);
    ctx.scale(1, squash);
    // Tail fan.
    ctx.fillStyle = '#7a4a1f';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.rotate((i * 0.42) - Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, -34, 9, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#c98a3d';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.rotate((i * 0.42) - Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, -34, 5, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Body.
    ctx.fillStyle = '#8a5a28';
    ctx.beginPath(); ctx.ellipse(0, -26, 24, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a86f2e';
    ctx.beginPath(); ctx.ellipse(2, -22, 19, 20, 0, 0, Math.PI * 2); ctx.fill();
    // Wing (flaps on the double jump).
    const flap = this.flapPhase > 0 ? -0.9 : Math.sin(this.runPhase) * 0.12;
    ctx.save();
    ctx.translate(-4, -28);
    ctx.rotate(flap);
    ctx.fillStyle = '#6e451c';
    ctx.beginPath(); ctx.ellipse(-8, 0, 14, 9, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Neck and head.
    ctx.fillStyle = '#8a5a28';
    ctx.fillRect(14, -62, 10, 26);
    ctx.fillStyle = '#d9a05a';
    ctx.beginPath(); ctx.arc(20, -64, 11, 0, Math.PI * 2); ctx.fill();
    // Wattle and beak.
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.ellipse(22, -54, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.moveTo(28, -66); ctx.lineTo(40, -62); ctx.lineTo(28, -58); ctx.closePath(); ctx.fill();
    // Eye.
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(23, -67, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(24, -68, 0.9, 0, Math.PI * 2); ctx.fill();
    // Legs (scissor while running).
    const legSwing = this.onGround ? Math.sin(this.runPhase) * 9 : 4;
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-6 + legSwing, 0); ctx.moveTo(6, -4); ctx.lineTo(6 - legSwing, 0); ctx.stroke();
    ctx.restore();
  }
}
