(() => {
  "use strict";
  AR.Hero = class {
    constructor() {
      Object.assign(this, { x: 252, y: AR.WORLD.groundY, w: 166, h: 130, maxHp: 460, hp: 460, speed: 255, level: 1, xp: 0, xpNeed: 100, facing: 1, walkTime: 0, dead: false, hitFlash: 0 });
    }
    get centerX() { return this.x + this.w / 2; }
    get left() { return this.x; }
    get right() { return this.x + this.w; }
    update(dt, input) {
      const axis = input.axis();
      if (axis) this.facing = axis;
      this.x = AR.clamp(this.x + axis * this.speed * dt, AR.WORLD.laneMin, AR.WORLD.laneMax - this.w);
      this.walkTime += Math.abs(axis) * dt * 8;
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      this.dead = this.hp <= 0;
    }
    damage(amount) { this.hp -= amount; this.hitFlash = .14; }
    addXp(amount, game) {
      this.xp += amount;
      while (this.xp >= this.xpNeed) {
        this.xp -= this.xpNeed;
        this.level += 1;
        this.xpNeed = Math.round(this.xpNeed * 1.34);
        game.showUpgrades();
      }
    }
    draw(c) {
      const bob = Math.sin(this.walkTime) * 3, top = this.y - this.h + bob;
      AR.drawHp(c, this.x + 20, top - 28, this.w - 36, 10, this.hp / this.maxHp);
      c.save();
      if (this.hitFlash > 0) c.filter = "brightness(1.8)";
      c.translate(this.x + this.w / 2, 0); c.scale(this.facing, 1); c.translate(-this.w / 2, 0);
      drawElephant(c, 0, top, this.walkTime);
      drawRider(c, 74, top + 12, this.walkTime);
      c.restore();
    }
  };
  function drawElephant(c, x, y, t) {
    const leg = Math.sin(t) * 9;
    c.fillStyle = "#777e88"; c.beginPath(); c.ellipse(x + 80, y + 78, 70, 39, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#959ca5"; c.beginPath(); c.arc(x + 137, y + 62, 34, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#6a7078"; c.beginPath(); c.ellipse(x + 121, y + 54, 23, 31, -0.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#8f969e"; c.beginPath(); c.ellipse(x + 153, y + 84, 12, 42, -0.06, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#f6f0df"; c.lineWidth = 6; c.beginPath();
    c.moveTo(x + 158, y + 65); c.quadraticCurveTo(x + 182, y + 76, x + 170, y + 98);
    c.moveTo(x + 139, y + 66); c.quadraticCurveTo(x + 163, y + 78, x + 151, y + 98); c.stroke();
    c.fillStyle = "#555b63"; [30, 62, 98, 128].forEach((lx, i) => c.fillRect(x + lx, y + 90 + (i % 2 ? -leg : leg) * .35, 16, 48));
    c.strokeStyle = "#4a4f56"; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 12, y + 70); c.quadraticCurveTo(x - 10, y + 84, x + 7, y + 101); c.stroke();
    c.fillStyle = "#405071"; c.fillRect(x + 43, y + 34, 66, 31);
    c.fillStyle = "#d2a64a"; c.fillRect(x + 39, y + 30, 74, 8);
  }
  function drawRider(c, x, y, t) {
    c.fillStyle = "#713a2f"; c.fillRect(x, y + 8, 27, 40);
    c.fillStyle = "#f6c06b"; c.beginPath(); c.arc(x + 14, y - 5, 13, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#ffe28a"; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 25, y + 20); c.lineTo(x + 62, y + 8 + Math.sin(t * 1.4) * 4); c.stroke();
  }
})();
