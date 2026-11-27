// The farmer: he chases from the left edge, gains ground whenever the turkey
// stumbles, and falls behind while the turkey runs clean. He also pauses to
// search a haystack the turkey hides in — then storms on, angrier.

export class Farmer {
  constructor() {
    this.gap = 260;
    this.runPhase = 0;
    this.searching = 0;
    this.angry = 0;
    this.shouted = false;
  }

  reset() {
    this.gap = 260;
    this.runPhase = 0;
    this.searching = 0;
    this.angry = 0;
    this.shouted = false;
  }

  get x() { return 150 - this.gap; }

  update(dt, turkeyHidden, stumbleHappened, cleanRunning) {
    this.runPhase += dt * 10;
    if (this.searching > 0) {
      this.searching -= dt;
      return;
    }
    if (turkeyHidden) {
      // He stops at the haystack and pokes it with his pitchfork.
      if (this.gap < 130) { this.searching = 1.1; this.angry = 1; }
      else this.gap = Math.max(120, this.gap - 140 * dt);
      return;
    }
    if (stumbleHappened) this.gap -= 95;
    else if (cleanRunning) this.gap += 26 * dt;
    this.gap = Math.max(20, Math.min(420, this.gap));
    if (this.angry > 0) this.angry -= dt * 0.4;
  }

  get caught() { return this.gap <= 26; }

  draw(ctx, groundY) {
    const x = this.x;
    if (x < -90) return; // still off-screen, closing in
    const y = groundY;
    const bob = Math.sin(this.runPhase) * 2;
    ctx.save();
    ctx.translate(x, y + bob);
    // Legs pumping.
    const swing = Math.sin(this.runPhase) * 10;
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-4, -34); ctx.lineTo(-4 + swing, 0);
    ctx.moveTo(4, -34); ctx.lineTo(4 - swing, 0);
    ctx.stroke();
    // Overalls and shirt.
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-14, -72, 28, 26);
    ctx.fillStyle = '#2e5aa8';
    ctx.fillRect(-12, -52, 24, 20);
    // Arms: one pumping, one gripping the pitchfork.
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-12, -66); ctx.lineTo(-22, -48 + swing * 0.4); ctx.stroke();
    // Head with straw hat.
    ctx.fillStyle = '#e8b88a';
    ctx.beginPath(); ctx.arc(2, -82, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.ellipse(2, -90, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-8, -102, 20, 12);
    // Angry brows / moustache.
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-4, -88, 12, 2);
    ctx.fillRect(-2, -76, 12, 3);
    // Pitchfork, held high when he searches.
    const poke = this.searching > 0 ? Math.sin(this.searching * 18) * 6 : 0;
    ctx.save();
    ctx.translate(20, -60 + poke);
    ctx.rotate(0.35);
    ctx.strokeStyle = '#7a5a2e';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -30); ctx.stroke();
    ctx.strokeStyle = '#b8bcc0';
    ctx.lineWidth = 3;
    for (const dx of [-7, 0, 7]) {
      ctx.beginPath(); ctx.moveTo(dx, -30); ctx.lineTo(dx, -44); ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
    // "HEY!" shout bubble when he is close.
    if (this.gap < 110 && this.searching <= 0) {
      ctx.save();
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#7a2a12';
      ctx.lineWidth = 4;
      const label = this.angry > 0 ? 'COME BACK HERE!' : 'HEY!';
      const w = ctx.measureText(label).width + 18;
      ctx.beginPath();
      ctx.roundRect(x - 10, groundY - 150, w, 30, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7a2a12';
      ctx.fillText(label, x - 1, groundY - 129);
      ctx.restore();
    }
  }
}
