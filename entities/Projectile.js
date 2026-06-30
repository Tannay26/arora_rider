(() => {
  "use strict";
  AR.Projectile = class {
    constructor({ x, y, side, damage, speed, target, color, owner, type }) {
      Object.assign(this, { x, y, side, damage, speed, target, color, owner, type, dead: false });
      this.radius = type === "bolt" ? 13 : 7;
      this.life = 4;
    }
    update(dt, game) {
      this.life -= dt;
      if (this.life <= 0) this.dead = true;
      if (this.target && !this.target.dead) {
        const dx = this.target.centerX - this.x;
        this.x += Math.sign(dx || 1) * this.speed * dt;
        if (Math.abs(dx) < this.speed * dt + 18) {
          game.combat.damage(this.target, this.damage, this.owner, this.type);
          if (this.type === "chain") game.combat.chain(this.target, this.damage * .45, this.owner);
          this.dead = true;
        }
      } else {
        this.x += this.speed * dt * (this.side === "ally" ? 1 : -1);
      }
      if (["burn", "slow", "chain", "bolt"].includes(this.type)) game.particles.trail(this.x, this.y, this.color, 1);
      if (this.x < -120 || this.x > AR.WORLD.width + 120) this.dead = true;
    }
    draw(c) {
      c.save();
      c.fillStyle = this.color;
      c.shadowColor = this.color;
      c.shadowBlur = this.type === "chain" ? 24 : 14;
      if (this.type === "longshot") {
        c.strokeStyle = this.color; c.lineWidth = 4; c.beginPath(); c.moveTo(this.x - 16, this.y); c.lineTo(this.x + 18, this.y); c.stroke();
      } else {
        c.beginPath(); c.arc(this.x, this.y, this.radius, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }
  };
})();
