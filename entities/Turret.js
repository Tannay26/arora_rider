(() => {
  "use strict";
  AR.Turret = class {
    constructor(stats, x) {
      this.stats = { ...stats };
      Object.assign(this, {
        side: "ally", x, y: AR.WORLD.groundY, w: 58, h: 74, name: stats.name,
        maxHp: stats.hp, hp: stats.hp, damage: stats.damage, range: stats.range,
        attackSpeed: stats.attackSpeed, type: stats.type, attackTimer: .25, dead: false,
        removed: false, hitFlash: 0, dashActive: false, dashX: x,
      });
    }
    get centerX() { return this.x + this.w / 2; }
    get left() { return this.x; }
    get right() { return this.x + this.w; }
    get attackInterval() { return 1 / Math.max(.1, this.attackSpeed); }
    damage(amount) { this.hp -= amount; this.hitFlash = .12; if (this.hp <= 0) this.dead = true; }
    update(dt, game) {
      if (this.dead) { this.removed = true; return; }
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      this.attackTimer -= dt;
      const target = game.enemies.filter((e) => !e.dead && e.centerX >= this.centerX && AR.distance(this, e) <= this.range).sort((a, b) => a.centerX - b.centerX)[0];
      if (target && this.attackTimer <= 0) this.attack(target, game);
      if (this.dashActive) {
        this.dashX += 900 * dt;
        if (this.dashX > AR.WORLD.enemyStructureX || !game.enemies.length) this.removed = true;
      }
    }
    attack(target, game) {
      this.attackTimer = this.attackInterval;
      if (this.type === "flame") {
        game.combat.damage(target, this.damage, this, "burn");
        target.burn = 2.5;
        game.particles.burst(target.centerX, target.y - target.h * .55, "#ff7b31", 4, 45);
        return;
      }
      if (this.type === "dash") {
        this.dashActive = true;
        this.dashX = this.x;
        game.enemies.filter((e) => !e.dead && e.centerX < this.x + this.range).forEach((e) => game.combat.damage(e, this.damage, this, "charge"));
        game.float("SWORD DASH!", this.centerX, this.y - 90, "#ffe28a", 22);
        return;
      }
      game.projectiles.push(new AR.Projectile({
        x: this.centerX, y: this.y - this.h * .66, side: "ally", damage: this.damage,
        speed: this.type === "splash" ? 320 : 620, target, color: this.type === "splash" ? "#f7f0b2" : "#c8f7ff",
        owner: this, type: this.type === "splash" ? "splash" : "sentry",
      }));
    }
    draw(c) {
      c.save();
      if (this.hitFlash > 0) c.filter = "brightness(1.8)";
      const top = this.y - this.h;
      if (this.type === "sentry") drawSentry(c, this.x, top, this.w, this.h);
      if (this.type === "splash") drawEgg(c, this.x, top, this.w, this.h);
      if (this.type === "flame") drawFlame(c, this.x, top, this.w, this.h);
      if (this.type === "dash") drawDash(c, this.dashActive ? this.dashX : this.x, top, this.w, this.h);
      c.restore();
      if (!this.removed) AR.drawHp(c, this.x, top - 12, this.w, 6, this.hp / this.maxHp);
    }
  };
  function drawSentry(c, x, y, w, h) { c.fillStyle="#556879"; c.fillRect(x+14,y+28,w-28,h-28); c.fillStyle="#243240"; c.fillRect(x+26,y+8,20,34); c.fillStyle="#bfefff"; c.fillRect(x+42,y+18,38,8); }
  function drawEgg(c, x, y, w, h) { c.fillStyle="#7b5a49"; c.fillRect(x+12,y+38,w-24,h-38); c.fillStyle="#fff1c9"; c.beginPath(); c.ellipse(x+w/2,y+25,24,28,0,0,Math.PI*2); c.fill(); c.fillStyle="#7aae66"; c.beginPath(); c.arc(x+w/2,y+24,7,0,Math.PI*2); c.fill(); }
  function drawFlame(c, x, y, w, h) { c.fillStyle="#5b4d45"; c.fillRect(x+12,y+36,w-24,h-36); c.fillStyle="#2d3339"; c.fillRect(x+30,y+12,18,38); c.fillStyle="#ff7b31"; c.beginPath(); c.moveTo(x+52,y+20); c.lineTo(x+82,y+10); c.lineTo(x+62,y+36); c.fill(); }
  function drawDash(c, x, y, w, h) { c.fillStyle="#d7d1c6"; c.beginPath(); c.moveTo(x+8,y+58); c.lineTo(x+86,y+16); c.lineTo(x+76,y+42); c.lineTo(x+22,y+70); c.fill(); c.fillStyle="#8a3232"; c.fillRect(x+8,y+58,18,16); }
})();
