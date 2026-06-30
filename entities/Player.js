(() => {
  "use strict";

  AR.Player = class {
    constructor(spawn) {
      this.baseW = 54; this.baseH = 76;
      this.x = spawn.x; this.y = spawn.y; this.w = this.baseW; this.h = this.baseH;
      this.vx = 0; this.vy = 0; this.facing = 1; this.grounded = false;
      this.hp = 3; this.maxHp = 3; this.lives = 3; this.keys = 0; this.shieldHits = 0;
      this.invuln = 0; this.walkTime = 0; this.jumpCount = 0; this.activePower = null; this.powerTimers = {};
      this.chargeTimer = 0; this.sparkCooldown = 0;
    }
    update(dt, input, physics, game) {
      this.updatePowers(dt);
      const slow = this.powerTimers.giant > 0 ? 1.08 : 1;
      const axis = input.axis();
      if (axis) this.facing = axis;
      this.vx = axis * AR.PHYSICS.moveSpeed * slow;
      if (input.consumeCharge() && this.powerTimers.charge > 0) this.chargeTimer = .35;
      if (this.chargeTimer > 0) {
        this.chargeTimer -= dt;
        this.vx = this.facing * 760;
      }
      if (input.consumeSpark() && this.powerTimers.spark > 0 && this.sparkCooldown <= 0) {
        game.projectiles.push({ x: this.x + this.w / 2, y: this.y + 28, w: 34, h: 12, vx: this.facing * 620, life: .55 });
        this.sparkCooldown = .55;
      }
      if (input.consumeJump()) this.jump();
      const oldX = this.x;
      physics.moveActor(this, dt);
      if (this.riding && this.riding.dx) this.x += this.riding.dx;
      this.walkTime += Math.abs(this.x - oldX) * .045;
      this.invuln = Math.max(0, this.invuln - dt);
      this.sparkCooldown = Math.max(0, this.sparkCooldown - dt);
      if (this.grounded) this.jumpCount = 0;
    }
    jump() {
      if (this.grounded) {
        this.vy = AR.PHYSICS.jumpVelocity;
        this.jumpCount = 1;
      } else if (this.powerTimers.feather > 0 && this.jumpCount < 2) {
        this.vy = AR.PHYSICS.doubleJumpVelocity;
        this.jumpCount = 2;
      }
    }
    updatePowers(dt) {
      for (const key of Object.keys(this.powerTimers)) this.powerTimers[key] = Math.max(0, this.powerTimers[key] - dt);
      this.chargeTimer = Math.max(0, this.chargeTimer);
      const active = Object.keys(this.powerTimers).filter((k) => this.powerTimers[k] > 0).sort((a, b) => this.powerTimers[b] - this.powerTimers[a])[0];
      this.activePower = active || null;
      const giant = this.powerTimers.giant > 0;
      this.w = giant ? 70 : this.baseW;
      this.h = giant ? 92 : this.baseH;
    }
    givePower(type) {
      if (type === "shield") { this.shieldHits += 1; return; }
      this.powerTimers[type] = AR.POWERS[type].duration;
    }
    canBreakBlocks() { return this.chargeTimer > 0 || this.powerTimers.giant > 0; }
    isDangerous() { return this.chargeTimer > 0 || this.powerTimers.giant > 0; }
    hurt() {
      if (this.invuln > 0) return false;
      if (this.shieldHits > 0) { this.shieldHits -= 1; this.invuln = .8; return false; }
      this.hp -= 1;
      this.invuln = 1.2;
      this.vy = -420;
      return true;
    }
    respawn(spawn) {
      this.x = spawn.x; this.y = spawn.y; this.vx = 0; this.vy = 0; this.hp = this.maxHp;
      this.invuln = 1.5; this.jumpCount = 0; this.chargeTimer = 0;
    }
    draw(c, camera) {
      const x = this.x - camera.x, y = this.y, scale = this.powerTimers.giant > 0 ? 1.18 : 1;
      c.save();
      if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0) c.globalAlpha = .45;
      c.translate(x + this.w / 2, y + this.h);
      c.scale(this.facing * scale, scale);
      c.translate(-this.baseW / 2, -this.baseH);
      drawElephantCompanion(c, 3, 34, this.walkTime, this.chargeTimer > 0);
      drawRider(c, 20, 8, this.walkTime);
      c.restore();
    }
  };

  function drawElephantCompanion(c, x, y, t, charging) {
    const step = Math.sin(t) * 4;
    c.fillStyle = charging ? "#9fc7d2" : "#8d949d";
    c.beginPath(); c.ellipse(x + 26, y + 20, 29, 17, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#a4abb3"; c.beginPath(); c.arc(x + 52, y + 13, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#7d858d"; c.beginPath(); c.ellipse(x + 43, y + 13, 10, 15, -.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#8d949d"; c.fillRect(x + 59, y + 18, 7, 20);
    c.strokeStyle = charging ? "#9ff3ff" : "#f3ead7"; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x + 60, y + 14); c.quadraticCurveTo(x + 72, y + 21, x + 66, y + 31); c.stroke();
    c.fillStyle = "#5f6870"; [10, 26, 42, 55].forEach((lx, i) => c.fillRect(x + lx, y + 31 + (i % 2 ? step : -step) * .2, 6, 23));
  }
  function drawRider(c, x, y, t) {
    c.fillStyle = "#7f3e31"; c.fillRect(x + 6, y + 18, 18, 26);
    c.fillStyle = "#f0bb59"; c.beginPath(); c.arc(x + 15, y + 9, 10, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#ffe28a"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 23, y + 25); c.lineTo(x + 42, y + 18 + Math.sin(t) * 3); c.stroke();
  }
})();