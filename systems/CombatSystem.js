(() => {
  "use strict";
  AR.CombatSystem = class {
    constructor(game) { this.game = game; }
    pickTarget(unit) {
      if (unit.side === "ally") {
        const forward = this.game.enemies.filter((e) => !e.dead && e.centerX >= unit.centerX - 24).sort((a, b) => a.centerX - b.centerX)[0];
        if (forward) return forward;
        return !this.game.enemyBase.dead ? this.game.enemyBase : null;
      }
      const blockers = [...this.game.allies, ...this.game.turrets].filter((a) => !a.dead && a.centerX <= unit.centerX + 24);
      const directAlly = blockers.sort((a, b) => b.centerX - a.centerX)[0];
      if (directAlly) return directAlly;
      if (AR.distance(unit, this.game.hero) < 240) return this.game.hero;
      return this.game.playerBase;
    }
    frontEnemyForHero() {
      return this.game.enemies.filter((e) => !e.dead && e.centerX > this.game.hero.centerX).sort((a, b) => a.centerX - b.centerX)[0];
    }
    damage(target, amount, source, type = "hit", show = true, forcedCrit = false) {
      if (!target || target.dead) return;
      const crit = forcedCrit || (type !== "burnDot" && Math.random() < .08);
      const dealt = amount * (crit ? 1.65 : 1);
      if (typeof target.damage === "function") target.damage(dealt); else target.hp -= dealt;
      if (show) this.game.float(`${crit ? "CRIT " : ""}${Math.round(dealt)}`, target.centerX, target.y - (target.h || 130) - 10, crit ? AR.COLORS.crit : AR.COLORS.damage, crit ? 26 : 20);
      if (type === "burn") this.game.particles.burst(target.centerX, target.y - (target.h || 60) * .6, "#ff7b31", 6, 55);
      if (type === "slow") this.game.particles.burst(target.centerX, target.y - (target.h || 60) * .6, "#8be8ff", 6, 45);
      if (type === "poison") this.game.particles.burst(target.centerX, target.y - (target.h || 60) * .6, "#85e06b", 6, 55);
      if (type === "chain" || type === "bolt") this.game.particles.burst(target.centerX, target.y - (target.h || 60) * .6, "#fff176", 8, 70);
      if (type === "splash") this.game.particles.burst(target.centerX, target.y - (target.h || 60) * .6, "#fff0a8", 8, 70);
      if (source && source.addXp) source.addXp(dealt * .14, this.game);
      if (target.hp <= 0 && !target.dead) target.dead = true;
      if (target.dead && target.side === "enemy" && !target.isBase) {
        this.game.hero.addXp(target.stats.xpReward || 18, this.game);
        this.game.coins += target.stats.coinReward || 3;
        if (source && source.addXp) source.addXp(26, this.game);
        this.game.particles.burst(target.centerX, target.y - target.h * .5, "#d6b0ff", 12, 90);
      }
    }
    chain(target, amount, source) {
      this.game.enemies.filter((e) => !e.dead && e !== target && Math.abs(e.centerX - target.centerX) < 130).slice(0, 2).forEach((e) => this.damage(e, amount, source, "chain"));
    }
  };
})();
