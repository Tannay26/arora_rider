(() => {
  "use strict";

  AR.Collectible = class {
    constructor(x, y, type = "gem", hidden = false) {
      this.x = x; this.y = y; this.w = 24; this.h = 24; this.type = type; this.hidden = hidden;
      this.collected = false; this.t = Math.random() * 10;
    }
    update(dt) { this.t += dt; }
    draw(c, camera, player) {
      if (this.collected) return;
      const revealed = !this.hidden || Math.abs(player.x - this.x) < 150;
      if (!revealed) return;
      const x = this.x - camera.x, y = this.y + Math.sin(this.t * 4) * 3;
      c.save();
      if (this.hidden) c.globalAlpha = .78;
      if (this.type === "gem") {
        c.fillStyle = this.hidden ? "#b9f7ff" : "#77e5ff";
        c.beginPath(); c.moveTo(x + 12, y); c.lineTo(x + 24, y + 11); c.lineTo(x + 12, y + 24); c.lineTo(x, y + 11); c.closePath(); c.fill();
        c.strokeStyle = "#effcff"; c.stroke();
      }
      c.restore();
    }
  };
})();