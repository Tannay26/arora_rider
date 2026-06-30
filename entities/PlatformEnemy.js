(() => {
  "use strict";

  AR.PlatformEnemy = class {
    constructor(data) {
      this.type = data.type || "beetle";
      this.x = data.x; this.y = data.y; this.w = this.type === "bat" || this.type === "moth" ? 48 : 46; this.h = 46;
      this.vx = typeSpeed(this.type); this.vy = 0; this.grounded = false; this.patrol = data.patrol;
      this.dead = false; this.squash = 0; this.jumpTimer = .9; this.floatT = 0;
    }
    update(dt, physics, slowFactor = 1) {
      if (this.dead) { this.squash += dt; return; }
      const stepDt = dt * slowFactor;
      this.floatT += stepDt;
      if (this.type === "bat" || this.type === "moth") {
        this.x += this.vx * stepDt;
        this.y += Math.sin(this.floatT * 4) * .8;
        if (this.x < this.patrol[0]) this.vx = Math.abs(this.vx);
        if (this.x + this.w > this.patrol[1]) this.vx = -Math.abs(this.vx);
        return;
      }
      if (this.type === "frog") {
        this.jumpTimer -= stepDt;
        if (this.jumpTimer <= 0 && this.grounded) { this.vy = -620; this.jumpTimer = 1.45; }
      }
      if (this.x < this.patrol[0]) this.vx = Math.abs(this.vx);
      if (this.x + this.w > this.patrol[1]) this.vx = -Math.abs(this.vx);
      physics.moveActor(this, stepDt);
      if (this.grounded && !this.hasGroundAhead(physics.level)) this.vx *= -1;
    }
    hasGroundAhead(level) {
      const probeX = this.vx > 0 ? this.x + this.w + 8 : this.x - 8;
      const probeY = this.y + this.h + 8;
      return level.platforms.some((p) => !p.disabled && probeX >= p.x && probeX <= p.x + p.w && probeY >= p.y && probeY <= p.y + p.h + 20);
    }
    draw(c, camera) {
      if (this.squash > .35) return;
      const x = this.x - camera.x, y = this.y;
      c.save();
      if (this.dead) { c.translate(0, y + this.h); c.scale(1, .35); c.translate(0, -y - this.h); }
      drawEnemyShape(c, x, y, this.type, this.vx < 0, this.floatT);
      c.restore();
    }
  };

  function typeSpeed(type) {
    return ({ beetle: -82, frog: -70, moth: -105, snail: -38, bat: -120 })[type] || -80;
  }
  function drawEnemyShape(c, x, y, type, left, t) {
    c.save();
    c.translate(x + 23, y + 23); c.scale(left ? -1 : 1, 1); c.translate(-23, -23);
    if (type === "frog") {
      c.fillStyle = "#4c9f67"; c.beginPath(); c.ellipse(23, 28, 22, 16, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#75d18a"; c.beginPath(); c.arc(33, 14, 13, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#162416"; c.fillRect(35, 9, 4, 4);
    } else if (type === "moth") {
      c.fillStyle = "#b997d6"; c.beginPath(); c.ellipse(16, 23, 17, 24, Math.sin(t) * .35, 0, Math.PI * 2); c.ellipse(32, 23, 17, 24, -Math.sin(t) * .35, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#4d385e"; c.fillRect(21, 8, 7, 31);
    } else if (type === "snail") {
      c.fillStyle = "#6e5846"; c.beginPath(); c.ellipse(25, 30, 25, 12, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#8a6ca8"; c.beginPath(); c.arc(20, 20, 17, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "#4b365f"; c.lineWidth = 4; c.beginPath(); c.arc(20, 20, 9, .4, Math.PI * 1.8); c.stroke();
    } else if (type === "bat") {
      c.fillStyle = "#40305c"; c.beginPath(); c.arc(24, 24, 12, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#6d5791"; c.beginPath(); c.moveTo(15, 20); c.lineTo(0, 7 + Math.sin(t * 6) * 5); c.lineTo(8, 34); c.moveTo(33, 20); c.lineTo(48, 7 + Math.sin(t * 6) * 5); c.lineTo(40, 34); c.fill();
    } else {
      c.fillStyle = "#8b4a5a"; c.beginPath(); c.ellipse(23, 28, 24, 16, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#5b2632"; c.beginPath(); c.arc(32, 14, 14, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#d6c3a0"; c.beginPath(); c.moveTo(39, 10); c.lineTo(50, 2); c.lineTo(44, 18); c.fill();
    }
    c.restore();
  }
})();