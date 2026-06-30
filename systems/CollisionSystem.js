(() => {
  "use strict";
  AR.CollisionSystem = class {
    constructor(game) { this.game = game; }
    separate() {
      const units = [...this.game.allies, ...this.game.enemies].filter((u) => !u.dead);
      for (let i = 0; i < units.length; i++) {
        for (let j = i + 1; j < units.length; j++) {
          const a = units[i], b = units[j];
          const min = (a.w + b.w) * .45;
          const dx = b.centerX - a.centerX;
          if (Math.abs(dx) < min) {
            const push = (min - Math.abs(dx)) * .5;
            const dir = dx >= 0 ? 1 : -1;
            a.x -= push * dir;
            b.x += push * dir;
          }
        }
      }
      units.forEach((u) => {
        if (u.side === "ally") u.x = Math.min(u.x, this.game.enemyBase.left - u.w - 4);
        else u.x = Math.max(u.x, this.game.playerBase.right + 4);
        u.x = AR.clamp(u.x, AR.WORLD.laneMin - 30, AR.WORLD.laneMax);
      });
      if (this.game.hero.right > this.game.enemyBase.left - 10) this.game.hero.x = this.game.enemyBase.left - this.game.hero.w - 10;
      if (this.game.hero.left < this.game.playerBase.right + 8) this.game.hero.x = this.game.playerBase.right + 8;
    }
  };
})();
