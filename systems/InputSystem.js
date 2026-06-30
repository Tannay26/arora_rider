(() => {
  "use strict";

  AR.InputSystem = class {
    constructor() {
      this.keys = new Set();
      this.jumpQueued = false;
      this.chargeQueued = false;
      this.sparkQueued = false;
      window.addEventListener("keydown", (e) => {
        this.keys.add(e.code);
        if (["Space", "KeyW", "ArrowUp"].includes(e.code)) this.jumpQueued = true;
        if (["ShiftLeft", "ShiftRight", "KeyE"].includes(e.code)) this.chargeQueued = true;
        if (["KeyF", "KeyX"].includes(e.code)) this.sparkQueued = true;
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      });
      window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    }
    axis() {
      const left = this.keys.has("KeyA") || this.keys.has("ArrowLeft");
      const right = this.keys.has("KeyD") || this.keys.has("ArrowRight");
      return right - left;
    }
    consumeJump() { const v = this.jumpQueued; this.jumpQueued = false; return v; }
    consumeCharge() { const v = this.chargeQueued; this.chargeQueued = false; return v; }
    consumeSpark() { const v = this.sparkQueued; this.sparkQueued = false; return v; }
  };
})();