(() => {
  "use strict";
  AR.ParticleSystem = class {
    constructor() { this.particles = []; }
    burst(x, y, color, count = 8, spread = 90) {
      for (let i = 0; i < count; i++) {
        this.particles.push({ x, y, color, vx: AR.rand(-spread, spread), vy: AR.rand(-spread, -20), r: AR.rand(2, 6), life: AR.rand(.35, .9) });
      }
    }
    trail(x, y, color, count = 2) { this.burst(x, y, color, count, 24); }
    update(dt) {
      this.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 150 * dt; p.life -= dt; });
      this.particles = this.particles.filter((p) => p.life > 0);
    }
    draw(c) {
      this.particles.forEach((p) => {
        c.save();
        c.globalAlpha = AR.clamp(p.life, 0, 1);
        c.fillStyle = p.color;
        c.shadowColor = p.color;
        c.shadowBlur = 12;
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fill();
        c.restore();
      });
    }
  };
})();
