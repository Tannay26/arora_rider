(() => {
  "use strict";

  AR.InputSystem = class {
    constructor() {
      this.keys = new Set();
      this.jumpQueued = false;
      this.fireQueued = false;
      window.addEventListener("keydown", (e) => {
        if (!this.keys.has(e.code)) {
          if (["Space", "KeyW", "ArrowUp"].includes(e.code)) this.jumpQueued = true;
          if (["Space", "KeyF", "KeyX"].includes(e.code)) this.fireQueued = true;
        }
        this.keys.add(e.code);
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      });
      window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    }
    axis() {
      const left = this.keys.has("KeyA") || this.keys.has("ArrowLeft");
      const right = this.keys.has("KeyD") || this.keys.has("ArrowRight");
      return right - left;
    }
    jumpHeld() { return this.keys.has("Space") || this.keys.has("KeyW") || this.keys.has("ArrowUp"); }
    consumeJump() { const v = this.jumpQueued; this.jumpQueued = false; return v; }
    consumeFire() { const v = this.fireQueued; this.fireQueued = false; return v; }
  };
})();
