(() => {
  "use strict";
  AR.Unit = class {
    constructor(stats, side, x) {
      this.stats = { ...stats };
      Object.assign(this, {
        side, x, y: AR.WORLD.groundY, w: 48 * (stats.size || 1), h: 62 * (stats.size || 1),
        name: stats.name, maxHp: stats.hp, hp: stats.hp, damage: stats.damage, range: stats.range,
        attackSpeed: stats.attackSpeed, speed: stats.speed, type: stats.type, role: stats.role,
        xp: stats.xp || 0, level: stats.level || 1, attackTimer: AR.rand(0, .3), state: "walk",
        hitFlash: 0, deathTime: 0, slow: 0, rally: 0, burn: 0, dead: false, removed: false,
      });
    }
    get centerX() { return this.x + this.w / 2; }
    get left() { return this.x; }
    get right() { return this.x + this.w; }
    get attackInterval() { return 1 / Math.max(.15, this.attackSpeed * (this.rally > 0 ? 1.22 : 1)); }
    damage(amount) { this.hp -= amount; this.hitFlash = .12; if (this.hp <= 0) { this.dead = true; this.state = "death"; } }
    update(dt, game) {
      if (this.dead) { this.deathTime += dt; if (this.deathTime > .55) this.removed = true; return; }
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      this.slow = Math.max(0, this.slow - dt);
      this.rally = Math.max(0, this.rally - dt);
      if (this.burn > 0) { this.burn -= dt; game.combat.damage(this, 5 * dt, null, "burnDot", false); game.particles.trail(this.centerX, this.y - this.h * .7, "#ff8239", 1); }
      this.attackTimer -= dt;
      const target = game.combat.pickTarget(this);
      if (target && AR.distance(this, target) <= this.range + target.w * .35) {
        this.state = "attack";
        if (this.attackTimer <= 0) this.attack(target, game);
      } else {
        this.state = "walk";
        const dir = this.side === "ally" ? 1 : -1;
        const slow = this.slow > 0 ? .55 : 1;
        const boost = this.rally > 0 ? 1.22 : 1;
        this.x += dir * this.speed * slow * boost * dt;
      }
    }
    attack(target, game) {
      this.attackTimer = this.attackInterval;
      const crit = Math.random() < .12;
      const damage = this.damage * (this.side === "ally" ? game.mods.allyDamage : 1) * (this.rally > 0 ? 1.24 : 1) * (crit ? 1.85 : 1);
      const ranged = ["ranged", "burn", "slow", "chain", "longshot"].includes(this.type);
      if (ranged) {
        game.projectiles.push(new AR.Projectile({ x: this.centerX, y: this.y - this.h * .58, side: this.side, damage, speed: this.type === "longshot" ? 650 : 460, target, color: projectileColor(this.type), owner: this, type: this.type }));
      } else {
        game.combat.damage(target, this.type === "charge" ? damage * 1.45 : damage, this, this.type, true, crit);
      }
      if (this.type === "slow") target.slow = 2.6;
      if (this.type === "burn") target.burn = 3;
    }
    addXp(amount, game) {
      if (this.side !== "ally") return;
      this.xp += amount;
      const need = 42 + this.level * 30;
      if (this.xp >= need) {
        this.xp -= need;
        this.level += 1;
        this.maxHp *= 1.18; this.hp = this.maxHp; this.damage *= 1.16;
        if (this.range > 95) this.range *= 1.07; else this.attackSpeed *= 1.07;
        game.float(`${this.name} Level ${this.level}!`, this.centerX, this.y - this.h - 38, "#fff176", 22);
      }
    }
    draw(c) {
      c.save();
      if (this.hitFlash > 0) c.filter = "brightness(1.9)";
      if (this.dead) c.globalAlpha = AR.clamp(1 - this.deathTime * 1.7, 0, 1);
      const dir = this.side === "ally" ? 1 : -1;
      c.translate(this.centerX, 0); c.scale(dir, 1); c.translate(-this.w / 2, 0);
      drawSilhouette(c, this, 0, this.y - this.h);
      c.restore();
      if (!this.dead) AR.drawHp(c, this.x, this.y - this.h - 13, this.w, 6, this.hp / this.maxHp);
    }
  };
  function projectileColor(type) {
    return { burn: "#ff7b31", slow: "#83e6ff", chain: "#fff065", longshot: "#e9fbff", bolt: "#9cf4ff" }[type] || "#f5d27a";
  }
  function drawSilhouette(c, u, x, y) {
    const s = u.w / 48, t = performance.now() / 180, walk = u.state === "walk" ? Math.sin(t) * 4 : 0, attack = u.state === "attack" ? Math.sin(t * 2) * 6 : 0;
    const fill = { ally: "#d8b46c", enemy: "#6a5267" }[u.side];
    c.fillStyle = fill;
    if (u.role === "duelist") return bladePup(c, x, y, s, walk, attack);
    if (u.role === "archer") return thornHare(c, x, y, s, attack);
    if (u.role === "guardian") return shellback(c, x, y, s, walk);
    if (u.role === "skirmisher") return emberFox(c, x, y, s, walk);
    if (u.role === "breaker") return ironRam(c, x, y, s, attack);
    if (u.role === "control") return frostOwl(c, x, y, s, t);
    if (u.role === "arc") return sparkLynx(c, x, y, s, attack);
    if (u.role === "fortress") return stoneback(c, x, y, s);
    if (u.role === "lancer") return windCrane(c, x, y, s, attack);
    if (u.role === "champion") return sunLion(c, x, y, s, attack);
    enemyShape(c, x, y, s, u);
  }
  function bladePup(c, x, y, s, walk, atk) { c.fillStyle = "#d2a16c"; c.fillRect(x + 8*s, y + 26*s + walk, 30*s, 19*s); c.beginPath(); c.arc(x + 38*s, y + 22*s, 13*s, 0, Math.PI*2); c.fill(); c.strokeStyle="#e9edf4"; c.lineWidth=3*s; c.beginPath(); c.moveTo(x+7*s,y+28*s); c.lineTo(x-9*s-atk,y+15*s); c.moveTo(x+35*s,y+31*s); c.lineTo(x+55*s+atk,y+19*s); c.stroke(); }
  function thornHare(c, x, y, s, atk) { c.fillStyle="#8fdc92"; c.fillRect(x+16*s,y+22*s,18*s,38*s); c.beginPath(); c.ellipse(x+25*s,y+16*s,12*s,16*s,0,0,Math.PI*2); c.fill(); c.fillRect(x+18*s,y-16*s,7*s,28*s); c.fillRect(x+29*s,y-14*s,7*s,28*s); c.strokeStyle="#442b28"; c.lineWidth=3*s; c.beginPath(); c.arc(x+41*s,y+32*s,20*s,-1.2,1.2); c.stroke(); c.strokeStyle="#e7d186"; c.beginPath(); c.moveTo(x+35*s,y+33*s); c.lineTo(x+72*s+atk,y+29*s); c.stroke(); }
  function shellback(c, x, y, s, walk) { c.fillStyle="#637a5d"; c.fillRect(x+6*s,y+38*s,44*s,24*s); c.fillStyle="#32452f"; c.beginPath(); c.ellipse(x+30*s,y+35*s,34*s,23*s,0,Math.PI,0,true); c.fill(); c.fillStyle="#89a978"; c.beginPath(); c.arc(x+52*s,y+39*s,11*s,0,Math.PI*2); c.fill(); }
  function emberFox(c, x, y, s, walk) { c.fillStyle="#ff8845"; c.fillRect(x+8*s,y+30*s+walk,35*s,20*s); c.beginPath(); c.arc(x+45*s,y+25*s,12*s,0,Math.PI*2); c.fill(); c.strokeStyle="#ffcf56"; c.lineWidth=8*s; c.beginPath(); c.moveTo(x+5*s,y+34*s); c.quadraticCurveTo(x-20*s,y+14*s,x+0*s,y+2*s); c.stroke(); }
  function ironRam(c, x, y, s, atk) { c.fillStyle="#9ca0a7"; c.fillRect(x+6*s,y+25*s,42*s,32*s); c.fillStyle="#4c5360"; c.fillRect(x+20*s,y+18*s,28*s,22*s); c.strokeStyle="#e6e0cf"; c.lineWidth=5*s; c.beginPath(); c.arc(x+52*s+atk,y+20*s,16*s,1.1,4.8); c.stroke(); }
  function frostOwl(c, x, y, s, t) { c.fillStyle="#9fe7ff"; c.beginPath(); c.ellipse(x+25*s,y+28*s+Math.sin(t)*3,20*s,26*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#d9fbff"; c.beginPath(); c.ellipse(x+3*s,y+30*s,20*s,9*s,Math.sin(t)*.4,0,Math.PI*2); c.ellipse(x+47*s,y+30*s,20*s,9*s,-Math.sin(t)*.4,0,Math.PI*2); c.fill(); }
  function sparkLynx(c, x, y, s, atk) { c.fillStyle="#f7df53"; c.fillRect(x+9*s,y+30*s,34*s,18*s); c.beginPath(); c.arc(x+44*s,y+24*s,12*s,0,Math.PI*2); c.fill(); c.strokeStyle="#fff"; c.lineWidth=3*s; c.beginPath(); c.moveTo(x+18*s,y+20*s); c.lineTo(x+6*s-atk,y+4*s); c.lineTo(x+25*s,y+12*s); c.stroke(); }
  function stoneback(c, x, y, s) { c.fillStyle="#4f654d"; c.fillRect(x+3*s,y+33*s,56*s,30*s); c.fillStyle="#293b32"; c.fillRect(x+7*s,y+13*s,49*s,32*s); c.strokeStyle="#bdc9b2"; c.lineWidth=4*s; c.strokeRect(x+4*s,y+10*s,55*s,38*s); }
  function windCrane(c, x, y, s, atk) { c.fillStyle="#d8f3ff"; c.fillRect(x+23*s,y+12*s,12*s,52*s); c.beginPath(); c.arc(x+29*s,y+7*s,10*s,0,Math.PI*2); c.fill(); c.strokeStyle="#f9f4d0"; c.lineWidth=4*s; c.beginPath(); c.moveTo(x+35*s,y+30*s); c.lineTo(x+85*s+atk,y+18*s); c.stroke(); }
  function sunLion(c, x, y, s, atk) { c.fillStyle="#ffc24f"; c.fillRect(x+5*s,y+28*s,55*s,32*s); c.fillStyle="#e78f2f"; c.beginPath(); c.arc(x+58*s,y+25*s,24*s,0,Math.PI*2); c.fill(); c.fillStyle="#fff1a0"; c.beginPath(); c.arc(x+60*s,y+25*s,13*s,0,Math.PI*2); c.fill(); c.strokeStyle="#ffe07a"; c.lineWidth=5*s; c.beginPath(); c.moveTo(x+48*s,y+35*s); c.lineTo(x+78*s+atk,y+25*s); c.stroke(); }
  function enemyShape(c, x, y, s, u) { c.fillStyle=u.stats.color || "#6a5267"; c.fillRect(x+8*s,y+18*s,34*s,44*s); c.beginPath(); c.arc(x+25*s,y+10*s,14*s,0,Math.PI*2); c.fill(); c.fillStyle="#ff6f76"; c.fillRect(x+20*s,y+8*s,5*s,4*s); }
})();
