(() => {
  "use strict";
  AR.Base = class {
    constructor(side) {
      this.side = side;
      this.x = side === "ally" ? AR.WORLD.playerStructureX : AR.WORLD.enemyStructureX;
      this.y = AR.WORLD.groundY;
      this.w = side === "ally" ? 188 : 172;
      this.h = side === "ally" ? 272 : 292;
      this.maxHp = side === "ally" ? 2400 : 3800;
      this.hp = this.maxHp;
      this.dead = false;
      this.isBase = true;
      this.hitFlash = 0;
    }
    get centerX() { return this.x + this.w / 2; }
    get left() { return this.x; }
    get right() { return this.x + this.w; }
    update(dt) { this.hitFlash = Math.max(0, this.hitFlash - dt); this.dead = this.hp <= 0; }
    damage(amount) { this.hp -= amount; this.hitFlash = .12; }
    draw(c) {
      const top = this.y - this.h;
      c.save();
      if (this.hitFlash > 0) c.filter = "brightness(1.8)";
      this.side === "ally" ? drawCastle(c, this.x, top, this.w, this.h) : drawFortress(c, this.x, top, this.w, this.h);
      c.filter = "none";
      AR.drawHp(c, this.x + 12, top - 24, this.w - 24, 10, this.hp / this.maxHp);
      c.restore();
    }
  };
  function drawCastle(c, x, y, w, h) {
    const g = c.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "#a9bce9"); g.addColorStop(1, "#425987");
    c.fillStyle = g; c.fillRect(x + 22, y + 72, w - 44, h - 72);
    c.fillStyle = "#2f3f68";
    [0, 43, 90, 137].forEach((px) => c.fillRect(x + 6 + px, y + 38 + (px % 2) * 15, 36, h - 38));
    c.fillStyle = "#dce7ff";
    c.beginPath(); c.moveTo(x + 4, y + 84); c.lineTo(x + w / 2, y + 4); c.lineTo(x + w - 4, y + 84); c.fill();
    c.fillStyle = "#26304f"; c.fillRect(x + 74, y + h - 78, 44, 78);
    c.fillStyle = "rgba(255,255,255,.28)";
    for (let i = 0; i < 3; i++) c.fillRect(x + 44 + i * 44, y + 120, 18, 32);
  }
  function drawFortress(c, x, y, w, h) {
    const g = c.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "#713147"); g.addColorStop(1, "#1b0d17");
    c.fillStyle = g; c.fillRect(x + 12, y + 92, w - 24, h - 92);
    c.fillStyle = "#170a12";
    [0, 45, 93, 135].forEach((px) => c.fillRect(x + px, y + 45 + (px % 2) * 20, 38, h - 45));
    c.fillStyle = "#b3314d";
    c.beginPath(); c.moveTo(x + 8, y + 98); c.lineTo(x + w / 2, y); c.lineTo(x + w - 8, y + 98); c.fill();
    c.fillStyle = "#ff5a63"; c.shadowColor = "#ff3945"; c.shadowBlur = 18; c.fillRect(x + 66, y + h - 92, 42, 92); c.shadowBlur = 0;
  }
})();
