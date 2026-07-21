(() => {
  "use strict";

  AR.PlatformEnemy = class {
    constructor(data) {
      const config =
        AR.ENEMY_INFO[data.type] ||
        AR.ENEMY_INFO.book;

      this.type = data.type || "book";
      this.name = config.name;

      this.x = data.x;
      this.y = data.y;
      this.w = config.w;
      this.h = config.h;

      this.hp = config.hp;
      this.maxHp = config.hp;

      this.vx = -config.speed;
      this.vy = 0;

      this.grounded = false;

      this.patrol =
        data.patrol || [
          data.x - 180,
          data.x + 180,
        ];

      this.dead = false;
      this.deathTimer = 0;
      this.damageTimer = 0;
      this.attackTimer = 0;

      this.anim = Math.random() * 10;
      this.boss = Boolean(data.boss);
      this.gravityScale = 1;
    }

    update(
      dt,
      physics,
      slowFactor = 1,
      player = null
    ) {
      const adjustedDt =
        dt * slowFactor;

      this.anim += adjustedDt;

      if (this.dead) {
        this.deathTimer += dt;
        return;
      }

      this.damageTimer = Math.max(
        0,
        this.damageTimer - dt
      );

      this.attackTimer = Math.max(
        0,
        this.attackTimer - dt
      );

      physics.moveActor(
        this,
        adjustedDt
      );

      const direction =
        Math.sign(this.vx) || -1;

      if (
        this.grounded &&
        !physics.groundAhead(
          this,
          direction,
          18
        )
      ) {
        this.vx *= -1;
      }

      if (this.x < this.patrol[0]) {
        this.vx =
          Math.abs(this.vx);
      }

      if (
        this.x + this.w >
        this.patrol[1]
      ) {
        this.vx =
          -Math.abs(this.vx);
      }

      if (
        this.type === "book" &&
        this.grounded
      ) {
        this.vy =
          Math.sin(this.anim * 3.2) >
          0.985
            ? -260
            : this.vy;
      }

      if (
        this.type === "bossArora"
      ) {
        this.updateBossBehaviour(
          player
        );
      }
    }

    updateBossBehaviour(player) {
      if (!player || this.dead) {
        return;
      }

      const distance =
        player.x - this.x;

      if (
        Math.abs(distance) < 620
      ) {
        const direction =
          Math.sign(distance) || 1;

        this.vx =
          direction *
          AR.ENEMY_INFO.bossArora.speed;
      }
    }

    damage(amount, game) {
      if (this.dead) {
        return;
      }

      this.hp -= amount;
      this.damageTimer = 0.2;

      game.burst(
        this.x + this.w / 2,
        this.y + this.h / 2,
        "hit",
        this.type === "dumbbell"
          ? 10
          : 7
      );

      if (this.hp <= 0) {
        this.dead = true;
        this.deathTimer = 0;

        game.cameraShake = Math.max(
          game.cameraShake,
          this.boss ? 18 : 7
        );

        game.burst(
          this.x + this.w / 2,
          this.y + this.h / 2,
          this.type === "book"
            ? "paper"
            : "spark",
          this.boss ? 25 : 14
        );
      } else if (
        this.type === "dumbbell"
      ) {
        game.cameraShake = Math.max(
          game.cameraShake,
          5
        );
      }
    }

    draw(c, camera) {
      if (
        this.dead &&
        this.deathTimer > 0.55
      ) {
        return;
      }

      const screenX =
        this.x - camera.x;

      const screenY = this.y;

      c.save();

      if (this.damageTimer > 0) {
        c.globalAlpha = 0.55;
      }

      if (this.dead) {
        c.translate(
          screenX + this.w / 2,
          screenY + this.h
        );

        c.scale(
          1,
          Math.max(
            0.08,
            1 -
              this.deathTimer * 1.9
          )
        );

        c.translate(
          -(screenX + this.w / 2),
          -(screenY + this.h)
        );
      }

      if (this.type === "book") {
        drawBookEnemy(
          c,
          screenX,
          screenY,
          this
        );
      } else if (
        this.type === "dumbbell"
      ) {
        drawDumbbellEnemy(
          c,
          screenX,
          screenY,
          this
        );
      } else {
        drawBossArora(
          c,
          screenX,
          screenY,
          this
        );
      }

      if (!this.dead) {
        drawHp(
          c,
          screenX,
          screenY - 9,
          this.w,
          this.hp / this.maxHp
        );
      }

      c.restore();
    }
  };

  function drawBookEnemy(
    c,
    x,
    y,
    enemy
  ) {
    const bounce =
      Math.sin(enemy.anim * 8) * 2;

    c.save();

    c.translate(
      x,
      y + bounce
    );

    c.fillStyle = "rgba(0,0,0,.22)";

    c.beginPath();

    c.ellipse(
      enemy.w / 2,
      enemy.h + 3,
      enemy.w * 0.42,
      6,
      0,
      0,
      Math.PI * 2
    );

    c.fill();

    c.fillStyle = "#7b342e";

    c.beginPath();

    c.moveTo(4, 14);
    c.quadraticCurveTo(
      19,
      3,
      33,
      12
    );
    c.lineTo(
      33,
      43
    );
    c.quadraticCurveTo(
      18,
      33,
      4,
      42
    );
    c.closePath();
    c.fill();

    c.beginPath();

    c.moveTo(
      enemy.w - 4,
      14
    );

    c.quadraticCurveTo(
      enemy.w - 19,
      3,
      35,
      12
    );

    c.lineTo(
      35,
      43
    );

    c.quadraticCurveTo(
      enemy.w - 18,
      33,
      enemy.w - 4,
      42
    );

    c.closePath();
    c.fill();

    c.fillStyle = "#f0dfbd";

    c.beginPath();

    c.moveTo(8, 14);
    c.quadraticCurveTo(
      20,
      8,
      32,
      15
    );
    c.lineTo(
      32,
      38
    );
    c.quadraticCurveTo(
      19,
      31,
      8,
      37
    );
    c.closePath();
    c.fill();

    c.beginPath();

    c.moveTo(
      enemy.w - 8,
      14
    );

    c.quadraticCurveTo(
      enemy.w - 20,
      8,
      36,
      15
    );

    c.lineTo(
      36,
      38
    );

    c.quadraticCurveTo(
      enemy.w - 19,
      31,
      enemy.w - 8,
      37
    );

    c.closePath();
    c.fill();

    drawAngryEyes(
      c,
      20,
      23,
      48,
      23
    );

    c.fillStyle = "#b63232";

    c.beginPath();
    c.moveTo(30, 37);
    c.lineTo(39, 37);
    c.lineTo(35, 47);
    c.closePath();
    c.fill();

    c.strokeStyle =
      "rgba(90,55,40,.45)";

    c.lineWidth = 1;

    for (let line = 0; line < 3; line++) {
      c.beginPath();

      c.moveTo(
        12,
        29 + line * 3
      );

      c.lineTo(
        26,
        28 + line * 3
      );

      c.stroke();

      c.beginPath();

      c.moveTo(
        42,
        28 + line * 3
      );

      c.lineTo(
        56,
        29 + line * 3
      );

      c.stroke();
    }

    c.restore();
  }

  function drawDumbbellEnemy(
    c,
    x,
    y,
    enemy
  ) {
    const rotation =
      enemy.anim *
      Math.sign(enemy.vx || 1) *
      2;

    c.save();

    c.translate(
      x + enemy.w / 2,
      y + enemy.h / 2
    );

    c.rotate(rotation);

    c.fillStyle = "#252a32";
    c.fillRect(
      -27,
      -6,
      54,
      12
    );

    c.fillStyle = "#424a56";

    drawWeightPlate(
      c,
      -30,
      0,
      20
    );

    drawWeightPlate(
      c,
      30,
      0,
      20
    );

    c.fillStyle = "#ff644f";

    c.beginPath();
    c.arc(
      -8,
      -2,
      3,
      0,
      Math.PI * 2
    );
    c.fill();

    c.beginPath();
    c.arc(
      8,
      -2,
      3,
      0,
      Math.PI * 2
    );
    c.fill();

    c.strokeStyle = "#ff644f";
    c.lineWidth = 2;

    c.beginPath();

    c.moveTo(
      -10,
      8
    );

    c.quadraticCurveTo(
      0,
      2,
      10,
      8
    );

    c.stroke();

    if (
      enemy.hp < enemy.maxHp
    ) {
      c.strokeStyle = "#d7dce3";
      c.lineWidth = 2;
      c.beginPath();

      c.moveTo(
        23,
        -16
      );

      c.lineTo(
        29,
        -7
      );

      c.lineTo(
        24,
        1
      );

      c.stroke();
    }

    c.restore();
  }

  function drawWeightPlate(
    c,
    x,
    y,
    radius
  ) {
    c.beginPath();

    c.ellipse(
      x,
      y,
      radius,
      radius * 0.88,
      0,
      0,
      Math.PI * 2
    );

    c.fill();

    c.strokeStyle =
      "rgba(255,255,255,.18)";

    c.lineWidth = 3;
    c.stroke();

    c.fillStyle = "#1d2128";
    c.beginPath();

    c.arc(
      x,
      y,
      radius * 0.4,
      0,
      Math.PI * 2
    );

    c.fill();

    c.fillStyle = "#424a56";
  }

  function drawAngryEyes(
    c,
    leftX,
    leftY,
    rightX,
    rightY
  ) {
    c.fillStyle = "#fff";

    c.beginPath();
    c.ellipse(
      leftX,
      leftY,
      7,
      5,
      -0.2,
      0,
      Math.PI * 2
    );
    c.fill();

    c.beginPath();
    c.ellipse(
      rightX,
      rightY,
      7,
      5,
      0.2,
      0,
      Math.PI * 2
    );
    c.fill();

    c.fillStyle = "#251919";

    c.beginPath();
    c.arc(
      leftX + 1,
      leftY,
      2.4,
      0,
      Math.PI * 2
    );
    c.fill();

    c.beginPath();
    c.arc(
      rightX - 1,
      rightY,
      2.4,
      0,
      Math.PI * 2
    );
    c.fill();

    c.strokeStyle = "#4c211e";
    c.lineWidth = 3;

    c.beginPath();

    c.moveTo(
      leftX - 7,
      leftY - 8
    );

    c.lineTo(
      leftX + 6,
      leftY - 4
    );

    c.stroke();

    c.beginPath();

    c.moveTo(
      rightX + 7,
      rightY - 8
    );

    c.lineTo(
      rightX - 6,
      rightY - 4
    );

    c.stroke();
  }

  function drawBossArora(
    c,
    x,
    y,
    enemy
  ) {
    c.save();

    c.fillStyle =
      "rgba(85,30,105,.38)";

    c.beginPath();

    c.ellipse(
      x + enemy.w / 2,
      y + enemy.h / 2,
      enemy.w / 2 + 10,
      enemy.h / 2 + 7,
      0,
      0,
      Math.PI * 2
    );

    c.fill();

    c.fillStyle = "#33203c";

    c.fillRect(
      x + 21,
      y + 28,
      86,
      78
    );

    c.fillStyle = "#6d3d73";

    c.beginPath();

    c.moveTo(
      x + 64,
      y
    );

    c.lineTo(
      x + 111,
      y + 38
    );

    c.lineTo(
      x + 18,
      y + 38
    );

    c.closePath();
    c.fill();

    c.strokeStyle = "#e1be66";
    c.lineWidth = 5;

    c.beginPath();

    c.arc(
      x + 65,
      y + 65,
      28 +
        Math.sin(enemy.anim * 4) *
          2,
      0,
      Math.PI * 2
    );

    c.stroke();

    c.restore();
  }

  function drawHp(
    c,
    x,
    y,
    width,
    ratio
  ) {
    c.fillStyle =
      "rgba(0,0,0,.5)";

    c.fillRect(
      x,
      y,
      width,
      5
    );

    c.fillStyle = "#d85b56";

    c.fillRect(
      x,
      y,
      width *
        Math.max(0, ratio),
      5
    );
  }
})();
