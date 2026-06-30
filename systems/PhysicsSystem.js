(() => {
  "use strict";

  AR.PhysicsSystem = class {
    constructor(level) {
      this.level = level;
    }
    moveActor(actor, dt) {
      actor.vy = Math.min(actor.vy + AR.PHYSICS.gravity * dt, AR.PHYSICS.maxFall);
      actor.x += actor.vx * dt;
      this.resolveHorizontal(actor);
      actor.y += actor.vy * dt;
      actor.grounded = false;
      this.resolveVertical(actor);
    }
    resolveHorizontal(actor) {
      for (const p of this.level.platforms) {
        if (!overlap(actor, p)) continue;
        if (actor.vx > 0) actor.x = p.x - actor.w;
        if (actor.vx < 0) actor.x = p.x + p.w;
        actor.vx = 0;
      }
      actor.x = AR.clamp(actor.x, 0, this.level.width - actor.w);
    }
    resolveVertical(actor) {
      for (const p of this.level.platforms) {
        if (!overlap(actor, p)) continue;
        if (actor.vy > 0) {
          actor.y = p.y - actor.h;
          actor.vy = 0;
          actor.grounded = true;
        } else if (actor.vy < 0) {
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
