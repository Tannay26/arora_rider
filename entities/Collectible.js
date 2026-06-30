(() => {
  "use strict";

  AR.Collectible = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 24;
      this.h = 28;
      this.collected = false;
      this.time = Math.random() * Math.PI;
    }
    update(dt) {
      this.time += dt * 4;
    }
    draw(c, camera) {
      if (this.collected) return;
      const x = this.x - camera.x, y = this.y + Math.sin(this.time) * 4;
      c.save();
      c.fillStyle = "#8ff4ff";
      c.shadowColor = "#8ff4ff";
      c.shadowBlur = 14;
      c.beginPath();
      c.moveTo(x + 12, y);
      c.lineTo(x + 24, y + 12);
      c.lineTo(x + 12, y + 28);
      c.lineTo(x, y + 12);
      c.closePath();
      c.fill();
      c.restore();
    }
  };
})();
