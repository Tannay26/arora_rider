(() => {
  "use strict";
  AR.InputSystem = class {
    constructor() {
      this.keys = new Set();
      window.addEventListener("keydown", (event) => { if (["KeyA", "KeyD", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault(); this.keys.add(event.code); });
      window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    }
    axis() { return (this.keys.has("KeyD") || this.keys.has("ArrowRight") ? 1 : 0) - (this.keys.has("KeyA") || this.keys.has("ArrowLeft") ? 1 : 0); }
  };
})();
