(() => {
  "use strict";

  AR.Game = class {
    constructor() {
      this.canvas = document.getElementById("gameCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.input = new AR.InputSystem();
      this.level = buildLevel(AR.LEVEL_1);
      this.physics = new AR.PhysicsSystem(this.level);
      this.player = new AR.Player(this.level.spawn);
      this.camera = new AR.CameraSystem(this.level);
      this.renderer = new AR.RenderSystem(this);
      this.hud = new AR.Hud(this);
      this.gemsCollected = 0;
      this.status = "Explore";
      this.ended = false;
      this.last = performance.now();
      this.resize();
      window.addEventListener("resize", () => this.resize());
      document.getElementById("restartButton").addEventListener("click", () => location.reload());
      requestAnimationFrame((time) => this.loop(time));
    }
    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);
      this.ctx.setTransform(this.canvas.width / AR.VIEW.width, 0, 0, this.canvas.height / AR.VIEW.height, 0, 0);
    }
    loop(time) {
      const dt = Math.min((time - this.last) / 1000, 1 / 30);
      this.last = time;
      if (!this.ended) this.update(dt);
      this.renderer.draw();
      this.hud.update();
      requestAnimationFrame((next) => this.loop(next));
    }
    update(dt) {
      this.player.update(dt, this.input, this.physics);
      this.level.enemies.forEach((enemy) => enemy.update(dt, this.physics));
      this.level.gems.forEach((gem) => gem.update(dt));
      this.camera.follow(this.player);
      this.collectGems();
      this.resolveEnemyContacts();
      this.checkFall();
      this.checkFinish();
    }
    collectGems() {
      this.level.gems.forEach((gem) => {
        if (!gem.collected && AR.rectOverlap(this.player, gem)) {
          gem.collected = true;
          this.gemsCollected += 1;
        }
      });
    }
    resolveEnemyContacts() {
      this.level.enemies.forEach((enemy) => {
        if (enemy.dead || !AR.rectOverlap(this.player, enemy)) return;
        const stomp = this.player.vy > 120 && this.player.y + this.player.h - enemy.y < 24;
        if (stomp) {
          enemy.dead = true;
          this.player.vy = AR.PHYSICS.jumpVelocity * 0.55;
          this.status = "Enemy defeated";
        } else if (this.player.hurt()) {
          this.status = "Ouch";
          if (this.player.hp <= 0) this.loseLife();
        }
      });
      this.level.enemies = this.level.enemies.filter((enemy) => enemy.squash <= 0.35);
    }
    loseLife() {
      this.player.lives -= 1;
      if (this.player.lives <= 0) this.end(false);
      else this.player.respawn(this.level.spawn);
    }
    checkFall() {
      if (this.player.y > this.level.height + 180) this.loseLife();
    }
    checkFinish() {
      if (AR.rectOverlap(this.player, this.level.finishGate)) this.end(true);
    }
    end(victory) {
      this.ended = true;
      document.getElementById("endEyebrow").textContent = victory ? "Level Complete" : "Defeat";
      document.getElementById("endTitle").textContent = victory ? "Forest Gate Reached" : "Arora Rider Fell";
      document.getElementById("endText").textContent = victory ? `Gems collected: ${this.gemsCollected} / ${this.level.gems.length}.` : "Try again and watch the gaps.";
      document.getElementById("endModal").hidden = false;
    }
  };

  function buildLevel(data) {
    return {
      ...data,
      platforms: data.platforms.map((p) => ({ ...p })),
      gems: data.gems.map(([x, y]) => new AR.Collectible(x, y)),
      enemies: data.enemies.map((enemy) => new AR.PlatformEnemy(enemy)),
      finishGate: { ...data.finishGate },
    };
  }
})();
