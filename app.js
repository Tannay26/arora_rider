(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const debugPanel = document.getElementById("debugPanel");
  const startWaveButton = document.getElementById("startWaveButton");
  const waveLabel = document.getElementById("waveLabel");
  const waveProgress = document.getElementById("waveProgress");
  const heroHpText = document.getElementById("heroHpText");
  const heroLevelText = document.getElementById("heroLevelText");
  const heroXpText = document.getElementById("heroXpText");
  const coinsText = document.getElementById("coinsText");
  const energyBar = document.getElementById("energyBar");
  const spiritBar = document.getElementById("spiritBar");
  const energyText = document.getElementById("energyText");
  const spiritText = document.getElementById("spiritText");
  const allyCards = document.getElementById("allyCards");
  const abilityBar = document.getElementById("abilityBar");
  const upgradeModal = document.getElementById("upgradeModal");
  const upgradeChoices = document.getElementById("upgradeChoices");
  const endModal = document.getElementById("endModal");
  const endEyebrow = document.getElementById("endEyebrow");
  const endTitle = document.getElementById("endTitle");
  const endText = document.getElementById("endText");
  const restartButton = document.getElementById("restartButton");
  const battleBanner = document.getElementById("battleBanner");

  const WORLD = {
    width: 1800,
    height: 900,
    groundY: 660,
    leftLimit: 130,
    rightLimit: 1610,
    playerBaseX: 30,
    enemyBaseX: 1630,
  };

  const ALLIES = [
    { id: "bladePup", name: "Blade Pup", cost: 18, hp: 82, damage: 13, range: 42, attackSpeed: 1.1, speed: 78, type: "melee", xp: 0, level: 1, color: "#d2a16c" },
    { id: "thornHare", name: "Thorn Hare", cost: 24, hp: 58, damage: 11, range: 220, attackSpeed: 0.95, speed: 94, type: "ranged", xp: 0, level: 1, color: "#8fdc92" },
    { id: "shellback", name: "Shellback", cost: 35, hp: 180, damage: 10, range: 45, attackSpeed: 0.65, speed: 42, type: "tank", xp: 0, level: 1, color: "#7fa56f" },
    { id: "emberFox", name: "Ember Fox", cost: 32, hp: 72, damage: 9, range: 180, attackSpeed: 1.15, speed: 105, type: "burn", xp: 0, level: 1, color: "#ff8b48" },
    { id: "ironRam", name: "Iron Ram", cost: 42, hp: 130, damage: 22, range: 55, attackSpeed: 0.55, speed: 88, type: "charge", xp: 0, level: 1, color: "#a8a9ad" },
    { id: "frostOwl", name: "Frost Owl", cost: 38, hp: 66, damage: 10, range: 250, attackSpeed: 0.9, speed: 70, type: "slow", xp: 0, level: 1, color: "#9fe7ff" },
    { id: "sparkLynx", name: "Spark Lynx", cost: 46, hp: 74, damage: 14, range: 210, attackSpeed: 0.8, speed: 112, type: "chain", xp: 0, level: 1, color: "#f7df53" },
    { id: "stonebackTurtle", name: "Stoneback Turtle", cost: 50, hp: 260, damage: 8, range: 40, attackSpeed: 0.5, speed: 28, type: "blocker", xp: 0, level: 1, color: "#6f856a" },
    { id: "windCrane", name: "Wind Crane", cost: 54, hp: 70, damage: 18, range: 315, attackSpeed: 0.72, speed: 86, type: "longshot", xp: 0, level: 1, color: "#d8f3ff" },
    { id: "sunLion", name: "Sun Lion", cost: 80, hp: 190, damage: 34, range: 70, attackSpeed: 0.75, speed: 74, type: "elite", xp: 0, level: 1, color: "#ffc24f" },
  ];

  const ABILITIES = [
    { id: "heal", name: "Heal nearby allies", cost: 35, cooldown: 8 },
    { id: "bolt", name: "Spirit Bolt", cost: 25, cooldown: 3 },
    { id: "rally", name: "Rally aura", cost: 45, cooldown: 12 },
  ];

  const UPGRADES = [
    { title: "+15% hero max HP", apply: (g) => { g.hero.maxHp *= 1.15; g.hero.hp = Math.min(g.hero.maxHp, g.hero.hp + g.hero.maxHp * 0.15); } },
    { title: "+10% hero damage", apply: (g) => { g.mods.heroDamage *= 1.1; } },
    { title: "+10% Energy regeneration", apply: (g) => { g.mods.energyRegen *= 1.1; } },
    { title: "+10% Spirit regeneration", apply: (g) => { g.mods.spiritRegen *= 1.1; } },
    { title: "+12% ally damage", apply: (g) => { g.mods.allyDamage *= 1.12; } },
    { title: "+12% ally HP", apply: (g) => { g.mods.allyHp *= 1.12; } },
    { title: "-5% ally summon cost", apply: (g) => { g.mods.cost *= 0.95; } },
    { title: "+10% elephant movement speed", apply: (g) => { g.hero.speed *= 1.1; } },
    { title: "+15% healing ability power", apply: (g) => { g.mods.healPower *= 1.15; } },
  ];

  // Input stays isolated so touch, gamepad, or rebinding can be added later.
  class Input {
    constructor() {
      this.keys = new Set();
      window.addEventListener("keydown", (event) => {
        if (["KeyA", "KeyD", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
        this.keys.add(event.code);
      });
      window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    }
    axis() {
      return (this.keys.has("KeyD") || this.keys.has("ArrowRight") ? 1 : 0) - (this.keys.has("KeyA") || this.keys.has("ArrowLeft") ? 1 : 0);
    }
  }

  // Lightweight combat feedback for damage, healing, and level-up callouts.
  class FloatingText {
    constructor(text, x, y, color = "#fff0b0") {
      this.text = text;
      this.x = x;
      this.y = y;
      this.color = color;
      this.life = 1.1;
    }
    update(dt) {
      this.y -= 42 * dt;
      this.life -= dt;
    }
    draw(c) {
      c.globalAlpha = Math.max(0, this.life);
      c.fillStyle = this.color;
      c.font = "700 24px Arial";
      c.textAlign = "center";
      c.fillText(this.text, this.x, this.y);
      c.globalAlpha = 1;
    }
  }

  // Projectiles handle all ranged travel; impact effects stay in Game.applyDamage.
  class Projectile {
    constructor({ x, y, side, damage, speed, target, color, owner, type }) {
      Object.assign(this, { x, y, side, damage, speed, target, color, owner, type });
      this.radius = type === "bolt" ? 13 : 7;
      this.dead = false;
    }
    update(dt, game) {
      if (!this.target || this.target.dead) {
        this.x += this.speed * dt * (this.side === "ally" ? 1 : -1);
      } else {
        const dx = this.target.x - this.x;
        this.x += Math.sign(dx) * this.speed * dt;
        if (Math.abs(dx) < this.speed * dt + 18) {
          game.applyDamage(this.target, this.damage, this.owner);
          if (this.type === "chain") {
            game.enemies.filter((e) => !e.dead && Math.abs(e.x - this.target.x) < 110).slice(0, 2).forEach((e) => game.applyDamage(e, this.damage * 0.45, this.owner));
          }
          this.dead = true;
        }
      }
      if (this.x < -80 || this.x > WORLD.width + 80) this.dead = true;
    }
    draw(c) {
      c.fillStyle = this.color;
      c.shadowColor = this.color;
      c.shadowBlur = 14;
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
    }
  }

  // Shared troop class for both summoned allies and enemy wave units.
  class Fighter {
    constructor(stats, side, x) {
      this.stats = { ...stats };
      this.side = side;
      this.name = stats.name;
      this.x = x;
      this.y = WORLD.groundY;
      this.w = stats.w || 46;
      this.h = stats.h || 58;
      this.maxHp = stats.hp;
      this.hp = stats.hp;
      this.damage = stats.damage;
      this.range = stats.range;
      this.attackSpeed = stats.attackSpeed;
      this.speed = stats.speed;
      this.type = stats.type;
      this.color = stats.color;
      this.xp = stats.xp || 0;
      this.level = stats.level || 1;
      this.attackTimer = Math.random() * 0.4;
      this.slow = 0;
      this.rally = 0;
      this.dead = false;
    }
    get centerX() { return this.x + this.w / 2; }
    get attackInterval() { return 1 / Math.max(0.15, this.attackSpeed * (this.rally > 0 ? 1.2 : 1)); }
    update(dt, game) {
      this.attackTimer -= dt;
      this.slow = Math.max(0, this.slow - dt);
      this.rally = Math.max(0, this.rally - dt);
      const target = game.nearestTarget(this);
      if (target && Math.abs(target.centerX - this.centerX) <= this.range) {
        if (this.attackTimer <= 0) this.attack(target, game);
      } else {
        const direction = this.side === "ally" ? 1 : -1;
        const boost = this.rally > 0 ? 1.25 : 1;
        const slow = this.slow > 0 ? 0.55 : 1;
        this.x += direction * this.speed * boost * slow * dt;
      }
      if (this.hp <= 0) this.dead = true;
    }
    attack(target, game) {
      this.attackTimer = this.attackInterval;
      const damage = this.damage * (this.side === "ally" ? game.mods.allyDamage : 1) * (this.rally > 0 ? 1.25 : 1);
      if (["ranged", "burn", "slow", "chain", "longshot"].includes(this.type)) {
        game.projectiles.push(new Projectile({ x: this.centerX, y: this.y - this.h * 0.55, side: this.side, damage, speed: this.type === "longshot" ? 560 : 430, target, color: projectileColor(this.type), owner: this, type: this.type }));
      } else {
        const hit = this.type === "charge" ? damage * 1.55 : damage;
        game.applyDamage(target, hit, this);
      }
      if (this.type === "slow") target.slow = 2.5;
      if (this.type === "burn") target.burn = 3;
    }
    addXp(amount, game) {
      if (this.side !== "ally") return;
      this.xp += amount;
      const need = 40 + this.level * 28;
      if (this.xp >= need) {
        this.xp -= need;
        this.level += 1;
        this.maxHp *= 1.18;
        this.hp = this.maxHp;
        this.damage *= 1.16;
        if (this.range > 90) this.range *= 1.06;
        else this.attackSpeed *= 1.06;
        game.float(`${this.name} Level ${this.level}!`, this.centerX, this.y - this.h - 35, "#fff176");
      }
    }
    draw(c) {
      const top = this.y - this.h;
      c.fillStyle = this.color;
      c.fillRect(this.x, top, this.w, this.h);
      c.fillStyle = this.side === "ally" ? "#1f3147" : "#3b151c";
      c.fillRect(this.x + 8, top + 10, this.w - 16, 8);
      drawHp(c, this.x, top - 13, this.w, 6, this.hp / this.maxHp);
    }
  }

  // Bases are damageable battlefield objectives. Only enemy base death can win.
  class Base {
    constructor(side) {
      this.side = side;
      this.x = side === "ally" ? WORLD.playerBaseX : WORLD.enemyBaseX;
      this.w = 140;
      this.h = 190;
      this.y = WORLD.groundY;
      this.maxHp = side === "ally" ? 1600 : 3200;
      this.hp = this.maxHp;
      this.dead = false;
    }
    get centerX() { return this.x + this.w / 2; }
    update() {
      this.dead = this.hp <= 0;
    }
    draw(c) {
      const top = this.y - this.h;
      const isAlly = this.side === "ally";
      c.fillStyle = isAlly ? "#5f78b9" : "#6b2833";
      c.fillRect(this.x, top + 45, this.w, this.h - 45);
      c.fillStyle = isAlly ? "#3b4f86" : "#451721";
      for (let i = 0; i < 4; i++) c.fillRect(this.x + i * 35, top + 22 + (i % 2) * 10, 25, 28);
      c.fillStyle = isAlly ? "#93a7e5" : "#bd5e65";
      c.beginPath();
      c.moveTo(this.x, top + 46);
      c.lineTo(this.x + this.w / 2, top);
      c.lineTo(this.x + this.w, top + 46);
      c.fill();
      drawHp(c, this.x + 4, top - 22, this.w - 8, 10, this.hp / this.maxHp);
    }
  }

  // Arora Rider rides the elephant. Defeat is tied only to this HP pool.
  class Hero {
    constructor() {
      this.x = 205;
      this.y = WORLD.groundY;
      this.w = 128;
      this.h = 100;
      this.maxHp = 360;
      this.hp = 360;
      this.speed = 240;
      this.level = 1;
      this.xp = 0;
      this.xpNeed = 100;
      this.dead = false;
    }
    get centerX() { return this.x + this.w / 2; }
    update(dt, input) {
      this.x += input.axis() * this.speed * dt;
      this.x = clamp(this.x, WORLD.leftLimit, WORLD.rightLimit - this.w);
      this.dead = this.hp <= 0;
    }
    addXp(amount, game) {
      this.xp += amount;
      while (this.xp >= this.xpNeed) {
        this.xp -= this.xpNeed;
        this.level += 1;
        this.xpNeed = Math.round(this.xpNeed * 1.32);
        game.showUpgrades();
      }
    }
    draw(c) {
      const top = this.y - this.h;
      drawHp(c, this.x + 12, top - 28, this.w - 20, 10, this.hp / this.maxHp);
      c.fillStyle = "#8d8f94";
      c.beginPath();
      c.ellipse(this.x + 66, top + 58, 60, 34, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#aeb2b8";
      c.beginPath();
      c.arc(this.x + 118, top + 43, 25, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#8d8f94";
      c.fillRect(this.x + 128, top + 49, 15, 48);
      c.fillStyle = "#676b72";
      [24, 56, 85, 112].forEach((lx) => c.fillRect(this.x + lx, top + 78, 13, 44));
      c.strokeStyle = "#f4e2bd";
      c.lineWidth = 7;
      c.beginPath();
      c.arc(this.x + 137, top + 82, 18, 0.2, 1.8);
      c.stroke();
      c.fillStyle = "#713a2f";
      c.fillRect(this.x + 54, top + 16, 26, 38);
      c.fillStyle = "#f4c16a";
      c.beginPath();
      c.arc(this.x + 67, top + 4, 13, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#ffe596";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(this.x + 78, top + 24);
      c.lineTo(this.x + 112, top + 6);
      c.stroke();
    }
  }

  // Central coordinator: resources, waves, combat, victory/defeat, and rendering.
  class Game {
    constructor() {
      this.input = new Input();
      this.hero = new Hero();
      this.playerBase = new Base("ally");
      this.enemyBase = new Base("enemy");
      this.allies = [];
      this.enemies = [];
      this.projectiles = [];
      this.floaters = [];
      this.energy = 70;
      this.maxEnergy = 120;
      this.spirit = 60;
      this.maxSpirit = 100;
      this.coins = 0;
      this.wave = 0;
      this.waveActive = false;
      this.pendingSpawns = [];
      this.paused = false;
      this.ended = false;
      this.fps = 60;
      this.mods = { allyDamage: 1, allyHp: 1, cost: 1, heroDamage: 1, energyRegen: 1, spiritRegen: 1, healPower: 1 };
      this.abilityCooldowns = Object.fromEntries(ABILITIES.map((a) => [a.id, 0]));
      this.last = performance.now();
      this.banner("Summon allies, survive 10 waves, then break the enemy fortress.");
      this.bindUi();
      this.resize();
      window.addEventListener("resize", () => this.resize());
      requestAnimationFrame((t) => this.loop(t));
    }
    bindUi() {
      allyCards.innerHTML = ALLIES.map((a, i) => `<button class="card" data-ally="${i}"><strong>${a.name}</strong><span>${a.cost} Energy</span><small>${a.type} | HP ${a.hp} | DMG ${a.damage}</small></button>`).join("");
      abilityBar.innerHTML = ABILITIES.map((a) => `<button class="ability" data-ability="${a.id}"><strong>${a.name}</strong><span>${a.cost} Spirit</span></button>`).join("");
      allyCards.addEventListener("click", (e) => {
        const card = e.target.closest("[data-ally]");
        if (card) this.summon(Number(card.dataset.ally));
      });
      abilityBar.addEventListener("click", (e) => {
        const ability = e.target.closest("[data-ability]");
        if (ability) this.cast(ability.dataset.ability);
      });
      startWaveButton.addEventListener("click", () => this.startWave());
      restartButton.addEventListener("click", () => location.reload());
    }
    resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0);
    }
    loop(time) {
      const raw = (time - this.last) / 1000;
      const dt = Math.min(raw, 1 / 30);
      this.last = time;
      this.fps = this.fps * 0.9 + (1 / Math.max(raw, 0.001)) * 0.1;
      if (!this.paused && !this.ended) this.update(dt);
      this.draw();
      this.renderUi();
      requestAnimationFrame((t) => this.loop(t));
    }
    startWave() {
      if (this.waveActive || this.wave >= 10 || this.ended) return;
      this.wave += 1;
      this.waveActive = true;
      this.pendingSpawns = makeWave(this.wave);
      startWaveButton.disabled = true;
      this.banner(this.wave === 10 ? "Boss wave!" : `Wave ${this.wave} begins.`);
    }
    summon(index) {
      const base = ALLIES[index];
      const cost = Math.ceil(base.cost * this.mods.cost);
      if (this.energy < cost || this.ended) return;
      this.energy -= cost;
      const stats = { ...base, hp: base.hp * this.mods.allyHp, damage: base.damage, x: 0 };
      this.allies.push(new Fighter(stats, "ally", 185 + Math.random() * 35));
    }
    cast(id) {
      const ability = ABILITIES.find((a) => a.id === id);
      if (!ability || this.spirit < ability.cost || this.abilityCooldowns[id] > 0 || this.ended) return;
      this.spirit -= ability.cost;
      this.abilityCooldowns[id] = ability.cooldown;
      if (id === "heal") {
        const amount = 70 * this.mods.healPower;
        this.allies.filter((a) => Math.abs(a.centerX - this.hero.centerX) < 280).forEach((a) => {
          a.hp = Math.min(a.maxHp, a.hp + amount);
          this.float(`+${Math.round(amount)}`, a.centerX, a.y - a.h - 20, "#7dff9b");
        });
      }
      if (id === "bolt") {
        const target = this.enemies.find((e) => !e.dead) || this.enemyBase;
        this.projectiles.push(new Projectile({ x: this.hero.centerX + 70, y: this.hero.y - 105, side: "ally", damage: 95 * this.mods.heroDamage, speed: 680, target, color: "#9cf4ff", owner: this.hero, type: "bolt" }));
      }
      if (id === "rally") {
        this.allies.filter((a) => Math.abs(a.centerX - this.hero.centerX) < 420).forEach((a) => {
          a.rally = 8;
          this.float("Rally!", a.centerX, a.y - a.h - 18, "#ffe17c");
        });
      }
    }
    update(dt) {
      this.energy = Math.min(this.maxEnergy, this.energy + 8 * this.mods.energyRegen * dt);
      this.spirit = Math.min(this.maxSpirit, this.spirit + 5.5 * this.mods.spiritRegen * dt);
      Object.keys(this.abilityCooldowns).forEach((k) => this.abilityCooldowns[k] = Math.max(0, this.abilityCooldowns[k] - dt));
      this.hero.update(dt, this.input);
      this.spawnEnemies(dt);
      [...this.allies, ...this.enemies].forEach((f) => {
        if (f.burn) {
          f.burn -= dt;
          this.applyDamage(f, 5 * dt, null, false);
        }
        f.update(dt, this);
      });
      this.projectiles.forEach((p) => p.update(dt, this));
      this.floaters.forEach((f) => f.update(dt));
      this.playerBase.update();
      this.enemyBase.update();
      this.cleanup();
      this.checkEnd();
    }
    spawnEnemies(dt) {
      if (!this.waveActive) return;
      this.pendingSpawns.forEach((s) => s.time -= dt);
      const ready = this.pendingSpawns.filter((s) => s.time <= 0);
      this.pendingSpawns = this.pendingSpawns.filter((s) => s.time > 0);
      ready.forEach((s) => this.enemies.push(new Fighter(s.stats, "enemy", WORLD.enemyBaseX - 45)));
      if (!this.pendingSpawns.length && !this.enemies.length) {
        this.waveActive = false;
        this.hero.addXp(30 + this.wave * 12, this);
        this.coins += 12 + this.wave * 4;
        if (this.wave < 10) {
          startWaveButton.disabled = false;
          startWaveButton.textContent = `Start Wave ${this.wave + 1}`;
          this.banner(`Wave ${this.wave} cleared. Choose when to start the next wave.`);
        } else {
          startWaveButton.textContent = "Destroy the fortress";
          this.banner("All waves cleared. Destroy the enemy fortress to win.");
        }
      }
    }
    nearestTarget(unit) {
      if (unit.side === "ally") {
        const target = this.enemies.filter((e) => !e.dead).sort((a, b) => Math.abs(a.centerX - unit.centerX) - Math.abs(b.centerX - unit.centerX))[0];
        if (target) return target;
        return this.wave >= 10 && !this.enemyBase.dead ? this.enemyBase : null;
      }
      const targets = [...this.allies.filter((a) => !a.dead), this.hero].sort((a, b) => Math.abs(a.centerX - unit.centerX) - Math.abs(b.centerX - unit.centerX));
      return targets[0] || this.playerBase;
    }
    applyDamage(target, amount, source, show = true) {
      if (!target || target.dead) return;
      target.hp -= amount;
      if (show) this.float(Math.round(amount), target.centerX, target.y - (target.h || 120) - 8, "#ffdf8c");
      if (source && source.addXp) source.addXp(amount * 0.18, this);
      if (target.hp <= 0) {
        target.dead = true;
        if (target.side === "enemy") {
          this.hero.addXp(target.stats.xpReward || 18, this);
          this.coins += target.stats.coinReward || 3;
          if (source && source.addXp) source.addXp(24, this);
        }
      }
    }
    cleanup() {
      this.allies = this.allies.filter((a) => !a.dead);
      this.enemies = this.enemies.filter((e) => !e.dead);
      this.projectiles = this.projectiles.filter((p) => !p.dead);
      this.floaters = this.floaters.filter((f) => f.life > 0);
    }
    checkEnd() {
      if (this.hero.dead) this.end(false);
      if (this.wave >= 10 && this.enemyBase.dead) this.end(true);
    }
    showUpgrades() {
      this.paused = true;
      const picks = shuffle([...UPGRADES]).slice(0, 3);
      upgradeChoices.innerHTML = picks.map((u, i) => `<button class="primary-button" data-upgrade="${i}">${u.title}</button>`).join("");
      upgradeModal.hidden = false;
      upgradeChoices.onclick = (e) => {
        const button = e.target.closest("[data-upgrade]");
        if (!button) return;
        picks[Number(button.dataset.upgrade)].apply(this);
        upgradeModal.hidden = true;
        this.paused = false;
        this.banner("Upgrade applied.");
      };
    }
    end(victory) {
      this.ended = true;
      endEyebrow.textContent = victory ? "Victory" : "Defeat";
      endTitle.textContent = victory ? "Enemy fortress destroyed" : "Arora Rider has fallen";
      endText.textContent = victory ? `Level 1 cleared. Coins earned: ${this.coins}.` : "Defeat happens only when Arora Rider HP reaches 0.";
      endModal.hidden = false;
    }
    float(text, x, y, color) {
      this.floaters.push(new FloatingText(text, x, y, color));
    }
    banner(text) {
      battleBanner.textContent = text;
      battleBanner.hidden = false;
      clearTimeout(this.bannerTimer);
      this.bannerTimer = setTimeout(() => battleBanner.hidden = true, 2600);
    }
    draw() {
      drawWorld(ctx);
      this.playerBase.draw(ctx);
      this.enemyBase.draw(ctx);
      [...this.allies, ...this.enemies].sort((a, b) => a.y - b.y || a.x - b.x).forEach((e) => e.draw(ctx));
      this.hero.draw(ctx);
      this.projectiles.forEach((p) => p.draw(ctx));
      this.floaters.forEach((f) => f.draw(ctx));
    }
    renderUi() {
      waveLabel.textContent = `Level 1 - Wave ${this.wave} / 10`;
      waveProgress.style.width = `${(this.wave / 10) * 100}%`;
      heroHpText.textContent = `${Math.max(0, Math.round(this.hero.hp))} / ${Math.round(this.hero.maxHp)}`;
      heroLevelText.textContent = this.hero.level;
      heroXpText.textContent = `${Math.round(this.hero.xp)} / ${this.hero.xpNeed}`;
      coinsText.textContent = this.coins;
      energyText.textContent = `${Math.floor(this.energy)} / ${this.maxEnergy}`;
      spiritText.textContent = `${Math.floor(this.spirit)} / ${this.maxSpirit}`;
      energyBar.style.width = `${this.energy / this.maxEnergy * 100}%`;
      spiritBar.style.width = `${this.spirit / this.maxSpirit * 100}%`;
      [...allyCards.querySelectorAll(".card")].forEach((button, i) => {
        const cost = Math.ceil(ALLIES[i].cost * this.mods.cost);
        button.disabled = this.energy < cost || this.ended;
        button.querySelector("span").textContent = `${cost} Energy`;
      });
      [...abilityBar.querySelectorAll(".ability")].forEach((button) => {
        const ability = ABILITIES.find((a) => a.id === button.dataset.ability);
        const cd = this.abilityCooldowns[ability.id];
        button.disabled = this.spirit < ability.cost || cd > 0 || this.ended;
        button.querySelector("span").textContent = cd > 0 ? `${cd.toFixed(1)}s cooldown` : `${ability.cost} Spirit`;
      });
      debugPanel.innerHTML = `FPS: ${Math.round(this.fps)}<br>Hero X: ${Math.round(this.hero.x)}<br>Allies: ${this.allies.length}<br>Enemies: ${this.enemies.length}<br>Enemy Base: ${Math.max(0, Math.round(this.enemyBase.hp))}`;
    }
  }

  function makeWave(wave) {
    const list = [];
    const count = wave === 10 ? 14 : 3 + wave * 2;
    for (let i = 0; i < count; i++) {
      const bruiser = wave > 3 && i % 4 === 0;
      const archer = wave > 2 && i % 5 === 0;
      const stats = {
        name: wave === 10 && i === count - 1 ? "Fortress Warlord" : bruiser ? "Dread Guard" : archer ? "Ash Archer" : "Gloom Imp",
        hp: (bruiser ? 120 : archer ? 70 : 58) + wave * (bruiser ? 24 : 13),
        damage: (bruiser ? 18 : archer ? 12 : 9) + wave * 2.2,
        range: archer ? 215 : 42,
        attackSpeed: bruiser ? 0.6 : archer ? 0.75 : 0.95,
        speed: bruiser ? 48 : archer ? 54 : 68,
        type: archer ? "ranged" : "melee",
        color: bruiser ? "#7f3a40" : archer ? "#734e7e" : "#5b5265",
        xpReward: 14 + wave * 3,
        coinReward: 2 + Math.floor(wave / 2),
        w: wave === 10 && i === count - 1 ? 88 : 44,
        h: wave === 10 && i === count - 1 ? 98 : 58,
      };
      if (wave === 10 && i === count - 1) {
        stats.hp = 920;
        stats.damage = 42;
        stats.range = 70;
        stats.attackSpeed = 0.7;
        stats.speed = 40;
        stats.color = "#b64251";
        stats.xpReward = 90;
        stats.coinReward = 40;
      }
      list.push({ time: i * Math.max(0.55, 1.2 - wave * 0.05), stats });
    }
    return list;
  }

  // Kept as a small utility for future body collisions and area abilities.
  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y - a.h < b.y && a.y > b.y - b.h;
  }

  function drawWorld(c) {
    const sky = c.createLinearGradient(0, 0, 0, WORLD.groundY);
    sky.addColorStop(0, "#6e7edc");
    sky.addColorStop(0.45, "#d99eb4");
    sky.addColorStop(1, "#f7d796");
    c.fillStyle = sky;
    c.fillRect(0, 0, WORLD.width, WORLD.height);
    drawMountains(c, 0.55, "#4e537d", 420);
    drawMountains(c, 0.78, "#36415f", 500);
    c.fillStyle = "rgba(255,255,255,0.35)";
    for (const cloud of [[250, 110, 1.1], [820, 95, 0.8], [1320, 145, 1.25]]) drawCloud(c, ...cloud);
    const ground = c.createLinearGradient(0, WORLD.groundY, 0, WORLD.height);
    ground.addColorStop(0, "#466a3d");
    ground.addColorStop(1, "#1d3320");
    c.fillStyle = ground;
    c.fillRect(0, WORLD.groundY, WORLD.width, WORLD.height - WORLD.groundY);
    c.fillStyle = "rgba(255, 223, 146, 0.18)";
    c.fillRect(0, WORLD.groundY, WORLD.width, 9);
  }

  function drawMountains(c, scale, color, baseY) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, baseY);
    for (let x = -80; x <= WORLD.width + 160; x += 220) {
      c.lineTo(x + 95, baseY - 190 * scale - ((x / 220) % 2) * 45);
      c.lineTo(x + 220, baseY);
    }
    c.lineTo(WORLD.width, baseY);
    c.lineTo(WORLD.width, WORLD.groundY);
    c.lineTo(0, WORLD.groundY);
    c.fill();
  }

  function drawCloud(c, x, y, s) {
    c.beginPath();
    c.arc(x, y, 32 * s, 0, Math.PI * 2);
    c.arc(x + 42 * s, y - 12 * s, 42 * s, 0, Math.PI * 2);
    c.arc(x + 88 * s, y, 30 * s, 0, Math.PI * 2);
    c.rect(x - 5 * s, y, 105 * s, 28 * s);
    c.fill();
  }

  function drawHp(c, x, y, w, h, ratio) {
    c.fillStyle = "rgba(22, 8, 13, 0.9)";
    c.fillRect(x, y, w, h);
    c.fillStyle = ratio > 0.45 ? "#69e885" : ratio > 0.2 ? "#ffd15e" : "#ff6464";
    c.fillRect(x, y, w * clamp(ratio, 0, 1), h);
    c.strokeStyle = "rgba(255,255,255,0.72)";
    c.lineWidth = 2;
    c.strokeRect(x, y, w, h);
  }

  function projectileColor(type) {
    return { burn: "#ff7b31", slow: "#86e8ff", chain: "#fff065", longshot: "#e9fbff", bolt: "#9cf4ff" }[type] || "#f5d27a";
  }

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  new Game();
})();
