(() => {
  "use strict";
  AR.WaveManager = class {
    constructor(game) {
      this.game = game;
      this.wave = 1;
      this.maxWaves = Infinity;
      this.active = false;
      this.spawnInterval = 25;
      this.spawnTimer = 0;
      this.spawned = 0;
      this.total = 0;
      this.lastSpawnIn = 0;
      this.scaleTier = 0;
      this.nextWaveTimer = 0;
      this.countdown = 0;
      this.queue = [];
    }
    get remaining() { return this.game.enemies.length; }
    start() {
      if (this.active || this.game.ended) return;
      this.active = true;
      this.spawnTimer = 1;
      this.game.banner("Endless assault started. Enemies spawn every 25 seconds.");
      console.log("[Arora Rider] Endless enemy spawner started");
    }
    update(dt) {
      if (!this.active) {
        this.lastSpawnIn = 0;
        return;
      }
      this.spawnTimer -= dt;
      this.scaleTier = Math.floor(this.game.timeSurvived / 60);
      if (this.spawnTimer <= 0) {
        this.spawnEnemyPack();
        this.spawnTimer += this.spawnInterval;
      }
      this.lastSpawnIn = Math.max(0, this.spawnTimer);
    }
    spawnEnemyPack() {
      const packSize = 1 + Math.min(4, Math.floor(this.scaleTier / 2));
      for (let i = 0; i < packSize; i++) {
        const blueprint = AR.ALLY_BLUEPRINTS[(this.spawned + i) % AR.ALLY_BLUEPRINTS.length];
        const stats = this.enemyFromAlly(blueprint);
        const x = AR.WORLD.enemyStructureX - 80 - i * 28;
        const enemy = new AR.Unit(stats, "enemy", x);
        this.game.enemies.push(enemy);
        console.log(`[Arora Rider] Enemy spawned: ${enemy.name} | alive=${this.game.enemies.length}`);
      }
      this.spawned += packSize;
      this.total = this.spawned;
      this.wave = this.scaleTier + 1;
    }
    enemyFromAlly(ally) {
      const scale = 0.78 + this.scaleTier * 0.18 + this.game.hero.level * 0.04;
      return {
        ...ally,
        id: `red-${ally.id}`,
        name: `Red ${ally.name}`,
        hp: Math.round(ally.hp * scale),
        damage: Math.round(ally.damage * (0.75 + this.scaleTier * 0.14)),
        speed: ally.speed * (0.88 + Math.min(0.35, this.scaleTier * 0.035)),
        attackSpeed: ally.attackSpeed * (0.86 + Math.min(0.4, this.scaleTier * 0.04)),
        role: ally.role,
        enemyTint: true,
        xpReward: 12 + this.scaleTier * 4,
        coinReward: 2 + Math.floor(this.scaleTier / 2),
      };
    }
  };
})();
