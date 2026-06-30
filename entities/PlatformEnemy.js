(() => {
  "use strict";

  AR.PlatformEnemy = class {
    constructor(data) {
      this.x = data.x;
      this.y = data.y;
      this.w = 46;
      this.h = 46;
      this.vx = -90;
      this.vy = 0;
      this.grounded = false;
      this.patrol = data.patrol;
      this.dead = false;
      this.squash = 0;
    }
    update(dt, physics) {
      if (this.dead) {
        this.squash += dt;
        return;
      }
      if (this.x < this.patrol[0]) this.vx = Math.abs(this.vx);
      if (this.x + this.w > this.patrol[1]) this.vx = -Math.abs(this.vx);
      physics.moveActor(this, dt);
      if (this.grounded && !this.hasGroundAhead(physics.level)) this.vx *= -1;
    }
    hasGroundAhead(level) {
      const probeX = this.vx > 0 ? this.x + this.w + 8 : this.x - 8;
      const probeY = this.y + this.h + 8;
      return level.platforms.some((p) => probeX >= p.x && probeX <= p.x + p.w && probeY >= p.y && probeY <= p.y + p.h + 20);
    }
    draw(c, camera) {
      if (this.squash > .35) return;
      const x = this.x - camera.x, y = this.y;
      c.save();
      if (this.dead) c.scale(1, .35);
      c.fillStyle = "#8b4a5a";
      c.beginPath(); c.ellipse(x + 23, y + 28, 24, 16, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#5b2632";
      c.beginPath(); c.arc(x + 32, y + 14, 14, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#d6c3a0";
      c.beginPath(); c.moveTo(x + 39, y + 10); c.lineTo(x + 50, y + 2); c.lineTo(x + 44, y + 18); c.fill();
      c.fillStyle = "#ffdf8c"; c.fillRect(x + 34, y + 12, 4, 4);
      c.restore();
    }
  };
})();
