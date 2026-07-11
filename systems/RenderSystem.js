(() => {
  "use strict";

  AR.RenderSystem = class {
    constructor(game) {
      this.game = game;
      this.time = 0;
    }

    draw() {
      const {
        ctx: c,
        camera,
        level,
        player,
      } = this.game;

      this.time += 1 / 60;

      c.clearRect(
        0,
        0,
        AR.VIEW.width,
        AR.VIEW.height
      );

      const shakeX = this.game.cameraShake
        ? AR.rand(
            -this.game.cameraShake,
            this.game.cameraShake
          )
        : 0;

      const shakeY = this.game.cameraShake
        ? AR.rand(
            -this.game.cameraShake,
            this.game.cameraShake
          )
        : 0;

      c.save();
      c.translate(shakeX, shakeY);

      drawBackground(
        c,
        camera,
        level,
        this.time
      );

      c.save();
      c.translate(-camera.x, 0);

      drawSecretHints(
        c,
        level,
        player,
        this.time
      );

      level.tunnels.forEach((tunnel) => {
        drawTunnel(c, tunnel);
      });

      level.secretRooms.forEach((room) => {
        drawSecretRoom(
          c,
          room,
          player,
          this.time
        );
      });

      level.platforms.forEach((platform) => {
        drawPlatform(
          c,
          platform,
          this.time
        );
      });

      level.blocks.forEach((block) => {
        if (!block.broken) {
          drawBlock(c, block);
        }
      });

      level.hazards.forEach((hazard) => {
        drawHazard(
          c,
          hazard,
          this.time
        );
      });

      level.pads.forEach((pad) => {
        drawPad(
          c,
          pad,
          this.time
        );
      });

      level.gates.forEach((gate) => {
        drawGate(c, gate);
      });

      level.keys.forEach((key) => {
        if (!key.taken) {
          drawKey(
            c,
            key,
            this.time
          );
        }
      });

      level.powerups.forEach((powerup) => {
        if (!powerup.taken) {
          drawStar(
            c,
            powerup,
            this.time
          );
        }
      });

      level.checkpoints.forEach(
        (checkpoint) => {
          drawCheckpoint(
            c,
            checkpoint,
            this.time
          );
        }
      );

      if (level.secretExit) {
        drawSecretExit(
          c,
          level.secretExit,
          this.time
        );
      }

      drawPortal(
        c,
        level.portal,
        this.time
      );

      c.restore();

      level.gems.forEach((gem) => {
        gem.draw(
          c,
          camera,
          player
        );
      });

      level.enemies.forEach((enemy) => {
        enemy.draw(c, camera);
      });

      this.game.projectiles.forEach(
        (projectile) => {
          drawProjectile(
            c,
            projectile,
            camera
          );
        }
      );

      this.game.particles.forEach(
        (particle) => {
          drawParticle(
            c,
            particle,
            camera
          );
        }
      );

      player.draw(c, camera);

      drawHpBar(
        c,
        player.x - camera.x,
        player.y - 13,
        player.w,
        player.hp / player.maxHp,
        "#6fd28b"
      );

      drawLighting(
        c,
        level.theme,
        this.time
      );

      if (this.game.transition > 0) {
        c.fillStyle =
          `rgba(3,8,16,${this.game.transition})`;

        c.fillRect(
          0,
          0,
          AR.VIEW.width,
          AR.VIEW.height
        );
      }

      c.restore();
    }
  };

  function palette(theme) {
    const palettes = {
      forest: [
        "#7cc7ff",
        "#d9f1bd",
        "#315b47",
      ],

      ruins: [
        "#a9bfd1",
        "#e8d8b5",
        "#665846",
      ],

      crystal: [
        "#1a1731",
        "#38275b",
        "#7eeaff",
      ],

      frozen: [
        "#b9e6ff",
        "#f2fbff",
        "#6ca1b6",
      ],

      volcano: [
        "#3a1420",
        "#7d2d22",
        "#ff8848",
      ],

      sky: [
        "#8fd0ff",
        "#ecfbff",
        "#8fb0d8",
      ],

      jungle: [
        "#5eb48f",
        "#c7e79c",
        "#1f6046",
      ],

      citadel: [
        "#171326",
        "#31233f",
        "#8f4b72",
      ],
    };

    return (
      palettes[theme] || [
        "#7cc7ff",
        "#d9f1bd",
        "#315b47",
      ]
    );
  }

  function drawBackground(
    c,
    camera,
    level,
    time
  ) {
    const supportsForestAssets =
      level.theme === "forest" ||
      level.theme === "ruins";

    if (supportsForestAssets) {
      const sky =
        typeof AR.getImage === "function"
          ? AR.getImage("forestSky")
          : null;

      const far =
        typeof AR.getImage === "function"
          ? AR.getImage("forestFar")
          : null;

      const mid =
        typeof AR.getImage === "function"
          ? AR.getImage("forestMid")
          : null;

      const front =
        typeof AR.getImage === "function"
          ? AR.getImage("forestFront")
          : null;

      if (sky && far && mid && front) {
        drawParallaxBackground(
          c,
          camera,
          level,
          time,
          {
            sky,
            far,
            mid,
            front,
          }
        );

        return;
      }
    }

    drawOriginalBackground(
      c,
      camera,
      level,
      time
    );
  }

  function drawParallaxBackground(
    c,
    camera,
    level,
    time,
    layers
  ) {
    c.fillStyle = "#82c9ee";

    c.fillRect(
      0,
      0,
      AR.VIEW.width,
      AR.VIEW.height
    );

    drawParallaxLayer(
      c,
      layers.sky,
      camera.x,
      0.01,
      0,
      AR.VIEW.height,
      1.04
    );

    drawParallaxLayer(
      c,
      layers.far,
      camera.x,
      0.07,
      0,
      AR.VIEW.height,
      1.04
    );

    drawParallaxLayer(
      c,
      layers.mid,
      camera.x,
      0.18,
      0,
      AR.VIEW.height,
      1.04
    );

    drawParallaxLayer(
      c,
      layers.front,
      camera.x,
      0.34,
      0,
      AR.VIEW.height,
      1.04
    );

    drawAtmosphere(
      c,
      level.theme,
      time
    );

    drawBackgroundDepthOverlay(
      c,
      level.theme
    );
  }

  function drawParallaxLayer(
    c,
    image,
    cameraX,
    speed,
    y,
    targetHeight,
    heightMultiplier = 1
  ) {
    if (
      !image ||
      !image.complete ||
      image.naturalWidth === 0 ||
      image.naturalHeight === 0
    ) {
      return;
    }

    const drawHeight =
      targetHeight * heightMultiplier;

    const scale =
      drawHeight / image.naturalHeight;

    const drawWidth =
      image.naturalWidth * scale;

    if (
      !Number.isFinite(drawWidth) ||
      drawWidth <= 0
    ) {
      return;
    }

    let offset =
      -(cameraX * speed) % drawWidth;

    if (offset > 0) {
      offset -= drawWidth;
    }

    for (
      let x = offset;
      x < AR.VIEW.width + drawWidth;
      x += drawWidth
    ) {
      c.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );
    }
  }

  function drawAtmosphere(
    c,
    theme,
    time
  ) {
    if (
      theme !== "forest" &&
      theme !== "ruins"
    ) {
      return;
    }

    c.save();

    c.fillStyle =
      "rgba(255, 238, 170, 0.5)";

    for (let i = 0; i < 24; i++) {
      const x =
        (
          i * 113 +
          time * (8 + (i % 3) * 3)
        ) %
        (AR.VIEW.width + 40);

      const baseY =
        80 +
        ((i * 67) %
          (AR.VIEW.height - 170));

      const y =
        baseY +
        Math.sin(
          time * 1.7 + i * 1.6
        ) *
          10;

      const radius =
        1.2 + (i % 3) * 0.5;

      c.globalAlpha =
        0.22 +
        (Math.sin(time * 2 + i) + 1) *
          0.12;

      c.beginPath();

      c.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
      );

      c.fill();
    }

    c.restore();

    drawLightRays(c, time);
  }

  function drawLightRays(c, time) {
    c.save();

    c.globalCompositeOperation = "screen";

    const rayGradient =
      c.createLinearGradient(
        0,
        0,
        0,
        AR.VIEW.height
      );

    rayGradient.addColorStop(
      0,
      "rgba(255,245,190,0.16)"
    );

    rayGradient.addColorStop(
      0.55,
      "rgba(255,235,160,0.05)"
    );

    rayGradient.addColorStop(
      1,
      "rgba(255,230,150,0)"
    );

    c.fillStyle = rayGradient;

    const drift =
      Math.sin(time * 0.2) * 30;

    c.beginPath();

    c.moveTo(
      190 + drift,
      0
    );

    c.lineTo(
      380 + drift,
      0
    );

    c.lineTo(
      610 + drift,
      AR.VIEW.height
    );

    c.lineTo(
      350 + drift,
      AR.VIEW.height
    );

    c.closePath();
    c.fill();

    c.beginPath();

    c.moveTo(
      820 - drift,
      0
    );

    c.lineTo(
      930 - drift,
      0
    );

    c.lineTo(
      1100 - drift,
      AR.VIEW.height
    );

    c.lineTo(
      900 - drift,
      AR.VIEW.height
    );

    c.closePath();
    c.fill();

    c.restore();
  }

  function drawBackgroundDepthOverlay(
    c,
    theme
  ) {
    const gradient =
      c.createLinearGradient(
        0,
        0,
        0,
        AR.VIEW.height
      );

    gradient.addColorStop(
      0,
      "rgba(9, 31, 41, 0.02)"
    );

    gradient.addColorStop(
      0.58,
      "rgba(15, 37, 30, 0.02)"
    );

    gradient.addColorStop(
      1,
      theme === "ruins"
        ? "rgba(18, 20, 16, 0.2)"
        : "rgba(9, 25, 17, 0.16)"
    );

    c.fillStyle = gradient;

    c.fillRect(
      0,
      0,
      AR.VIEW.width,
      AR.VIEW.height
    );
  }

  function drawOriginalBackground(
    c,
    camera,
    level,
    time
  ) {
    const colors =
      palette(level.theme);

    const gradient =
      c.createLinearGradient(
        0,
        0,
        0,
        AR.VIEW.height
      );

    gradient.addColorStop(
      0,
      colors[0]
    );

    gradient.addColorStop(
      1,
      colors[1]
    );

    c.fillStyle = gradient;

    c.fillRect(
      0,
      0,
      AR.VIEW.width,
      AR.VIEW.height
    );

    c.fillStyle =
      level.theme === "volcano"
        ? "rgba(45,12,12,.58)"
        : "rgba(47,74,102,.34)";

    for (
      let x =
        -((camera.x * 0.14) % 420);
      x < AR.VIEW.width + 420;
      x += 420
    ) {
      c.beginPath();

      c.moveTo(
        x,
        540
      );

      c.lineTo(
        x + 185,
        210
      );

      c.lineTo(
        x + 420,
        540
      );

      c.fill();
    }

    c.fillStyle =
      level.theme === "citadel"
        ? "rgba(20,15,30,.55)"
        : "rgba(28,86,61,.35)";

    for (
      let x =
        -((camera.x * 0.32) % 180);
      x < AR.VIEW.width + 180;
      x += 180
    ) {
      drawTree(
        c,
        x + 20,
        525,
        colors[2]
      );
    }

    c.fillStyle =
      "rgba(255,255,255,.48)";

    for (
      let x =
        -(
          (
            camera.x * 0.22 +
            time * 18
          ) %
          360
        );
      x < AR.VIEW.width + 360;
      x += 360
    ) {
      drawCloud(
        c,
        x,
        95 +
          Math.sin(time + x) * 12
      );
    }

    if (
      level.theme === "jungle" ||
      level.theme === "forest"
    ) {
      drawLeaves(
        c,
        time
      );
    }

    if (level.theme === "frozen") {
      drawSnow(
        c,
        time
      );
    }

    if (level.theme === "crystal") {
      drawFog(
        c,
        "rgba(112,230,255,.14)"
      );
    } else {
      drawFog(
        c,
        "rgba(255,255,255,.12)"
      );
    }
  }

  function drawTree(
    c,
    x,
    y,
    color
  ) {
    c.fillStyle = "#3b2b21";

    c.fillRect(
      x + 25,
      y - 75,
      18,
      75
    );

    c.fillStyle = color;
    c.beginPath();

    c.ellipse(
      x + 34,
      y - 85,
      54,
      70,
      0,
      0,
      Math.PI * 2
    );

    c.fill();
  }

  function drawCloud(c, x, y) {
    c.beginPath();

    c.ellipse(
      x,
      y,
      46,
      18,
      0,
      0,
      Math.PI * 2
    );

    c.ellipse(
      x + 38,
      y + 4,
      54,
      21,
      0,
      0,
      Math.PI * 2
    );

    c.ellipse(
      x + 83,
      y,
      36,
      17,
      0,
      0,
      Math.PI * 2
    );

    c.fill();
  }

  function drawLeaves(c, time) {
    c.fillStyle =
      "rgba(255,220,90,.35)";

    for (let i = 0; i < 28; i++) {
      const x =
        (
          i * 93 +
          time * 60
        ) %
        AR.VIEW.width;

      const y =
        120 +
        ((i * 47) % 420);

      c.beginPath();

      c.ellipse(
        x,
        y +
          Math.sin(
            time * 2 + i
          ) *
            12,
        4,
        9,
        0.7,
        0,
        Math.PI * 2
      );

      c.fill();
    }
  }

  function drawSnow(c, time) {
    c.fillStyle =
      "rgba(255,255,255,.7)";

    for (let i = 0; i < 50; i++) {
      c.fillRect(
        (
          i * 57 +
          time * 35
        ) %
          AR.VIEW.width,
        (
          i * 91 +
          time * 60
        ) %
          AR.VIEW.height,
        2,
        2
      );
    }
  }

  function drawFog(c, color) {
    c.fillStyle = color;

    c.fillRect(
      0,
      455,
      AR.VIEW.width,
      120
    );

    c.fillStyle = color;

    c.fillRect(
      0,
      560,
      AR.VIEW.width,
      160
    );
  }

  function drawPlatform(
    c,
    platform,
    time
  ) {
    if (platform.disabled) {
      return;
    }

    const colors = {
      ground: "#3f7b4b",
      ruin: "#98917b",
      wood: "#8a5f3b",
      moving: "#4c9ead",
      falling: "#767083",
      bridge: "#8b653e",
      ice: "#93cee1",
    };

    c.fillStyle =
      colors[platform.type] ||
      "#7c7567";

    c.fillRect(
      platform.x,
      platform.y,
      platform.w,
      platform.h
    );

    c.fillStyle =
      "rgba(255,255,255,.18)";

    c.fillRect(
      platform.x,
      platform.y,
      platform.w,
      6
    );

    if (
      platform.type === "ground" ||
      platform.type === "ice"
    ) {
      c.fillStyle =
        platform.type === "ice"
          ? "#d8f6ff"
          : "#664a32";

      c.fillRect(
        platform.x,
        platform.y + 22,
        platform.w,
        platform.h - 22
      );
    }

    if (platform.type === "bridge") {
      c.strokeStyle =
        "rgba(40,20,10,.45)";

      for (
        let x = platform.x;
        x < platform.x + platform.w;
        x += 34
      ) {
        c.beginPath();

        c.moveTo(
          x,
          platform.y
        );

        c.lineTo(
          x,
          platform.y + platform.h
        );

        c.stroke();
      }
    }

    if (
      platform.falling &&
      platform.falling.armed
    ) {
      c.strokeStyle = "#ffe08a";
      c.lineWidth = 3;
      c.beginPath();

      c.moveTo(
        platform.x + 15,
        platform.y + 6
      );

      c.lineTo(
        platform.x + 55,
        platform.y +
          platform.h -
          5
      );

      c.stroke();
    }
  }

  function drawBlock(c, block) {
    c.fillStyle = "#87808e";

    c.fillRect(
      block.x,
      block.y,
      block.w,
      block.h
    );

    c.strokeStyle = "#ded4e8";

    c.strokeRect(
      block.x + 4,
      block.y + 4,
      block.w - 8,
      block.h - 8
    );

    c.strokeStyle = "#494452";
    c.beginPath();

    c.moveTo(
      block.x + 9,
      block.y + 13
    );

    c.lineTo(
      block.x + 40,
      block.y + 36
    );

    c.stroke();
  }

  function drawHazard(
    c,
    hazard,
    time
  ) {
    if (hazard.kind === "spikes") {
      drawSpikes(c, hazard);
    } else if (
      hazard.kind === "blade"
    ) {
      drawBlade(
        c,
        hazard,
        time
      );
    } else if (
      hazard.kind === "log"
    ) {
      drawLog(
        c,
        hazard,
        time
      );
    } else if (
      hazard.kind === "lava"
    ) {
      drawLava(
        c,
        hazard,
        time
      );
    } else if (
      hazard.kind === "boulder"
    ) {
      drawBoulder(
        c,
        hazard,
        time
      );
    } else if (
      hazard.kind === "wind"
    ) {
      drawZone(
        c,
        hazard,
        "rgba(180,230,255,.16)"
      );
    } else if (
      hazard.kind === "waterfall"
    ) {
      drawWaterfall(
        c,
        hazard,
        time
      );
    }
  }

  function drawSpikes(c, hazard) {
    c.fillStyle = "#2f3038";

    c.fillRect(
      hazard.x,
      hazard.y +
        hazard.h -
        6,
      hazard.w,
      6
    );

    c.fillStyle = "#d9d7e6";

    for (
      let x = hazard.x;
      x < hazard.x + hazard.w;
      x += 18
    ) {
      c.beginPath();

      c.moveTo(
        x,
        hazard.y + hazard.h
      );

      c.lineTo(
        x + 9,
        hazard.y
      );

      c.lineTo(
        x + 18,
        hazard.y + hazard.h
      );

      c.fill();
    }
  }

  function drawBlade(
    c,
    hazard,
    time
  ) {
    c.save();

    c.translate(
      hazard.x + hazard.w / 2,
      hazard.y + hazard.h / 2
    );

    c.rotate(
      time * hazard.speed
    );

    c.fillStyle = "#dce2ea";

    for (let i = 0; i < 4; i++) {
      c.rotate(Math.PI / 2);
      c.beginPath();

      c.moveTo(0, 0);
      c.lineTo(11, -42);
      c.lineTo(-11, -42);

      c.fill();
    }

    c.fillStyle = "#4a4d56";
    c.beginPath();

    c.arc(
      0,
      0,
      12,
      0,
      Math.PI * 2
    );

    c.fill();
    c.restore();
  }

  function drawLog(
    c,
    hazard,
    time
  ) {
    const angle =
      Math.sin(
        time * hazard.speed
      ) *
      0.65;

    c.save();

    c.translate(
      hazard.pivotX,
      hazard.pivotY
    );

    c.strokeStyle = "#2c211a";
    c.lineWidth = 3;
    c.beginPath();

    c.moveTo(0, 0);

    c.lineTo(
      Math.sin(angle) *
        hazard.length,
      Math.cos(angle) *
        hazard.length
    );

    c.stroke();

    c.translate(
      Math.sin(angle) *
        hazard.length,
      Math.cos(angle) *
        hazard.length
    );

    c.rotate(-angle);

    c.fillStyle = "#7b4c2f";

    c.fillRect(
      -70,
      -14,
      140,
      28
    );

    c.restore();
  }

  function drawLava(
    c,
    hazard,
    time
  ) {
    const gradient =
      c.createLinearGradient(
        0,
        hazard.y,
        0,
        hazard.y + hazard.h
      );

    gradient.addColorStop(
      0,
      "#ffcc58"
    );

    gradient.addColorStop(
      0.45,
      "#ff5f2f"
    );

    gradient.addColorStop(
      1,
      "#5b1512"
    );

    c.fillStyle = gradient;

    c.fillRect(
      hazard.x,
      hazard.y,
      hazard.w,
      hazard.h
    );

    c.fillStyle =
      "rgba(255,230,90,.7)";

    for (
      let x = hazard.x;
      x < hazard.x + hazard.w;
      x += 32
    ) {
      c.fillRect(
        x,
        hazard.y +
          8 +
          Math.sin(
            time * 5 + x
          ) *
            5,
        18,
        4
      );
    }
  }

  function drawBoulder(
    c,
    hazard,
    time
  ) {
    c.save();

    c.translate(
      hazard.x + hazard.w / 2,
      hazard.y + hazard.h / 2
    );

    c.rotate(time * 2);

    c.fillStyle = "#5c5551";
    c.beginPath();

    c.arc(
      0,
      0,
      hazard.w / 2,
      0,
      Math.PI * 2
    );

    c.fill();

    c.strokeStyle = "#332f2c";

    c.strokeRect(
      -14,
      -14,
      28,
      28
    );

    c.restore();
  }

  function drawZone(
    c,
    hazard,
    color
  ) {
    c.fillStyle = color;

    c.fillRect(
      hazard.x,
      hazard.y,
      hazard.w,
      hazard.h
    );

    c.strokeStyle =
      "rgba(255,255,255,.25)";

    for (
      let y = hazard.y + 25;
      y < hazard.y + hazard.h;
      y += 42
    ) {
      c.beginPath();

      c.moveTo(
        hazard.x + 20,
        y
      );

      c.lineTo(
        hazard.x +
          hazard.w -
          20,
        y - 12
      );

      c.stroke();
    }
  }

  function drawWaterfall(
    c,
    hazard,
    time
  ) {
    c.fillStyle =
      "rgba(115,210,255,.4)";

    c.fillRect(
      hazard.x,
      hazard.y,
      hazard.w,
      hazard.h
    );

    c.fillStyle =
      "rgba(255,255,255,.55)";

    for (let i = 0; i < 6; i++) {
      c.fillRect(
        hazard.x + i * 14,
        hazard.y +
          (
            time * 180 +
            i * 55
          ) %
            hazard.h,
        5,
        80
      );
    }
  }

  function drawPad(
    c,
    pad,
    time
  ) {
    c.fillStyle = "#65d984";

    c.fillRect(
      pad.x,
      pad.y,
      pad.w,
      pad.h
    );

    c.fillStyle = "#fff08a";

    c.fillRect(
      pad.x + 6,
      pad.y +
        3 +
        Math.sin(time * 8),
      pad.w - 12,
      5
    );
  }

  function drawGate(c, gate) {
    if (gate.open) {
      return;
    }

    c.fillStyle = "#51406c";

    c.fillRect(
      gate.x,
      gate.y,
      gate.w,
      gate.h
    );

    c.fillStyle = "#f3ca5e";
    c.beginPath();

    c.arc(
      gate.x + gate.w / 2,
      gate.y + 58,
      9,
      0,
      Math.PI * 2
    );

    c.fill();
  }

  function drawKey(
    c,
    key,
    time
  ) {
    c.strokeStyle = "#ffe070";
    c.lineWidth = 5;
    c.beginPath();

    c.arc(
      key.x + 9,
      key.y +
        10 +
        Math.sin(time * 5) * 3,
      8,
      0,
      Math.PI * 2
    );

    c.moveTo(
      key.x + 17,
      key.y + 10
    );

    c.lineTo(
      key.x + 34,
      key.y + 10
    );

    c.lineTo(
      key.x + 34,
      key.y + 19
    );

    c.stroke();
  }

  function drawStar(
    c,
    powerup,
    time
  ) {
    c.save();

    c.translate(
      powerup.x + powerup.w / 2,
      powerup.y + powerup.h / 2
    );

    c.rotate(time * 1.4);

    const outerRadius =
      21 +
      Math.sin(time * 7) * 2;

    const innerRadius = 9;

    c.shadowColor = "#fff29a";
    c.shadowBlur = 25;
    c.fillStyle = "#ffe76d";
    c.beginPath();

    for (let i = 0; i < 10; i++) {
      const angle =
        -Math.PI / 2 +
        i * Math.PI / 5;

      const radius =
        i % 2
          ? innerRadius
          : outerRadius;

      c.lineTo(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    }

    c.closePath();
    c.fill();
    c.restore();
  }

  function drawCheckpoint(
    c,
    checkpoint,
    time
  ) {
    c.strokeStyle =
      checkpoint.active
        ? "#82f09b"
        : "#fff0a0";

    c.lineWidth = 4;
    c.beginPath();

    c.moveTo(
      checkpoint.x,
      checkpoint.y + 90
    );

    c.lineTo(
      checkpoint.x,
      checkpoint.y
    );

    c.stroke();

    c.fillStyle =
      checkpoint.active
        ? "#82f09b"
        : "#e5a64a";

    c.beginPath();

    c.moveTo(
      checkpoint.x,
      checkpoint.y
    );

    c.lineTo(
      checkpoint.x + 40,
      checkpoint.y +
        14 +
        Math.sin(time * 5) * 3
    );

    c.lineTo(
      checkpoint.x,
      checkpoint.y + 30
    );

    c.fill();

    if (checkpoint.t) {
      checkpoint.t = Math.max(
        0,
        checkpoint.t - 0.016
      );
    }
  }

  function drawPortal(
    c,
    portal,
    time
  ) {
    const gradient =
      c.createRadialGradient(
        portal.x + portal.w / 2,
        portal.y + portal.h / 2,
        10,
        portal.x + portal.w / 2,
        portal.y + portal.h / 2,
        90
      );

    gradient.addColorStop(
      0,
      "#fff"
    );

    gradient.addColorStop(
      0.45,
      "#83f7ff"
    );

    gradient.addColorStop(
      1,
      "rgba(80,120,255,.12)"
    );

    c.fillStyle = gradient;
    c.beginPath();

    c.ellipse(
      portal.x + portal.w / 2,
      portal.y + portal.h / 2,
      portal.w / 2 +
        Math.sin(time * 4) * 4,
      portal.h / 2,
      0,
      0,
      Math.PI * 2
    );

    c.fill();
  }

  function drawSecretExit(
    c,
    exit,
    time
  ) {
    c.strokeStyle =
      "rgba(255,235,120,.55)";

    c.lineWidth = 4;

    c.strokeRect(
      exit.x,
      exit.y,
      exit.w,
      exit.h
    );
  }

  function drawTunnel(c, tunnel) {
    c.fillStyle =
      "rgba(20,14,24,.52)";

    c.fillRect(
      tunnel.x,
      tunnel.y,
      tunnel.w,
      tunnel.h
    );
  }

  function drawSecretRoom(
    c,
    room,
    player,
    time
  ) {
    const visible =
      player.activeAbility ===
        "treasure" ||
      AR.rectOverlap(
        player,
        room
      );

    c.fillStyle = visible
      ? "rgba(255,230,100,.12)"
      : "rgba(0,0,0,.18)";

    c.fillRect(
      room.x,
      room.y,
      room.w,
      room.h
    );
  }

  function drawSecretHints(
    c,
    level,
    player,
    time
  ) {
    if (
      player.activeAbility !==
      "treasure"
    ) {
      return;
    }

    c.fillStyle =
      "rgba(255,245,145,.85)";

    const areas = [
      ...level.secretRooms,
      ...(level.secretExit
        ? [level.secretExit]
        : []),
    ];

    areas.forEach((area) => {
      for (let i = 0; i < 8; i++) {
        c.fillRect(
          area.x +
            (
              i * 43 +
              time * 30
            ) %
              area.w,
          area.y +
            8 +
            ((i * 29) %
              Math.max(
                20,
                area.h - 20
              )),
          4,
          4
        );
      }
    });
  }

  function drawProjectile(
    c,
    projectile,
    camera
  ) {
    c.fillStyle =
      projectile.color ||
      "#9ff3ff";

    c.fillRect(
      projectile.x - camera.x,
      projectile.y,
      projectile.w,
      projectile.h
    );

    c.fillStyle = "#fff";

    c.fillRect(
      projectile.x -
        camera.x +
        8,
      projectile.y + 4,
      projectile.w - 16,
      4
    );
  }

  function drawParticle(
    c,
    particle,
    camera
  ) {
    const alpha = Math.max(
      0,
      particle.life
    );

    if (particle.kind === "hit") {
      c.fillStyle =
        `rgba(255,90,80,${alpha})`;
    } else if (
      particle.kind === "shield"
    ) {
      c.fillStyle =
        `rgba(190,210,255,${alpha})`;
    } else if (
      particle.kind === "spark"
    ) {
      c.fillStyle =
        `rgba(255,230,90,${alpha})`;
    } else {
      c.fillStyle =
        `rgba(190,150,100,${alpha})`;
    }

    c.fillRect(
      particle.x - camera.x,
      particle.y,
      4,
      4
    );
  }

  function drawHpBar(
    c,
    x,
    y,
    width,
    ratio,
    color
  ) {
    c.fillStyle =
      "rgba(0,0,0,.45)";

    c.fillRect(
      x,
      y,
      width,
      6
    );

    c.fillStyle = color;

    c.fillRect(
      x,
      y,
      width *
        Math.max(0, ratio),
      6
    );
  }

  function drawLighting(
    c,
    theme,
    time
  ) {
    const gradient =
      c.createRadialGradient(
        640,
        260,
        80,
        640,
        260,
        760
      );

    gradient.addColorStop(
      0,
      "rgba(255,245,210,.08)"
    );

    gradient.addColorStop(
      1,
      theme === "citadel"
        ? "rgba(5,0,12,.5)"
        : "rgba(0,0,0,.16)"
    );

    c.fillStyle = gradient;

    c.fillRect(
      0,
      0,
      AR.VIEW.width,
      AR.VIEW.height
    );
  }
})();
