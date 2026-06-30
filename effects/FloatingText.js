(() => {
  "use strict";
  AR.FloatingText = class {
    constructor(text, x, y, color = AR.COLORS.damage, size = 24) {
      Object.assign(this, { text, x, y, color, size, life: 1.15, vx: AR.rand(-10, 10) });
    }
    update(dt) { this.x += this.vx * dt; this.y -= 48 * dt; this.life -= dt; }
    draw(c) {
      c.save();
      c.globalAlpha = AR.clamp(this.life, 0, 1);
      c.font = `800 ${this.size}px Arial`;
      c.textAlign = "center";
      c.strokeStyle = "rgba(33, 14, 12, .9)";
      c.lineWidth = 4;
      c.fillStyle = this.color;
      c.strokeText(this.text, this.x, this.y);
      c.fillText(this.text, this.x, this.y);
      c.restore();
    }
  };
})();
