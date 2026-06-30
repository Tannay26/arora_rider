(() => {
  "use strict";
  AR.Game = class {
    constructor() {
      this.canvas = document.getElementById("gameCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.input = new AR.InputSystem();
      this.hero = new AR.Hero();
      this.playerBase = new AR.Base("ally");
      this.enemyBase = new AR.Base("enemy");
      this.allies = [];
      this.enemies = [];
      this.projectiles = [];
      this.floaters = [];
      this.particles = new AR.ParticleSystem();
      this.mods = { allyDamage: 1, allyHp: 1, cost: 1, heroDamage: 1, energyRegen: 1, spiritRegen: 1, healPower: 1 };
      this.energy = 75; this.maxEnergy = 130; this.spirit = 65; this.maxSpirit = 110; this.coins = 0;
      this.abilityCooldowns = Object.fromEntries(AR.ABILITIES.map((a) => [a.id, 0]));
      this.waves = new AR.WaveManager(this);
      this.combat = new AR.CombatSystem(this);
      this.collision = new AR.CollisionSystem(this);
      this.renderer = new AR.RenderSystem(this);
      this.hud = new AR.Hud(this);
      this.paused = false; this.ended = false; this.fps = 60; this.last = performance.now();
      this.bindUi();
      this.resize();
      window.addEventListener("resize", () => this.resize());
      this.banner("Defend the castle. Clear 10 waves, then destroy the corrupted fortress.");
      requestAnimationFrame((time) => this.loop(time));
    }
    bindUi() {
      document.getElementById("startWaveButton").addEventListener("click", () => this.waves.start());
      document.getElementById("restartButton").addEventListener("click", () => location.reload());
      document.getElementById("allyCards").addEventListener("click", (e) => { const card = e.target.closest("[data-ally]"); if (card) this.summon(Number(card.dataset.ally)); });
      document.getElementById("abilityBar").addEventListener("click", (e) => { const ability = e.target.closest("[data-ability]"); if (ability) AR.castAbility(this, ability.dataset.ability); });
    }
    resize() {
      const rect = this.canvas.getBoundingClientRect(), dpr = Math.max(1, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(rect.width * dpr); this.canvas.height = Math.round(rect.height * dpr);
      this.ctx.setTransform(this.canvas.width / AR.WORLD.width, 0, 0, this.canvas.height / AR.WORLD.height, 0, 0);
    }
    loop(time) {
      const raw = (time - this.last) / 1000, dt = Math.min(raw, 1 / 30);
      this.last = time; this.fps = this.fps * .9 + (1 / Math.max(raw, .001)) * .1;
      if (!this.paused && !this.ended) this.update(dt);
      this.renderer.draw();
      this.hud.update();
      requestAnimationFrame((next) => this.loop(next));
    }
    update(dt) {
      this.energy = Math.min(this.maxEnergy, this.energy + 9 * this.mods.energyRegen * dt);
      this.spirit = Math.min(this.maxSpirit, this.spirit + 6 * this.mods.spiritRegen * dt);
      Object.keys(this.abilityCooldowns).forEach((id) => this.abilityCooldowns[id] = Math.max(0, this.abilityCooldowns[id] - dt));
      this.hero.update(dt, this.input);
      this.waves.update(dt);
      [...this.allies, ...this.enemies].forEach((unit) => unit.update(dt, this));
      this.collision.separate();
      this.projectiles.forEach((p) => p.update(dt, this));
      this.particles.update(dt);
      this.floaters.forEach((f) => f.update(dt));
      this.playerBase.update(dt); this.enemyBase.update(dt);
      this.cleanup();
      this.checkEnd();
    }
    summon(index) {
      const base = AR.ALLY_BLUEPRINTS[index], cost = Math.ceil(base.cost * this.mods.cost);
      if (this.energy < cost || this.ended) return;
      this.energy -= cost;
      const stats = { ...base, hp: base.hp * this.mods.allyHp };
      this.allies.push(new AR.Unit(stats, "ally", this.playerBase.right + 24 + Math.random() * 24));
    }
    cleanup() {
      this.allies = this.allies.filter((u) => !u.removed);
      this.enemies = this.enemies.filter((u) => !u.removed);
      this.projectiles = this.projectiles.filter((p) => !p.dead);
      this.floaters = this.floaters.filter((f) => f.life > 0);
    }
    checkEnd() {
      if (this.hero.dead) this.end(false);
      if (this.enemyBase.dead && this.waves.wave >= this.waves.maxWaves && !this.waves.active) this.end(true);
    }
    showUpgrades() {
      this.paused = true;
      const modal = document.getElementById("upgradeModal"), grid = document.getElementById("upgradeChoices");
      const picks = AR.shuffle([...AR.UPGRADES]).slice(0, 3);
      grid.innerHTML = picks.map((u, i) => `<button class="primary-button" data-upgrade="${i}">${u.title}</button>`).join("");
      modal.hidden = false;
      grid.onclick = (e) => {
        const button = e.target.closest("[data-upgrade]");
        if (!button) return;
        picks[Number(button.dataset.upgrade)].apply(this);
        modal.hidden = true; this.paused = false; this.banner("Upgrade applied.");
      };
    }
    end(victory) {
      this.ended = true;
      document.getElementById("endEyebrow").textContent = victory ? "Victory" : "Defeat";
      document.getElementById("endTitle").textContent = victory ? "Enemy fortress destroyed" : "Arora Rider has fallen";
      document.getElementById("endText").textContent = victory ? `Level 1 cleared. Coins earned: ${this.coins}.` : "Defeat happens only when Arora Rider HP reaches 0.";
      document.getElementById("endModal").hidden = false;
    }
    float(text, x, y, color, size) { this.floaters.push(new AR.FloatingText(text, x, y, color, size)); }
    banner(text) {
      const banner = document.getElementById("battleBanner");
      banner.textContent = text; banner.hidden = false;
      clearTimeout(this.bannerTimer);
      this.bannerTimer = setTimeout(() => banner.hidden = true, 2600);
    }
  };
})();
