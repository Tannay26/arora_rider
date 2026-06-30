(() => {
  "use strict";

  AR.Game = class {
    constructor() {
      this.canvas = document.getElementById("gameCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.input = new AR.InputSystem();
      this.levelIndex = 0; this.totalGems = 0; this.projectiles = []; this.status = "Explore"; this.ended = false;
      this.player = null; this.loadLevel(0, true);
      this.camera = new AR.CameraSystem(this.level); this.renderer = new AR.RenderSystem(this); this.hud = new AR.Hud(this);
      this.last = performance.now(); this.resize();
      window.addEventListener("resize", () => this.resize());
      document.getElementById("restartButton").addEventListener("click", () => this.handleModalButton());
      requestAnimationFrame((time) => this.loop(time));
    }
    loadLevel(index, freshPlayer = false) {
      this.levelIndex = index; this.level = buildLevel(AR.LEVELS[index]); this.physics = new AR.PhysicsSystem(this.level);
      if (freshPlayer || !this.player) this.player = new AR.Player(this.level.spawn); else this.player.respawn(this.level.spawn);
      this.projectiles = []; this.gemsCollected = 0; this.status = "Explore";
      if (this.camera) { this.camera.level = this.level; this.camera.x = 0; }
      document.getElementById("levelName").textContent = this.level.name;
    }
    resize() {
      const rect = this.canvas.getBoundingClientRect(); const dpr = Math.max(1, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(rect.width * dpr); this.canvas.height = Math.round(rect.height * dpr);
      this.ctx.setTransform(this.canvas.width / AR.VIEW.width, 0, 0, this.canvas.height / AR.VIEW.height, 0, 0);
    }
    loop(time) {
      const dt = Math.min((time - this.last) / 1000, 1 / 30); this.last = time;
      if (!this.ended) this.update(dt);
      this.renderer.draw(); this.hud.update(); requestAnimationFrame((next) => this.loop(next));
    }
    update(dt) {
      const slow = this.player.powerTimers.slow > 0 ? .45 : 1;
      this.updatePlatforms(dt, slow);
      this.player.update(dt, this.input, this.physics, this);
      this.level.enemies.forEach((enemy) => enemy.update(dt, this.physics, slow));
      this.level.gems.forEach((gem) => gem.update(dt));
      this.updateProjectiles(dt);
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
          p.falling.timer -= dt;
          if (p.falling.timer <= 0) p.y += 360 * dt;
          if (p.y > this.level.height + 120) p.disabled = true;
        }
      });
    }
    updateProjectiles(dt) {
      this.projectiles.forEach((p) => { p.x += p.vx * dt; p.life -= dt; });
      this.projectiles.forEach((p) => this.level.enemies.forEach((e) => { if (!e.dead && AR.rectOverlap(p, e)) { e.dead = true; p.life = 0; this.status = "Spark hit"; } }));
      this.projectiles = this.projectiles.filter((p) => p.life > 0);
    }
    collectItems() {
      this.level.gems.forEach((gem) => { if (!gem.collected && AR.rectOverlap(this.player, gem)) { gem.collected = true; this.gemsCollected += 1; this.totalGems += 1; } });
      this.level.powerups.forEach((p) => { if (!p.taken && AR.rectOverlap(this.player, p)) { p.taken = true; this.player.givePower(p.type); this.status = AR.POWERS[p.type].name; } });
      this.level.keys.forEach((k) => { if (!k.taken && AR.rectOverlap(this.player, { x: k.x, y: k.y, w: 28, h: 34 })) { k.taken = true; this.player.keys += 1; this.status = "Key found"; } });
      this.level.gates.forEach((g) => { const nearGate = this.player.x + this.player.w >= g.x - 12 && this.player.x <= g.x + g.w + 12 && this.player.y + this.player.h > g.y && this.player.y < g.y + g.h; if (!g.open && nearGate && this.player.keys > 0) { g.open = true; this.player.keys -= 1; this.status = "Gate opened"; } });
      this.level.platforms.forEach((p) => { if (p.falling && this.player.riding === p && !p.falling.armed) { p.falling.armed = true; p.falling.timer = p.falling.delay; this.status = "Stone is cracking"; } });
      this.level.pads.forEach((pad) => { if (AR.rectOverlap(this.player, pad) && this.player.vy >= 0) { this.player.y = pad.y - this.player.h; this.player.vy = AR.PHYSICS.bounceVelocity; this.status = "Bounce"; } });
    }
    resolveBlocks() {
      this.level.blocks.forEach((b) => { if (!b.broken && this.player.canBreakBlocks() && AR.rectOverlap(this.player, b)) { b.broken = true; this.status = "Stone shattered"; } });
    }
    resolveHazards() {
      for (const h of this.level.hazards) if (AR.rectOverlap(this.player, h) && this.player.hurt()) { this.status = "Spikes"; if (this.player.hp <= 0) this.loseLife(); }
    }
    resolveEnemyContacts() {
      this.level.enemies.forEach((enemy) => {
        if (enemy.dead || !AR.rectOverlap(this.player, enemy)) return;
        const stomp = this.player.vy > 120 && this.player.prevY + this.player.h <= enemy.y + 18;
        if (stomp || this.player.isDangerous()) { enemy.dead = true; this.player.vy = AR.PHYSICS.jumpVelocity * .55; this.status = "Enemy defeated"; }
        else if (this.player.hurt()) { this.status = "Ouch"; if (this.player.hp <= 0) this.loseLife(); }
      });
      this.level.enemies = this.level.enemies.filter((enemy) => enemy.squash <= .35);
    }
    resolveCheckpoints() {
      this.level.checkpoints.forEach((cp) => { if (!cp.active && AR.rectOverlap(this.player, { x: cp.x, y: cp.y, w: 34, h: 92 })) { cp.active = true; this.level.spawn = { x: cp.x, y: cp.y - 76 }; this.status = "Checkpoint"; } });
    }
    loseLife() {
      this.player.lives -= 1;
      if (this.player.lives <= 0) this.end(false, "Arora Rider Fell", "Try again and watch the traps.");
      else this.player.respawn(this.level.spawn);
    }
    checkFall() { if (this.player.y > this.level.height + 180) this.loseLife(); }
    checkFinish() {
      if (!AR.rectOverlap(this.player, this.level.portal)) return;
      if (this.levelIndex < AR.LEVELS.length - 1) this.end(true, "Portal Reached", `${this.level.name} complete. Gems: ${this.gemsCollected} / ${this.level.gems.length}.`);
      else this.end(true, "Demo Complete", `All three prototype levels cleared. Total gems: ${this.totalGems}.`);
    }
    end(victory, title, text) {
      this.ended = true;
      document.getElementById("endEyebrow").textContent = victory ? "Level Complete" : "Defeat";
      document.getElementById("endTitle").textContent = title;
      document.getElementById("endText").textContent = text;
      document.getElementById("restartButton").textContent = victory && this.levelIndex < AR.LEVELS.length - 1 ? "Next Level" : "Restart";
      document.getElementById("endModal").hidden = false;
    }
    handleModalButton() {
      document.getElementById("endModal").hidden = true;
      if (this.ended && this.levelIndex < AR.LEVELS.length - 1 && document.getElementById("endTitle").textContent !== "Arora Rider Fell") {
        this.ended = false; this.loadLevel(this.levelIndex + 1);
      } else location.reload();
    }
  };

  function buildLevel(data) {
    return {
      ...data,
      platforms: data.platforms.map((p) => ({ ...p, moving: p.moving ? { ...p.moving } : null, falling: p.falling ? { ...p.falling } : null })),
      gems: [...data.gems.map(([x, y]) => new AR.Collectible(x, y)), ...data.hiddenGems.map(([x, y]) => new AR.Collectible(x, y, "gem", true))],
      enemies: data.enemies.map((enemy) => new AR.PlatformEnemy(enemy)),
      powerups: data.powerups.map((p) => ({ ...p, w: 30, h: 30, taken: false })),
      hazards: data.hazards.map((h) => ({ ...h })), pads: data.pads.map((p) => ({ ...p })), blocks: data.blocks.map((b) => ({ ...b })),
      keys: data.keys.map((k) => ({ ...k })), gates: data.gates.map((g) => ({ ...g })), checkpoints: data.checkpoints.map((c) => ({ ...c })), portal: { ...data.portal }, spawn: { ...data.spawn },
    };
  }
})();