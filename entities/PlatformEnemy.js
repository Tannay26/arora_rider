(() => {
  "use strict";

  AR.PlatformEnemy = class {
    constructor(data) {
      const cfg = AR.ENEMY_INFO[data.type] || AR.ENEMY_INFO.wolf;
      this.type = data.type || "wolf"; this.name = cfg.name;
      this.x = data.x; this.y = data.y; this.w = cfg.w; this.h = cfg.h; this.hp = cfg.hp; this.maxHp = cfg.hp;
      this.vx = -cfg.speed; this.vy = 0; this.grounded = false; this.patrol = data.patrol || [data.x - 180, data.x + 180];
      this.dead = false; this.deathTimer = 0; this.damageTimer = 0; this.attackTimer = 0; this.anim = Math.random() * 10; this.boss = !!data.boss;
      this.gravityScale = cfg.flying ? 0 : 1;
    }
    update(dt, physics, slowFactor = 1, player = null) {
      const d = dt * slowFactor; this.anim += d;
      if (this.dead) { this.deathTimer += dt; return; }
      this.damageTimer = Math.max(0, this.damageTimer - dt); this.attackTimer = Math.max(0, this.attackTimer - dt);
      const cfg = AR.ENEMY_INFO[this.type] || AR.ENEMY_INFO.wolf;
      if (cfg.flying) {
        this.x += this.vx * d; this.y += Math.sin(this.anim * 4) * .7;
      } else {
        if (this.type === "troll" || this.type === "guardian" || this.type === "giant") this.attackTimer = Math.max(this.attackTimer, Math.sin(this.anim * 2) > .95 ? .18 : 0);
        physics.moveActor(this, d);
        if (this.grounded && !physics.groundAhead(this, Math.sign(this.vx) || -1, 18)) this.vx *= -1;
      }
      if (this.x < this.patrol[0]) this.vx = Math.abs(this.vx);
      if (this.x + this.w > this.patrol[1]) this.vx = -Math.abs(this.vx);
    }
    damage(amount, game) {
      if (this.dead) return;
      this.hp -= amount; this.damageTimer = .18; game.burst(this.x + this.w / 2, this.y + this.h / 2, "hit", 7);
      if (this.hp <= 0) { this.dead = true; this.deathTimer = 0; game.cameraShake = Math.max(game.cameraShake, this.boss ? 18 : 7); }
    }
    draw(c, camera) {
      if (this.dead && this.deathTimer > .55) return;
      const x = this.x - camera.x, y = this.y;
      c.save();
      if (this.damageTimer > 0) c.globalAlpha = .55;
      if (this.dead) { c.translate(x + this.w / 2, y + this.h); c.scale(1, Math.max(.08, 1 - this.deathTimer * 1.9)); c.translate(-(x + this.w / 2), -(y + this.h)); }
      drawEnemy(c, x, y, this);
      if (!this.dead) drawHp(c, x, y - 9, this.w, this.hp / this.maxHp);
      c.restore();
    }
  };

  function drawEnemy(c, x, y, e) {
    const left = e.vx < 0, t = e.anim, cfg = AR.ENEMY_INFO[e.type] || AR.ENEMY_INFO.wolf;
    c.save(); c.translate(x + e.w / 2, y + e.h / 2); c.scale(left ? -1 : 1, 1); c.translate(-e.w / 2, -e.h / 2);
    c.fillStyle = cfg.color;
    if (e.type === "wolf") drawWolf(c, e, t); else if (e.type === "boar") drawBoar(c, e, t); else if (e.type === "spider") drawSpider(c, e, t); else if (e.type === "troll") drawTroll(c, e, t); else if (e.type === "serpent") drawSerpent(c, e, t); else if (e.type === "golem") drawGolem(c, e, t); else if (e.type === "ice") drawIceBeast(c, e, t); else if (e.type === "raven") drawRaven(c, e, t); else if (e.type === "giant") drawGiant(c, e, t); else drawGuardian(c, e, t);
    c.restore();
  }
  function legs(c, y, h, t, color) { c.fillStyle = color; [10, 27, 44, 60].forEach((x, i) => c.fillRect(x, y + Math.sin(t * 8 + i) * 3, 8, h)); }
  function drawWolf(c, e, t) { c.fillStyle = "#5a2634"; c.beginPath(); c.ellipse(31, 28, 30, 15, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(48, 14); c.lineTo(64, 2); c.lineTo(60, 24); c.fill(); c.fillStyle = "#2a1018"; c.beginPath(); c.moveTo(55, 25); c.lineTo(74, 31); c.lineTo(54, 36); c.fill(); legs(c, 35, 16, t, "#34151f"); }
  function drawBoar(c, e, t) { c.fillStyle = "#5d4b43"; c.fillRect(10, 17, 49, 27); c.fillStyle = "#342825"; c.beginPath(); c.arc(55, 28, 18, 0, Math.PI * 2); c.fill(); c.strokeStyle = "#d8d0b8"; c.lineWidth = 4; c.beginPath(); c.moveTo(62, 30); c.quadraticCurveTo(76, 24, 67, 14); c.stroke(); legs(c, 42, 12, t, "#2e2522"); }
  function drawSpider(c, e, t) { c.fillStyle = "#372942"; c.beginPath(); c.ellipse(34, 23, 25, 17, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = "#201827"; c.lineWidth = 4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(20 + i * 8, 28); c.lineTo(4 + i * 16, 40 + Math.sin(t * 7 + i) * 4); c.stroke(); } }
  function drawTroll(c, e, t) { c.fillStyle = "#5e735d"; c.fillRect(18, 20, 42, 54); c.fillStyle = "#425342"; c.beginPath(); c.arc(39, 17, 20, 0, Math.PI * 2); c.fill(); c.fillStyle = "#d8d0b8"; c.fillRect(58, 38 + Math.sin(t * 4) * 3, 18, 9); }
  function drawSerpent(c, e, t) { c.strokeStyle = "#315f43"; c.lineWidth = 18; c.beginPath(); c.moveTo(7, 22); c.quadraticCurveTo(26, 5 + Math.sin(t * 6) * 6, 46, 22); c.quadraticCurveTo(59, 35, 72, 22); c.stroke(); c.fillStyle = "#1e3c2b"; c.beginPath(); c.moveTo(58, 12); c.lineTo(76, 20); c.lineTo(58, 30); c.fill(); }
  function drawGolem(c, e, t) { c.fillStyle = "#7b3c25"; c.fillRect(14, 20, 48, 57); c.fillStyle = "#2a1a17"; c.fillRect(21, 4, 34, 24); c.fillStyle = "#ffb04d"; c.fillRect(30, 12, 8, 8); c.fillRect(46, 12, 8, 8); c.fillStyle = "#f05b2d"; c.beginPath(); c.arc(39, 65, 15 + Math.sin(t * 8) * 2, 0, Math.PI * 2); c.fill(); }
  function drawIceBeast(c, e, t) { c.fillStyle = "#6ca1b6"; c.beginPath(); c.ellipse(38, 38, 36, 25, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = "#d8fbff"; c.beginPath(); c.moveTo(28, 8); c.lineTo(36, 0); c.lineTo(42, 13); c.lineTo(52, 2); c.lineTo(56, 18); c.fill(); legs(c, 55, 15, t, "#477386"); }
  function drawRaven(c, e, t) { const flap = Math.sin(t * 10) * 12; c.fillStyle = "#25223a"; c.beginPath(); c.arc(31, 24, 14, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(25, 25); c.lineTo(0, 8 + flap); c.lineTo(9, 38); c.moveTo(38, 25); c.lineTo(63, 8 - flap); c.lineTo(53, 38); c.fill(); c.fillStyle = "#6b5bd6"; c.beginPath(); c.moveTo(43, 22); c.lineTo(62, 27); c.lineTo(43, 33); c.fill(); }
  function drawGiant(c, e, t) { c.fillStyle = "#68635d"; c.fillRect(20, 28, 52, 66); c.fillStyle = "#4d4945"; c.fillRect(28, 5, 36, 30); c.fillStyle = "#858079"; c.fillRect(8, 44, 20, 36); c.fillRect(66, 44 + Math.sin(t * 3) * 4, 20, 36); }
  function drawGuardian(c, e, t) { c.fillStyle = "#605179"; c.fillRect(20, 28, 56, 70); c.fillStyle = "#312844"; c.beginPath(); c.moveTo(48, 0); c.lineTo(78, 28); c.lineTo(18, 28); c.fill(); c.strokeStyle = "#d8c879"; c.lineWidth = 5; c.beginPath(); c.arc(48, 54, 22 + Math.sin(t * 4) * 2, 0, Math.PI * 2); c.stroke(); }
  function drawHp(c, x, y, w, r) { c.fillStyle = "rgba(0,0,0,.5)"; c.fillRect(x, y, w, 5); c.fillStyle = "#d85b56"; c.fillRect(x, y, w * Math.max(0, r), 5); }
})();
