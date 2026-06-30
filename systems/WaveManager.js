(() => {
  "use strict";

  AR.WaveManager = class {
    constructor(game) {
      this.game = game;
      this.sequence = Array.from({ length: 50 }, () => Math.floor(Math.random() * 10) + 1);
      this.spawnInterval = 2;
      this.spawnTimer = this.spawnInterval;
      this.spawned = 0;
      this.total = this.sequence.length;
      this.active = true;
      this.lastSpawnIn = this.spawnTimer;
      this.wave = 1;
      this.maxWaves = 1;
      this.scaleTier = 0;
      this.queue = [];
      this.countdown = 0;
      this.nextWaveTimer = 0;
      console.log("[Arora Rider] Enemy test sequence", this.sequence.join(", "));
    }

    get remaining() {
      return this.game.enemies.length;
    }

    get nextNumber() {
      return this.sequence[this.spawned] || null;
    }

    get nextTypeName() {
      return this.nextNumber ? AR.ALLY_BLUEPRINTS[this.nextNumber - 1].name : "Complete";
    }

    start() {
      this.active = true;
      this.game.banner("50-enemy spawn test is running.");
    }

    update(dt) {
      if (!this.active || this.spawned >= this.total) {
        this.lastSpawnIn = 0;
        return;
      }
      this.spawnTimer -= dt;
      this.lastSpawnIn = Math.max(0, this.spawnTimer);
      if (this.spawnTimer <= 0) {
        this.spawnNext();
        this.spawnTimer += this.spawnInterval;
        this.lastSpawnIn = this.spawnTimer;
      }
    }

    spawnNext() {
      const number = this.sequence[this.spawned];
      const blueprint = AR.ALLY_BLUEPRINTS[number - 1];
      const enemy = new AR.Unit(this.enemyFromAlly(blueprint), "enemy", AR.WORLD.enemyStructureX - 95);
      enemy.y = AR.WORLD.groundY;
      this.game.enemies.push(enemy);
      this.spawned += 1;
      console.log("Spawned enemy", enemy.name, enemy);
    }

    enemyFromAlly(ally) {
      return {
        ...ally,
        id: `red-${ally.id}`,
        name: `Red ${ally.name}`,
        hp: Math.round(ally.hp * 1.05),
        damage: Math.round(ally.damage * 0.8),
        speed: ally.speed * 0.9,
        role: ally.role,
        enemyTint: true,
        xpReward: 12,
        coinReward: 2,
      };
    }
  };
})();
