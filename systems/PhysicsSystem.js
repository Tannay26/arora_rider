(() => {
  "use strict";

  AR.PhysicsSystem = class {
    constructor(level) { this.level = level; }
    moveActor(actor, dt) {
      actor.prevX = actor.x; actor.prevY = actor.y; actor.wallDir = 0;
      const gravity = actor.gravityScale === 0 ? 0 : AR.PHYSICS.gravity * (actor.gravityScale || 1);
      actor.vy = Math.min(actor.vy + gravity * dt, AR.PHYSICS.maxFall);
      actor.x += actor.vx * dt;
      this.resolveHorizontal(actor);
      actor.y += actor.vy * dt;
      actor.grounded = false; actor.riding = null;
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
        if (p.oneWay || !AR.rectOverlap(actor, p)) continue;
        if (actor.vx > 0) { actor.x = p.x - actor.w; actor.wallDir = 1; }
        if (actor.vx < 0) { actor.x = p.x + p.w; actor.wallDir = -1; }
        actor.vx = 0;
      }
    }
    resolveVertical(actor) {
      for (const p of this.solids(actor)) {
        if (!AR.rectOverlap(actor, p)) continue;
        if (actor.vy > 0 && actor.prevY + actor.h <= p.y + 14) {
          actor.y = p.y - actor.h; actor.vy = 0; actor.grounded = true; actor.riding = p;
        } else if (!p.oneWay && actor.vy < 0 && actor.prevY >= p.y + p.h - 14) {
          actor.y = p.y + p.h; actor.vy = 0;
        }
      }
    }
    groundAhead(actor, dir, distance = 16) {
      const px = dir > 0 ? actor.x + actor.w + distance : actor.x - distance;
      const py = actor.y + actor.h + 18;
      return this.solids(actor).some((p) => !p.disabled && px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h + 28);
    }
  };
})();
