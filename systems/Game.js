(() => {
  "use strict";

  AR.Game = class {
    constructor() {
      this.canvas = document.getElementById("gameCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.input = new AR.InputSystem();
      this.levelIndex = 0; this.totalGems = 0; this.projectiles = []; this.particles = []; this.status = "Explore"; this.ended = false; this.paused = false; this.cameraShake = 0; this.transition = 1;
      this.player = null; this.loadLevel(0, true);
      this.camera = new AR.CameraSystem(this.level); this.renderer = new AR.RenderSystem(this); this.hud = new AR.Hud(this);
      this.last = performance.now(); this.resize();
      window.addEventListener("resize", () => this.resize());
      document.getElementById("restartButton").addEventListener("click", () => this.handleModalButton());
      document.getElementById("abilityChoices").addEventListener("click", (event) => {
        const button = event.target.closest("[data-ability]"); if (button) this.chooseAbility(button.dataset.ability);
      });
      requestAnimationFrame((time) => this.loop(time));
    }
    loadLevel(index, freshPlayer = false) {
      this.levelIndex = index; this.level = buildLevel(AR.LEVELS[index]); this.physics = new AR.PhysicsSystem(this.level);
      if (freshPlayer || !this.player) this.player = new AR.Player(this.level.spawn); else this.player.respawn(this.level.spawn);
      this.projectiles = []; this.particles = []; this.gemsCollected = 0; this.status = "Explore"; this.ended = false; this.paused = false; this.transition = 1;
      if (this.camera) { this.camera.level = this.level; this.camera.x = 0; }
      document.getElementById("levelName").textContent = this.level.name;
      document.getElementById("levelHint").textContent = this.level.mechanics.join(" / ");
      if (index === 7) this.showBossIntro();
    }
    resize() {
      const rect = this.canvas.getBoundingClientRect(); const dpr = Math.max(1, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(rect.width * dpr); this.canvas.height = Math.round(rect.height * dpr);
      this.ctx.setTransform(this.canvas.width / AR.VIEW.width, 0, 0, this.canvas.height / AR.VIEW.height, 0, 0);
    }
    loop(time) {
      const dt = Math.min((time - this.last) / 1000, 1 / 30); this.last = time;
      if (!this.ended && !this.paused) this.update(dt);
      else this.updateParticles(dt);
      this.transition = Math.max(0, this.transition - dt * 1.8); this.cameraShake = Math.max(0, this.cameraShake - dt * 18);
      this.renderer.draw(); this.hud.update(); requestAnimationFrame((next) => this.loop(next));
    }
    update(dt) {
      const slow = this.player.activeAbility === "time" ? .5 : 1;
      this.updatePlatforms(dt, slow); this.updateHazards(dt, slow);
      this.player.update(dt, this.input, this.physics, this);
      this.level.enemies.forEach((enemy) => enemy.update(dt, this.physics, slow, this.player));
      this.level.gems.forEach((gem) => gem.update(dt));
      this.updateProjectiles(dt); this.updateParticles(dt);
      this.camera.follow(this.player);
      this.collectItems(); this.resolveBlocks(); this.resolveHazards(); this.resolveEnemyContacts(); this.resolveCheckpoints(); this.checkFall(); this.checkFinish();
    }
    updatePlatforms(dt, slow) {
      this.level.platforms.forEach((p) => {
        p.dx = 0; p.dy = 0;
        if (p.moving) {
          const oldX = p.x, oldY = p.y, m = p.moving; const value = (m.axis === "x" ? p.x : p.y) + m.speed * m.dir * dt * slow;
          if (value < m.from || value > m.to) m.dir *= -1;
          if (m.axis === "x") p.x = AR.clamp(value, m.from, m.to); else p.y = AR.clamp(value, m.from, m.to);
          p.dx = p.x - oldX; p.dy = p.y - oldY;
        }
        if (p.falling && p.falling.armed) {
          p.falling.timer -= dt * slow;
          if (p.falling.timer <= 0) p.y += 420 * dt * slow;
          if (p.y > this.level.height + 120) p.disabled = true;
        }
      });
    }
    updateHazards(dt, slow) {
      this.level.hazards.forEach((h) => {
        h.t = (h.t || 0) + dt * slow;
        if (h.kind === "boulder") { h.x += (h.dir || 1) * h.speed * dt * slow; if (!h.dir) h.dir = 1; if (h.x < h.from || h.x > h.to) h.dir *= -1; }
      });
    }
    updateProjectiles(dt) {
      this.projectiles.forEach((p) => { p.x += p.vx * dt; p.life -= dt; });
      this.projectiles.forEach((p) => this.level.enemies.forEach((e) => { if (!e.dead && AR.rectOverlap(p, e)) { e.damage(1, this); p.life = 0; this.status = "Spirit hit"; } }));
      this.projectiles = this.projectiles.filter((p) => p.life > 0);
    }
    updateParticles(dt) {
      this.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; p.life -= dt; p.t += dt; });
      this.particles = this.particles.filter((p) => p.life > 0);
    }
    collectItems() {
      this.level.gems.forEach((gem) => { if (!gem.collected && (!gem.hidden || this.player.activeAbility === "treasure") && AR.rectOverlap(this.player, gem)) { gem.collected = true; this.gemsCollected += 1; this.totalGems += 1; this.burst(gem.x, gem.y, "spark", 7); } });
      this.level.powerups.forEach((p) => { if (!p.taken && AR.rectOverlap(this.player, p)) { p.taken = true; this.openStarChoices(); } });
      this.level.keys.forEach((k) => { if (!k.taken && AR.rectOverlap(this.player, { x: k.x, y: k.y, w: 30, h: 34 })) { k.taken = true; this.player.keys += 1; this.status = "Key found"; this.burst(k.x, k.y, "spark", 10); } });
      this.level.gates.forEach((g) => { const near = this.player.x + this.player.w >= g.x - 12 && this.player.x <= g.x + g.w + 12 && this.player.y + this.player.h > g.y && this.player.y < g.y + g.h; if (!g.open && near && this.player.keys > 0) { g.open = true; this.player.keys -= 1; this.status = "Gate opened"; this.cameraShake = 8; } });
      this.level.platforms.forEach((p) => { if (p.falling && this.player.riding === p && !p.falling.armed) { p.falling.armed = true; p.falling.timer = p.falling.delay; this.status = p.type === "bridge" ? "Bridge collapsing" : "Stone cracking"; } });
      this.level.pads.forEach((pad) => { if (AR.rectOverlap(this.player, pad) && this.player.vy >= 0 && this.player.prevY + this.player.h <= pad.y + 20) { this.player.y = pad.y - this.player.h; this.player.vy = AR.PHYSICS.bounceVelocity; this.status = "Bounce"; this.burst(pad.x + pad.w / 2, pad.y, "dust", 9); } });
    }
    resolveBlocks() { this.level.blocks.forEach((b) => { if (!b.broken && this.player.canBreakBlocks() && AR.rectOverlap(this.player, b)) { b.broken = true; this.status = "Stone shattered"; this.burst(b.x + 24, b.y + 24, "dust", 12); } }); }
    resolveHazards() {
      for (const h of this.level.hazards) {
        const box = hazardBox(h); if (!box || !AR.rectOverlap(this.player, box)) continue;
        if (this.player.activeAbility === "guardian") { h.disabled = true; this.burst(box.x + box.w / 2, box.y + box.h / 2, "spark", 14); continue; }
        if (["wind", "waterfall"].includes(h.kind)) continue;
        if (this.player.hurt(this, h.kind)) { this.status = h.kind; if (this.player.hp <= 0) this.loseLife(); }
      }
      this.level.hazards = this.level.hazards.filter((h) => !h.disabled);
    }
    resolveEnemyContacts() {
      this.level.enemies.forEach((enemy) => {
        if (enemy.dead || !AR.rectOverlap(this.player, enemy)) return;
        const stomp = this.player.vy > 120 && this.player.prevY + this.player.h <= enemy.y + 22;
        if (stomp || this.player.isDangerous()) { enemy.damage(stomp ? 2 : 9, this); this.player.vy = AR.PHYSICS.jumpVelocity * .55; this.status = enemy.dead ? "Enemy defeated" : "Enemy hit"; }
        else if (this.player.hurt(this, enemy.type)) { this.status = "Ouch"; if (this.player.hp <= 0) this.loseLife(); }
      });
      this.level.enemies = this.level.enemies.filter((enemy) => !enemy.dead || enemy.deathTimer <= .55);
    }
    resolveCheckpoints() {
      this.level.checkpoints.forEach((cp) => { if (!cp.active && AR.rectOverlap(this.player, { x: cp.x - 10, y: cp.y, w: 46, h: 96 })) { cp.active = true; cp.t = .8; this.level.spawn = { x: cp.x, y: cp.y - 76 }; this.status = "Checkpoint"; this.burst(cp.x, cp.y + 30, "spark", 16); } });
    }
    openStarChoices() {
      this.paused = true; this.status = "Choose a star ability";
      const choices = AR.shuffle(Object.keys(AR.STAR_ABILITIES)).slice(0, 3);
      document.getElementById("endEyebrow").textContent = "Power Star";
      document.getElementById("endTitle").textContent = "Choose One Ability";
      document.getElementById("endText").textContent = "Permanent until Arora Rider takes damage.";
      document.getElementById("restartButton").hidden = true;
      const wrap = document.getElementById("abilityChoices");
      wrap.hidden = false; wrap.innerHTML = choices.map((key) => { const a = AR.STAR_ABILITIES[key]; return `<button class="ability-card" data-ability="${key}"><strong>${a.icon} ${a.name}</strong><span>${a.description}</span></button>`; }).join("");
      document.getElementById("endModal").hidden = false;
    }
    chooseAbility(key) {
      this.player.setAbility(key); this.status = AR.STAR_ABILITIES[key].name; this.paused = false;
      document.getElementById("endModal").hidden = true; document.getElementById("restartButton").hidden = false; document.getElementById("abilityChoices").hidden = true;
      this.burst(this.player.x + this.player.w / 2, this.player.y + 35, "spark", 18);
    }
    burst(x, y, kind, count) { for (let i = 0; i < count; i++) this.particles.push({ x, y, vx: AR.rand(-150, 150), vy: AR.rand(-220, 40), life: AR.rand(.35, .85), t: 0, kind, g: kind === "dust" ? 520 : 260 }); }
    loseLife() { this.player.lives -= 1; if (this.player.lives <= 0) this.end(false, "Arora Rider Fell", "Try again from the beginning."); else this.player.respawn(this.level.spawn); }
    checkFall() { if (this.player.y > this.level.height + 180) this.loseLife(); }
    checkFinish() {
      if (this.level.secretExit && AR.rectOverlap(this.player, this.level.secretExit)) { this.end(true, "Secret Exit Found", `${this.level.name} cleared through the hidden route.`); return; }
      if (!AR.rectOverlap(this.player, this.level.portal)) return;
      if (this.levelIndex < AR.LEVELS.length - 1) this.end(true, "Portal Reached", `${this.level.name} complete. Gems: ${this.gemsCollected} / ${this.level.gems.length}.`);
      else this.end(true, "Demo Complete", `All 8 prototype levels cleared. Total gems: ${this.totalGems}.`);
    }
    showBossIntro() { this.status = "Ancient Guardian ahead"; this.cameraShake = 10; }
    end(victory, title, text) {
      this.ended = true; this.paused = false;
      document.getElementById("endEyebrow").textContent = victory ? "Level Complete" : "Defeat";
      document.getElementById("endTitle").textContent = title; document.getElementById("endText").textContent = text;
      document.getElementById("restartButton").hidden = false; document.getElementById("abilityChoices").hidden = true;
      document.getElementById("restartButton").textContent = victory && this.levelIndex < AR.LEVELS.length - 1 ? "Next Level" : "Restart";
      document.getElementById("endModal").hidden = false; this.transition = 1;
    }
    handleModalButton() {
      document.getElementById("endModal").hidden = true;
      if (this.ended && this.levelIndex < AR.LEVELS.length - 1 && document.getElementById("endEyebrow").textContent === "Level Complete") this.loadLevel(this.levelIndex + 1);
      else location.reload();
    }
  };

  function hazardBox(h) {
    if (h.kind === "blade") return { x: h.x - 8, y: h.y - 8, w: h.w + 16, h: h.h + 16 };
    if (h.kind === "log") return { x: h.pivotX - 80, y: h.pivotY + 80, w: 160, h: 44 };
    return h;
  }
  function buildLevel(data) {
    return {
      ...data,
      platforms: data.platforms.map((p) => ({ ...p, moving: p.moving ? { ...p.moving } : null, falling: p.falling ? { ...p.falling } : null })),
      gems: [...data.gems.map(([x, y]) => new AR.Collectible(x, y)), ...data.hiddenGems.map(([x, y]) => new AR.Collectible(x, y, "gem", true))],
      enemies: data.enemies.map((enemy) => new AR.PlatformEnemy(enemy)),
      powerups: data.powerups.map((p) => ({ ...p, taken: false })), hazards: data.hazards.map((h) => ({ ...h })), pads: data.pads.map((p) => ({ ...p })), blocks: data.blocks.map((b) => ({ ...b })),
      keys: data.keys.map((k) => ({ ...k })), gates: data.gates.map((g) => ({ ...g })), checkpoints: data.checkpoints.map((c) => ({ ...c })), portal: { ...data.portal }, secretExit: data.secretExit ? { ...data.secretExit } : null, spawn: { ...data.spawn },
    };
  }
})();
