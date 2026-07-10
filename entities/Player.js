(() => {
  "use strict";

  AR.Player = class {
    constructor(spawn) {
      this.baseW = 54;
      this.baseH = 76;

      this.x = spawn.x;
      this.y = spawn.y;
      this.w = this.baseW;
      this.h = this.baseH;

      this.vx = 0;
      this.vy = 0;
      this.facing = 1;
      this.grounded = false;
      this.wallDir = 0;

      this.hp = 4;
      this.maxHp = 4;
      this.lives = 3;
      this.keys = 0;

      this.invuln = 0;
      this.walkTime = 0;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.wallSlide = false;

      this.activeAbility = null;
      this.abilityStatus = "Inactive";
      this.fireCooldown = 0;
      this.landSquash = 0;

      this.animationFrame = 0;
      this.animationTimer = 0;
      this.animationState = "idle";
    }

    update(dt, input, physics, game) {
      this.prevGrounded = this.grounded;

      this.invuln = Math.max(0, this.invuln - dt);
      this.fireCooldown = Math.max(0, this.fireCooldown - dt);

      if (this.grounded) {
        this.coyote = AR.PHYSICS.coyoteTime;
      } else {
        this.coyote = Math.max(0, this.coyote - dt);
      }

      if (input.consumeJump()) {
        this.jumpBuffer = AR.PHYSICS.jumpBuffer;
      } else {
        this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
      }

      const axis = input.axis();

      if (axis) {
        this.facing = axis;
      }

      const onIce =
        this.riding &&
        this.riding.type === "ice";

      const target =
        axis * AR.PHYSICS.moveSpeed;

      const accel =
        this.grounded
          ? AR.PHYSICS.acceleration
          : AR.PHYSICS.airAcceleration;

      const friction =
        this.grounded
          ? onIce
            ? 850
            : AR.PHYSICS.groundFriction
          : AR.PHYSICS.airFriction;

      if (axis) {
        this.vx = approach(
          this.vx,
          target,
          accel * dt
        );
      } else {
        this.vx = approach(
          this.vx,
          0,
          friction * dt
        );
      }

      this.wallSlide =
        !this.grounded &&
        this.wallDir !== 0 &&
        this.vy > 60 &&
        axis === this.wallDir;

      if (this.wallSlide) {
        this.vy = Math.min(this.vy, 210);
      }

      if (
        this.activeAbility === "wings" &&
        input.jumpHeld()
      ) {
        this.vy = Math.max(
          this.vy - 2600 * dt,
          -430
        );
      }

      if (
        !input.jumpHeld() &&
        this.vy < -260
      ) {
        this.vy *= 0.84;
      }

      if (this.jumpBuffer > 0) {
        this.tryJump(game);
      }

      if (
        this.activeAbility === "blaster" &&
        input.consumeFire()
      ) {
        this.fire(game);
      }

      const oldX = this.x;

      physics.moveActor(this, dt);

      if (this.riding) {
        this.x += this.riding.dx || 0;
        this.y += this.riding.dy || 0;
      }

      if (
        !this.prevGrounded &&
        this.grounded &&
        this.vy === 0
      ) {
        this.landSquash = 0.18;

        game.burst(
          this.x + this.w / 2,
          this.y + this.h,
          "dust",
          8
        );
      }

      this.walkTime +=
        Math.abs(this.x - oldX) * 0.045;

      this.landSquash = Math.max(
        0,
        this.landSquash - dt
      );

      this.updateAnimation(dt, axis);
      this.applyZones(game, dt);
    }

    updateAnimation(dt, axis) {
      if (!this.grounded) {
        this.animationState = "jump";
        this.animationFrame = 0;
        this.animationTimer = 0;
        return;
      }

      if (
        Math.abs(this.vx) > 30 &&
        axis !== 0
      ) {
        this.animationState = "run";
        this.animationTimer += dt;

        const frameDuration = 0.09;

        while (
          this.animationTimer >= frameDuration
        ) {
          this.animationTimer -= frameDuration;

          this.animationFrame =
            (this.animationFrame + 1) % 8;
        }

        return;
      }

      this.animationState = "idle";
      this.animationFrame = 0;
      this.animationTimer = 0;
    }

    applyZones(game, dt) {
      for (const h of game.level.hazards) {
        if (
          h.kind === "wind" &&
          AR.rectOverlap(this, h)
        ) {
          this.vx += h.force * dt;
        }

        if (
          h.kind === "waterfall" &&
          AR.rectOverlap(this, h)
        ) {
          this.vy += h.force * dt;
        }
      }
    }

    tryJump(game) {
      if (this.coyote > 0) {
        this.vy = AR.PHYSICS.jumpVelocity;
        this.grounded = false;
        this.coyote = 0;
        this.jumpBuffer = 0;

        game.burst(
          this.x + this.w / 2,
          this.y + this.h,
          "dust",
          6
        );
      } else if (this.wallDir !== 0) {
        this.vx =
          -this.wallDir *
          AR.PHYSICS.wallJumpX;

        this.vy =
          AR.PHYSICS.wallJumpY;

        this.facing =
          -this.wallDir;

        this.jumpBuffer = 0;

        game.burst(
          this.x + this.w / 2,
          this.y + 35,
          "spark",
          5
        );
      }
    }

    fire(game) {
      if (this.fireCooldown > 0) {
        return;
      }

      game.projectiles.push({
        x: this.x + this.w / 2,
        y: this.y + 25,
        w: 36,
        h: 14,
        vx: this.facing * 720,
        life: 0.9,
        color: "#93ecff",
      });

      game.cameraShake = Math.max(
        game.cameraShake,
        4
      );

      this.fireCooldown = 0.22;
    }

    setAbility(key) {
      this.activeAbility = key;
      this.abilityStatus = "Active";
    }

    clearAbility() {
      this.activeAbility = null;
      this.abilityStatus = "Inactive";
    }

    canBreakBlocks() {
      return this.activeAbility === "guardian";
    }

    isDangerous() {
      return this.activeAbility === "guardian";
    }

    hurt(game, source = "hit") {
      if (this.invuln > 0) {
        return false;
      }

      if (this.activeAbility === "stone") {
        this.clearAbility();
        this.invuln = 1;

        game.burst(
          this.x + this.w / 2,
          this.y + 20,
          "shield",
          14
        );

        return false;
      }

      if (this.activeAbility) {
        this.clearAbility();
      }

      this.hp -= 1;
      this.invuln = 1.15;
      this.vy = -430;
      game.cameraShake = 14;

      game.burst(
        this.x + this.w / 2,
        this.y + 30,
        "hit",
        12
      );

      return true;
    }

    respawn(spawn) {
      this.x = spawn.x;
      this.y = spawn.y;
      this.vx = 0;
      this.vy = 0;
      this.hp = this.maxHp;
      this.invuln = 1.4;
      this.coyote = 0;
      this.jumpBuffer = 0;

      this.animationState = "idle";
      this.animationFrame = 0;
      this.animationTimer = 0;

      this.clearAbility();
    }

    draw(c, camera) {
      const sx = this.x - camera.x;
      const sy = this.y;

      const squashX =
        this.landSquash > 0 ? 1.06 : 1;

      const squashY =
        this.landSquash > 0 ? 0.92 : 1;

      c.save();

      if (
        this.invuln > 0 &&
        Math.floor(this.invuln * 14) % 2 === 0
      ) {
        c.globalAlpha = 0.45;
      }

      if (this.activeAbility) {
        drawAura(
          c,
          sx + this.w / 2,
          sy + this.h / 2,
          this.activeAbility,
          performance.now() / 1000
        );
      }

      const idleImage =
        AR.getImage("riderIdle");

      const runImage =
        AR.getImage("riderRun");

      const jumpImage =
        AR.getImage("riderJump");

      const drawWidth = 190;
      const drawHeight = 119;

      const walkingBob =
        this.animationState === "run"
          ? Math.sin(
              this.animationFrame *
                Math.PI /
                2
            ) * 2
          : 0;

      c.translate(
        sx + this.w / 2,
        sy + this.h + walkingBob
      );

      c.scale(
        this.facing * squashX,
        squashY
      );

      if (
        this.animationState === "run" &&
        runImage
      ) {
        const frameCount = 8;
        const frameWidth =
          runImage.width / frameCount;

        const frameHeight =
          runImage.height;

        c.drawImage(
          runImage,
          this.animationFrame * frameWidth,
          0,
          frameWidth,
          frameHeight,
          -drawWidth / 2,
          -drawHeight,
          drawWidth,
          drawHeight
        );
      } else if (
        this.animationState === "jump" &&
        jumpImage
      ) {
        c.drawImage(
          jumpImage,
          -drawWidth / 2,
          -drawHeight,
          drawWidth,
          drawHeight
        );
      } else if (idleImage) {
        c.drawImage(
          idleImage,
          -drawWidth / 2,
          -drawHeight,
          drawWidth,
          drawHeight
        );
      } else {
        c.translate(
          -this.baseW / 2,
          -this.baseH
        );

        drawElephant(
          c,
          1,
          34,
          this.walkTime,
          this.wallSlide
        );

        drawRider(
          c,
          20,
          7,
          this.walkTime
        );
      }

      c.restore();
    }
  };

  function approach(value, target, amount) {
    return value < target
      ? Math.min(value + amount, target)
      : Math.max(value - amount, target);
  }

  function drawAura(c, x, y, ability, t) {
    const colors = {
      guardian: "rgba(255,215,94,.35)",
      wings: "rgba(160,220,255,.3)",
      blaster: "rgba(126,242,255,.32)",
      stone: "rgba(190,190,180,.36)",
      time: "rgba(175,145,255,.32)",
      treasure: "rgba(255,235,120,.38)",
    };

    c.fillStyle =
      colors[ability] ||
      "rgba(255,255,255,.25)";

    c.beginPath();

    c.ellipse(
      x,
      y,
      48 + Math.sin(t * 5) * 4,
      58,
      0,
      0,
      Math.PI * 2
    );

    c.fill();
  }

  function drawElephant(c, x, y, t, sliding) {
    const step = Math.sin(t) * 4;

    c.fillStyle = "#7f8992";
    c.beginPath();
    c.ellipse(
      x + 28,
      y + 20,
      30,
      17,
      0,
      0,
      Math.PI * 2
    );
    c.fill();

    c.fillStyle = "#99a3ab";
    c.beginPath();
    c.arc(
      x + 54,
      y + 13,
      14,
      0,
      Math.PI * 2
    );
    c.fill();

    c.fillStyle = "#68737b";
    c.beginPath();
    c.ellipse(
      x + 44,
      y + 13,
      10,
      15,
      -0.2,
      0,
      Math.PI * 2
    );
    c.fill();

    c.fillStyle = "#4b5359";

    [11, 27, 43, 56].forEach(
      (lx, i) => {
        c.fillRect(
          x + lx,
          y +
            31 +
            (i % 2 ? step : -step) *
              0.25,
          7,
          23
        );
      }
    );

    c.strokeStyle =
      sliding ? "#aee8ff" : "#f7edd6";

    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(x + 61, y + 12);
    c.quadraticCurveTo(
      x + 75,
      y + 20,
      x + 67,
      y + 32
    );
    c.stroke();

    c.strokeStyle = "#5f6870";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x, y + 20);
    c.quadraticCurveTo(
      x - 9,
      y + 26,
      x - 4,
      y + 35
    );
    c.stroke();

    c.fillStyle = "#b2703b";
    c.fillRect(
      x + 18,
      y + 4,
      28,
      12
    );
  }

  function drawRider(c, x, y, t) {
    c.fillStyle = "#71362f";
    c.fillRect(
      x + 7,
      y + 18,
      17,
      25
    );

    c.fillStyle = "#efba68";
    c.beginPath();
    c.arc(
      x + 15,
      y + 9,
      10,
      0,
      Math.PI * 2
    );
    c.fill();

    c.strokeStyle = "#ffe18b";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(
      x + 23,
      y + 25
    );
    c.lineTo(
      x + 42,
      y + 18 + Math.sin(t) * 3
    );
    c.stroke();
  }
})();
