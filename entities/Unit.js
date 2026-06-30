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
        hitFlash: 0, deathTime: 0, slow: 0, rally: 0, burn: 0, poison: 0, dead: false, removed: false,
      });
    }
    get centerX() { return this.x + this.w / 2; }
    get left() { return this.x; }
    get right() { return this.x + this.w; }
    get xpToNext() { return 42 + this.level * 30; }
    get attackInterval() { return 1 / Math.max(.15, this.attackSpeed * (this.rally > 0 ? 1.22 : 1)); }
    damage(amount) { this.hp -= amount; this.hitFlash = .12; if (this.hp <= 0) { this.dead = true; this.state = "death"; } }
    update(dt, game) {
      if (this.dead) { this.deathTime += dt; if (this.deathTime > .55) this.removed = true; return; }
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      this.slow = Math.max(0, this.slow - dt);
      this.rally = Math.max(0, this.rally - dt);
      if (this.burn > 0) { this.burn -= dt; game.combat.damage(this, 5 * dt, null, "burnDot", false); game.particles.trail(this.centerX, this.y - this.h * .7, "#ff8239", 1); }
      if (this.poison > 0) { this.poison -= dt; game.combat.damage(this, 4 * dt, null, "poisonDot", false); game.particles.trail(this.centerX, this.y - this.h * .55, "#85e06b", 1); }
      this.attackTimer -= dt;
      const target = game.combat.pickTarget(this);
      const targetPadding = target?.isBase ? target.w * .65 : target?.w * .35;
      if (target && AR.distance(this, target) <= this.range + targetPadding) {
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
      const ranged = ["ranged", "burn", "slow", "chain", "longshot", "poison"].includes(this.type);
      if (ranged) {
        game.projectiles.push(new AR.Projectile({ x: this.centerX, y: this.y - this.h * .58, side: this.side, damage, speed: this.type === "longshot" ? 650 : 460, target, color: projectileColor(this.type), owner: this, type: this.type }));
      } else {
        game.combat.damage(target, this.type === "charge" ? damage * 1.45 : damage, this, this.type, true, crit);
      }
      if (this.type === "slow") target.slow = 2.6;
      if (this.type === "burn") target.burn = 3;
      if (this.type === "poison") target.poison = 4;
    }
    addXp(amount, game) {
      if (this.side !== "ally") return;
      this.xp += amount * game.mods.xpGain;
      while (this.xp >= this.xpToNext) {
        this.xp -= this.xpToNext;
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
      if (this.side === "enemy" && this.stats.enemyTint && !this.dead) {
        c.save();
        c.strokeStyle = "rgba(255, 48, 48, .85)";
        c.shadowColor = "#ff3030";
        c.shadowBlur = 12;
        c.lineWidth = 3;
        c.beginPath();
        c.ellipse(this.centerX, this.y - this.h * .5, this.w * .58, this.h * .55, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
      if (!this.dead) {
        if (this.side === "enemy") drawEnemyHp(c, this.x, this.y - this.h - 13, this.w, 6, this.hp / this.maxHp);
        else AR.drawHp(c, this.x, this.y - this.h - 13, this.w, 6, this.hp / this.maxHp);
      }
    }
  };
  function drawEnemyHp(c, x, y, w, h, ratio) {
    c.fillStyle = "rgba(32, 4, 7, .95)";
    c.fillRect(x, y, w, h);
    c.fillStyle = "#d7192f";
    c.fillRect(x, y, w * AR.clamp(ratio, 0, 1), h);
    c.strokeStyle = "rgba(255, 160, 160, .8)";
    c.lineWidth = 2;
    c.strokeRect(x, y, w, h);
  }
  function projectileColor(type) {
    return { burn: "#ff7b31", slow: "#83e6ff", chain: "#fff065", longshot: "#e9fbff", bolt: "#9cf4ff", poison: "#85e06b" }[type] || "#f5d27a";
  }
  function drawSilhouette(c, u, x, y) {
    const s = u.w / 48, t = performance.now() / 180, walk = u.state === "walk" ? Math.sin(t) * 4 : 0, attack = u.state === "attack" ? Math.sin(t * 2) * 6 : 0;
    const fill = { ally: "#d8b46c", enemy: "#6a5267" }[u.side];
    c.fillStyle = fill;
    const tinted = u.side === "enemy" && u.stats.enemyTint;
    const done = () => { if (tinted) c.restore(); };
    if (tinted) {
      c.save();
      c.globalAlpha = .98;
      c.filter = "sepia(.35) saturate(1.8) hue-rotate(315deg) brightness(.78)";
    }
    if (u.role === "duelist") { bladePup(c, x, y, s, walk, attack); return done(); }
    if (u.role === "archer") { thornHare(c, x, y, s, attack); return done(); }
    if (u.role === "guardian") { shellback(c, x, y, s, walk); return done(); }
    if (u.role === "skirmisher") { emberFox(c, x, y, s, walk); return done(); }
    if (u.role === "breaker") { ironRam(c, x, y, s, attack); return done(); }
    if (u.role === "control") { frostOwl(c, x, y, s, t); return done(); }
    if (u.role === "arc") { sparkLynx(c, x, y, s, attack); return done(); }
    if (u.role === "fortress") { stoneback(c, x, y, s); return done(); }
    if (u.role === "lancer") { windCrane(c, x, y, s, attack); return done(); }
    if (u.role === "champion") { sunLion(c, x, y, s, attack); return done(); }
    if (u.role === "wolfRaider") { wolfRaider(c, x, y, s, walk, attack); return done(); }
    if (u.role === "boarBrute") { boarBrute(c, x, y, s, walk); return done(); }
    if (u.role === "crowShaman") { crowShaman(c, x, y, s, attack); return done(); }
    if (u.role === "serpentSpitter") { serpentSpitter(c, x, y, s, attack); return done(); }
    if (u.role === "rhinoBreaker") { rhinoBreaker(c, x, y, s, attack); return done(); }
    if (u.role === "elderWarbeast") { elderWarbeast(c, x, y, s, attack); return done(); }
    enemyShape(c, x, y, s, u);
    done();
  }
  function bladePup(c, x, y, s, walk, atk) { c.fillStyle = "#b77f50"; c.beginPath(); c.ellipse(x+24*s,y+38*s+walk,24*s,12*s,0,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+47*s,y+29*s,12*s,0,Math.PI*2); c.fill(); c.fillStyle="#6b412e"; c.beginPath(); c.moveTo(x+42*s,y+18*s); c.lineTo(x+47*s,y+4*s); c.lineTo(x+52*s,y+18*s); c.fill(); c.beginPath(); c.moveTo(x+51*s,y+18*s); c.lineTo(x+61*s,y+8*s); c.lineTo(x+59*s,y+24*s); c.fill(); c.strokeStyle="#5d392a"; c.lineWidth=5*s; c.beginPath(); c.moveTo(x+3*s,y+35*s); c.quadraticCurveTo(x-10*s,y+18*s,x+8*s,y+18*s); c.stroke(); legs(c,x+12*s,y+47*s,s,walk,4); c.strokeStyle="#e9edf4"; c.lineWidth=3*s; c.beginPath(); c.moveTo(x+38*s,y+36*s); c.lineTo(x+59*s+atk,y+30*s); c.moveTo(x+42*s,y+40*s); c.lineTo(x+63*s+atk,y+44*s); c.stroke(); }
  function thornHare(c, x, y, s, atk) { c.fillStyle="#b8d990"; c.beginPath(); c.ellipse(x+26*s,y+38*s,18*s,27*s,0,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+28*s,y+15*s,12*s,0,Math.PI*2); c.fill(); c.fillRect(x+19*s,y-20*s,7*s,31*s); c.fillRect(x+31*s,y-18*s,7*s,31*s); c.fillStyle="#f0c7d8"; c.fillRect(x+21*s,y-16*s,3*s,25*s); c.fillRect(x+33*s,y-14*s,3*s,24*s); c.strokeStyle="#5a3a2f"; c.lineWidth=3*s; c.beginPath(); c.arc(x+45*s,y+32*s,22*s,-1.2,1.25); c.stroke(); c.strokeStyle="#e7d186"; c.beginPath(); c.moveTo(x+38*s,y+33*s); c.lineTo(x+78*s+atk,y+28*s); c.stroke(); c.fillStyle="#6f4a35"; c.fillRect(x+8*s,y+38*s,7*s,25*s); }
  function shellback(c, x, y, s, walk) { c.fillStyle="#5f7c55"; c.beginPath(); c.ellipse(x+29*s,y+43*s,33*s,17*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#293d2b"; c.beginPath(); c.ellipse(x+30*s,y+33*s,35*s,25*s,0,Math.PI,0,true); c.fill(); c.strokeStyle="#8fb17e"; c.lineWidth=3*s; c.beginPath(); c.arc(x+30*s,y+33*s,22*s,Math.PI,0); c.stroke(); c.fillStyle="#8aad78"; c.beginPath(); c.arc(x+61*s,y+38*s,10*s,0,Math.PI*2); c.fill(); legs(c,x+12*s,y+53*s,s,walk*.25,4); }
  function emberFox(c, x, y, s, walk) { c.fillStyle="#e86f33"; c.beginPath(); c.ellipse(x+28*s,y+39*s+walk,28*s,13*s,0,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+54*s,y+30*s,11*s,0,Math.PI*2); c.fill(); c.fillStyle="#fff1c5"; c.beginPath(); c.moveTo(x+62*s,y+30*s); c.lineTo(x+75*s,y+34*s); c.lineTo(x+62*s,y+38*s); c.fill(); c.strokeStyle="#ffcf56"; c.lineWidth=9*s; c.beginPath(); c.moveTo(x+4*s,y+36*s); c.quadraticCurveTo(x-22*s,y+5*s,x+9*s,y+2*s); c.stroke(); c.strokeStyle="#ff7b31"; c.lineWidth=4*s; c.beginPath(); c.moveTo(x+4*s,y+36*s); c.quadraticCurveTo(x-16*s,y+10*s,x+7*s,y+7*s); c.stroke(); legs(c,x+16*s,y+49*s,s,walk,4); }
  function ironRam(c, x, y, s, atk) { c.fillStyle="#8b9098"; c.beginPath(); c.ellipse(x+30*s,y+38*s,31*s,20*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#4c5360"; c.beginPath(); c.ellipse(x+51*s,y+30*s,20*s,17*s,0,0,Math.PI*2); c.fill(); c.strokeStyle="#e6e0cf"; c.lineWidth=5*s; c.beginPath(); c.arc(x+59*s+atk,y+21*s,17*s,1.1,4.9); c.arc(x+47*s+atk,y+20*s,15*s,-1.7,2.2); c.stroke(); c.fillStyle="#59606b"; c.fillRect(x+12*s,y+22*s,35*s,10*s); legs(c,x+15*s,y+53*s,s,0,4); }
  function frostOwl(c, x, y, s, t) { const flap=Math.sin(t)*6; c.fillStyle="#9fe7ff"; c.beginPath(); c.ellipse(x+28*s,y+29*s+flap*.15,20*s,27*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#d9fbff"; c.beginPath(); c.ellipse(x+2*s,y+31*s,25*s,10*s,flap*.05,0,Math.PI*2); c.ellipse(x+53*s,y+31*s,25*s,10*s,-flap*.05,0,Math.PI*2); c.fill(); c.fillStyle="#20344b"; c.beginPath(); c.arc(x+21*s,y+22*s,3*s,0,Math.PI*2); c.arc(x+35*s,y+22*s,3*s,0,Math.PI*2); c.fill(); c.fillStyle="#ffd36b"; c.beginPath(); c.moveTo(x+28*s,y+25*s); c.lineTo(x+34*s,y+31*s); c.lineTo(x+22*s,y+31*s); c.fill(); }
  function sparkLynx(c, x, y, s, atk) { c.fillStyle="#d8b842"; c.beginPath(); c.ellipse(x+29*s,y+39*s,27*s,12*s,0,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+55*s,y+29*s,12*s,0,Math.PI*2); c.fill(); c.fillStyle="#8e722d"; c.beginPath(); c.moveTo(x+49*s,y+19*s); c.lineTo(x+52*s,y+5*s); c.lineTo(x+57*s,y+19*s); c.moveTo(x+58*s,y+19*s); c.lineTo(x+66*s,y+8*s); c.lineTo(x+65*s,y+23*s); c.fill(); legs(c,x+16*s,y+49*s,s,0,4); c.strokeStyle="#fff176"; c.lineWidth=3*s; c.beginPath(); c.moveTo(x+20*s,y+22*s); c.lineTo(x+4*s-atk,y+4*s); c.lineTo(x+25*s,y+12*s); c.lineTo(x+15*s,y-4*s); c.stroke(); }
  function stoneback(c, x, y, s) { c.fillStyle="#4f654d"; c.beginPath(); c.ellipse(x+36*s,y+45*s,39*s,20*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#26382f"; c.beginPath(); c.ellipse(x+34*s,y+28*s,40*s,28*s,0,Math.PI,0,true); c.fill(); c.strokeStyle="#bdc9b2"; c.lineWidth=4*s; c.strokeRect(x+6*s,y+12*s,60*s,38*s); c.fillStyle="#7e9670"; c.beginPath(); c.arc(x+74*s,y+42*s,12*s,0,Math.PI*2); c.fill(); legs(c,x+15*s,y+58*s,s,0,4); }
  function windCrane(c, x, y, s, atk) { c.fillStyle="#d8f3ff"; c.beginPath(); c.ellipse(x+31*s,y+32*s,13*s,22*s,0,0,Math.PI*2); c.fill(); c.strokeStyle="#d8f3ff"; c.lineWidth=8*s; c.beginPath(); c.moveTo(x+34*s,y+18*s); c.quadraticCurveTo(x+54*s,y-5*s,x+64*s,y+10*s); c.stroke(); c.fillStyle="#f3fbff"; c.beginPath(); c.arc(x+66*s,y+10*s,8*s,0,Math.PI*2); c.fill(); c.strokeStyle="#27333c"; c.lineWidth=3*s; c.beginPath(); c.moveTo(x+25*s,y+51*s); c.lineTo(x+18*s,y+70*s); c.moveTo(x+35*s,y+51*s); c.lineTo(x+40*s,y+72*s); c.stroke(); c.strokeStyle="#f9f4d0"; c.lineWidth=4*s; c.beginPath(); c.moveTo(x+42*s,y+30*s); c.lineTo(x+96*s+atk,y+18*s); c.stroke(); }
  function sunLion(c, x, y, s, atk) { c.fillStyle="#d79736"; c.beginPath(); c.ellipse(x+36*s,y+42*s,36*s,20*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#c66f2d"; c.beginPath(); c.arc(x+72*s,y+30*s,27*s,0,Math.PI*2); c.fill(); c.fillStyle="#ffe07a"; c.beginPath(); c.arc(x+74*s,y+30*s,15*s,0,Math.PI*2); c.fill(); c.strokeStyle="#ffe07a"; c.lineWidth=6*s; c.beginPath(); c.moveTo(x+53*s,y+43*s); c.lineTo(x+91*s+atk,y+30*s); c.stroke(); c.strokeStyle="#b86c2a"; c.lineWidth=8*s; c.beginPath(); c.moveTo(x+2*s,y+39*s); c.quadraticCurveTo(x-18*s,y+15*s,x+7*s,y+10*s); c.stroke(); legs(c,x+19*s,y+57*s,s,0,4); }
  function wolfRaider(c, x, y, s, walk, atk) { c.fillStyle="#5f5262"; c.beginPath(); c.ellipse(x+30*s,y+39*s+walk,30*s,13*s,0,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+60*s,y+29*s,13*s,0,Math.PI*2); c.fill(); c.fillStyle="#342f3a"; c.beginPath(); c.moveTo(x+54*s,y+17*s); c.lineTo(x+59*s,y+2*s); c.lineTo(x+64*s,y+17*s); c.fill(); c.strokeStyle="#4a4250"; c.lineWidth=5*s; c.beginPath(); c.moveTo(x+3*s,y+37*s); c.quadraticCurveTo(x-12*s,y+17*s,x+8*s,y+18*s); c.stroke(); legs(c,x+17*s,y+50*s,s,walk,4); }
  function boarBrute(c, x, y, s, walk) { c.fillStyle="#75433d"; c.beginPath(); c.ellipse(x+37*s,y+43*s,38*s,19*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#5a302d"; c.beginPath(); c.ellipse(x+72*s,y+39*s,20*s,14*s,0,0,Math.PI*2); c.fill(); c.strokeStyle="#f3ead9"; c.lineWidth=4*s; c.beginPath(); c.moveTo(x+82*s,y+43*s); c.quadraticCurveTo(x+100*s,y+51*s,x+92*s,y+31*s); c.stroke(); legs(c,x+22*s,y+57*s,s,walk*.3,4); }
  function crowShaman(c, x, y, s, atk) { c.fillStyle="#262235"; c.beginPath(); c.ellipse(x+30*s,y+35*s,20*s,28*s,0,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+34*s,y+10*s,13*s,0,Math.PI*2); c.fill(); c.fillStyle="#1a1724"; c.beginPath(); c.ellipse(x+3*s,y+37*s,27*s,10*s,-.5,0,Math.PI*2); c.ellipse(x+55*s,y+37*s,27*s,10*s,.5,0,Math.PI*2); c.fill(); c.fillStyle="#b19cff"; c.beginPath(); c.arc(x+62*s+atk,y+22*s,7*s,0,Math.PI*2); c.fill(); c.fillStyle="#d6c7ff"; c.beginPath(); c.moveTo(x+47*s,y+11*s); c.lineTo(x+65*s,y+15*s); c.lineTo(x+47*s,y+19*s); c.fill(); }
  function serpentSpitter(c, x, y, s, atk) { c.strokeStyle="#416b3f"; c.lineWidth=15*s; c.beginPath(); c.moveTo(x+0*s,y+50*s); c.bezierCurveTo(x+20*s,y+25*s,x+45*s,y+70*s,x+67*s,y+35*s); c.stroke(); c.fillStyle="#5a9b50"; c.beginPath(); c.ellipse(x+73*s,y+32*s,16*s,10*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#9dff72"; c.beginPath(); c.arc(x+93*s+atk,y+31*s,5*s,0,Math.PI*2); c.fill(); }
  function rhinoBreaker(c, x, y, s, atk) { c.fillStyle="#686870"; c.beginPath(); c.ellipse(x+42*s,y+42*s,43*s,22*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#55545c"; c.beginPath(); c.ellipse(x+82*s,y+35*s,24*s,16*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#e4dfce"; c.beginPath(); c.moveTo(x+98*s+atk,y+34*s); c.lineTo(x+122*s+atk,y+27*s); c.lineTo(x+101*s+atk,y+43*s); c.fill(); legs(c,x+25*s,y+58*s,s,0,4); }
  function elderWarbeast(c, x, y, s, atk) { c.fillStyle="#5b2632"; c.beginPath(); c.ellipse(x+58*s,y+66*s,58*s,34*s,0,0,Math.PI*2); c.fill(); c.fillStyle="#8f2f42"; c.beginPath(); c.arc(x+112*s,y+42*s,35*s,0,Math.PI*2); c.fill(); c.strokeStyle="#f0e4ce"; c.lineWidth=8*s; c.beginPath(); c.arc(x+121*s+atk,y+25*s,26*s,1.1,4.8); c.arc(x+100*s+atk,y+25*s,24*s,-1.8,2.2); c.stroke(); c.fillStyle="#2b1119"; c.fillRect(x+30*s,y+28*s,62*s,18*s); legs(c,x+28*s,y+92*s,s,0,4); }
  function legs(c, x, y, s, walk, count) { c.fillStyle = c.fillStyle; for (let i=0;i<count;i++) c.fillRect(x + i*10*s, y + (i%2?walk:-walk)*.35, 5*s, 18*s); }
  function enemyShape(c, x, y, s, u) { c.fillStyle=u.stats.color || "#6a5267"; c.fillRect(x+8*s,y+18*s,34*s,44*s); c.beginPath(); c.arc(x+25*s,y+10*s,14*s,0,Math.PI*2); c.fill(); c.fillStyle="#ff6f76"; c.fillRect(x+20*s,y+8*s,5*s,4*s); }
})();
