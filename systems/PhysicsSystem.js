(() => {
  "use strict";

  AR.PhysicsSystem = class {
    constructor(level) { this.level = level; }
    moveActor(actor, dt) {
      actor.prevX = actor.x;
      actor.prevY = actor.y;
      actor.vy = Math.min(actor.vy + AR.PHYSICS.gravity * dt, AR.PHYSICS.maxFall);
      actor.x += actor.vx * dt;
      this.resolveHorizontal(actor);
      actor.y += actor.vy * dt;
      actor.grounded = false;
      actor.riding = null;
      this.resolveVertical(actor);
      actor.x = AR.clamp(actor.x, 0, this.level.width - actor.w);
    }
    solids(actor) {
      const canBreak = actor && typeof actor.canBreakBlocks === "function" && actor.canBreakBlocks();
      return [
        ...this.level.platforms.filter((p) => !p.disabled),
        ...this.level.blocks.filter((b) => !b.broken && !canBreak),
        ...this.level.gates.filter((g) => !g.open),
      ];
    }
    resolveHorizontal(actor) {
      for (const p of this.solids(actor)) {
        if (!overlap(actor, p)) continue;
        if (actor.vx > 0) actor.x = p.x - actor.w;
        if (actor.vx < 0) actor.x = p.x + p.w;
        actor.vx = 0;
      }
    }
    resolveVertical(actor) {
      for (const p of this.solids(actor)) {
        if (!overlap(actor, p)) continue;
        if (actor.vy > 0 && actor.prevY + actor.h <= p.y + 12) {
          actor.y = p.y - actor.h;
          actor.vy = 0;
          actor.grounded = true;
          actor.riding = p;
        } else if (actor.vy < 0 && actor.prevY >= p.y + p.h - 12) {
          actor.y = p.y + p.h;
          actor.vy = 0;
        }
      }
    }
  };

  AR.rectOverlap = overlap;
  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
})();