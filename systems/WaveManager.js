(() => {
  "use strict";
  AR.WaveManager = class {
    constructor(game) {
      this.game = game;
      this.wave = 0;
      this.maxWaves = 10;
      this.queue = [];
      this.active = false;
      this.countdown = 0;
      this.spawned = 0;
      this.total = 0;
      this.nextWaveTimer = 0;
      this.bossWarning = false;
      this.lastSpawnIn = 0;
    }
    get remaining() { return this.queue.length + this.game.enemies.length; }
    start() {
      if (this.active || this.nextWaveTimer > 0 || this.wave >= this.maxWaves || this.game.ended) return;
      this.wave += 1;
      this.countdown = this.wave === 10 ? 4 : 2.5;
      this.queue = AR.makeLevelOneWave(this.wave, this.game);
      this.total = this.queue.length;
      this.spawned = 0;
      this.active = true;
      this.bossWarning = this.wave === 10;
      this.game.banner(this.bossWarning ? "Boss warning: Elder Warbeast approaches!" : `Wave ${this.wave} forming...`);
    }
    update(dt) {
      if (!this.active) {
        this.nextWaveTimer = Math.max(0, this.nextWaveTimer - dt);
        return;
      }
      if (this.countdown > 0) {
        this.countdown -= dt;
        return;
      }
      this.queue.forEach((event) => event.time -= dt);
      this.lastSpawnIn = this.queue.length ? Math.max(0, Math.min(...this.queue.map((event) => event.time))) : 0;
      const ready = this.queue.filter((event) => event.time <= 0);
      this.queue = this.queue.filter((event) => event.time > 0);
      ready.forEach((event) => {
        this.game.enemies.push(new AR.Unit(event.stats, "enemy", AR.WORLD.enemyStructureX - 70));
        this.spawned += 1;
      });
      if (!this.queue.length && !this.game.enemies.length) {
        this.active = false;
        this.game.hero.addXp(34 + this.wave * 14, this.game);
        this.game.coins += 16 + this.wave * 5;
        if (this.wave < this.maxWaves) {
          this.game.allies.forEach((unit) => unit.addXp(18 + this.wave * 3, this.game));
          this.nextWaveTimer = 12;
          this.game.banner(`Wave ${this.wave} cleared. Next wave ready soon.`);
        } else {
          this.game.banner("All waves cleared. Bring down the fortress.");
        }
      }
    }
  };
})();
