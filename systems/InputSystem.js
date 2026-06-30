(() => {
  "use strict";

  AR.InputSystem = class {
    constructor() {
      this.keys = new Set();
      this.jumpPressed = false;
      window.addEventListener("keydown", (event) => {
        if (["KeyA", "KeyD", "ArrowLeft", "ArrowRight", "Space", "KeyW", "ArrowUp"].includes(event.code)) event.preventDefault();
        if (!this.keys.has(event.code) && ["Space", "KeyW", "ArrowUp"].includes(event.code)) this.jumpPressed = true;
        this.keys.add(event.code);
      });
      window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    }
    axis() {
      return (this.keys.has("KeyD") || this.keys.has("ArrowRight") ? 1 : 0) - (this.keys.has("KeyA") || this.keys.has("ArrowLeft") ? 1 : 0);
    }
    consumeJump() {
      const jump = this.jumpPressed;
      this.jumpPressed = false;
      return jump;
    }
  };
})();
