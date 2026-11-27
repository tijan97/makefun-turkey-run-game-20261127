// Gobble Run input: keyboard and mouse (and touch tap) in one place. The
// game reads only the edge-triggered actions below, so holding a key never
// double-fires a jump and the menus share the same buttons as the run.

export class Input {
  constructor(canvas) {
    this.jumpQueued = false;
    this.slideHeld = false;
    this.hideQueued = false;
    this.actionQueued = false;
    this.anyKeyQueued = false;
    this.pointerX = 0;
    this.pointerY = 0;
    this.clickedButton = null;
    this.keys = new Set();

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.keys.add(event.code);
      this.anyKeyQueued = true;
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        this.jumpQueued = true;
        event.preventDefault();
      }
      if (event.code === 'ArrowDown' || event.code === 'KeyS') this.slideHeld = true;
      if (event.code === 'KeyH') this.hideQueued = true;
      if (event.code === 'Enter' || event.code === 'Space') this.actionQueued = true;
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
      if (event.code === 'ArrowDown' || event.code === 'KeyS') this.slideHeld = false;
    });
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.pointerX = event.clientX - rect.left;
      this.pointerY = event.clientY - rect.top;
      this.clickedButton = { x: this.pointerX, y: this.pointerY };
      this.jumpQueued = true;
      this.actionQueued = true;
      this.anyKeyQueued = true;
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.slideHeld = false;
    });
  }

  consumeJump() { const v = this.jumpQueued; this.jumpQueued = false; return v; }
  consumeHide() { const v = this.hideQueued; this.hideQueued = false; return v; }
  consumeAction() { const v = this.actionQueued; this.actionQueued = false; return v; }
  consumeAnyKey() { const v = this.anyKeyQueued; this.anyKeyQueued = false; return v; }
  consumeClick() { const v = this.clickedButton; this.clickedButton = null; return v; }
  isSliding() { return this.slideHeld; }
}
