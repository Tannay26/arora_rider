(() => {
  "use strict";

  AR.Player = class {
    constructor(spawn) {
      this.x = spawn.x;
      this.y = spawn.y;
      this.w = 54;
      this.h = 76;
      this.vx = 0;
      this.vy = 0;
      this.facing = 1;
      this.grounded = false;
      this.hp = 3;
      this.maxHp = 3;
      this.lives = 3;
      this.invuln = 0;
      this.walkTime = 0;
    }
    update(dt, input, physics) {
      const axis = input.axis();
      if (axis) this.facing = axis;
      this.vx = axis * AR.PHYSICS.moveSpeed;
      if (input.consumeJump() && this.grounded) this.vy = AR.PHYSICS.jumpVelocity;
      physics.moveActor(this, dt);
      this.walkTime += Math.abs(axis) * dt * 10;
      this.invuln = Math.max(0, this.invuln - dt);
    }
    hurt() {
      if (this.invuln > 0) return false;
      this.hp -= 1;
      this.invuln = 1.2;
      this.vy = -420;
      return true;
    }
    respawn(spawn) {
      this.x = spawn.x;
      this.y = spawn.y;
      this.vx = 0;
      this.vy = 0;
      this.hp = this.maxHp;
      this.invuln = 1.5;
    }
    draw(c, camera) {
      const x = this.x - camera.x, y = this.y;
      c.save();
      if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0) c.globalAlpha = 0.45;
      c.translate(x + this.w / 2, 0);
      c.scale(this.facing, 1);
      c.translate(-this.w / 2, 0);
      drawElephantCompanion(c, 4, y + 34, this.walkTime);
      drawRider(c, 20, y + 8, this.walkTime);
      c.restore();
    }
  };

  function drawElephantCompanion(c, x, y, t) {
    const step = Math.sin(t) * 4;
    c.fillStyle = "#8d949d";
    c.beginPath(); c.ellipse(x + 26, y + 20, 29, 17, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#a4abb3";
    c.beginPath(); c.arc(x + 52, y + 13, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#7d858d";
    c.beginPath(); c.ellipse(x + 43, y + 13, 10, 15, -.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#8d949d"; c.fillRect(x + 59, y + 18, 7, 20);
    c.strokeStyle = "#f3ead7"; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x + 60, y + 14); c.quadraticCurveTo(x + 70, y + 20, x + 66, y + 30); c.stroke();
    c.fillStyle = "#5f6870";
    [10, 26, 42, 55].forEach((lx, i) => c.fillRect(x + lx, y + 31 + (i % 2 ? step : -step) * .2, 6, 23));
  }

  function drawRider(c, x, y, t) {
    c.fillStyle = "#7f3e31"; c.fillRect(x + 6, y + 18, 18, 26);
    c.fillStyle = "#f0bb59"; c.beginPath(); c.arc(x + 15, y + 9, 10, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#ffe28a"; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x + 23, y + 25); c.lineTo(x + 42, y + 18 + Math.sin(t) * 3); c.stroke();
  }
})();
