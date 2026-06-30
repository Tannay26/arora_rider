(() => {
  "use strict";

  AR.RenderSystem = class {
    constructor(game) {
      this.game = game;
    }
    draw() {
      const { ctx: c, level, camera } = this.game;
      drawBackground(c, camera);
      drawPlatforms(c, level, camera);
      level.gems.forEach((gem) => gem.draw(c, camera));
      level.enemies.forEach((enemy) => enemy.draw(c, camera));
      drawFinishGate(c, level.finishGate, camera);
      this.game.player.draw(c, camera);
    }
  };

  function drawBackground(c, camera) {
    const sky = c.createLinearGradient(0, 0, 0, AR.VIEW.height);
    sky.addColorStop(0, "#5368bf");
    sky.addColorStop(0.45, "#c893b5");
    sky.addColorStop(1, "#f1d49a");
    c.fillStyle = sky;
    c.fillRect(0, 0, AR.VIEW.width, AR.VIEW.height);
    drawMountains(c, camera.x * 0.18, 430, "#4d5684", 0.75);
    drawMountains(c, camera.x * 0.35, 510, "#2e4a45", 0.55);
    drawTrees(c, camera.x * 0.55);
  }

  function drawMountains(c, offset, baseY, color, scale) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(-offset % 260 - 260, baseY);
    for (let x = -offset % 260 - 260; x < AR.VIEW.width + 300; x += 260) {
      c.lineTo(x + 120, baseY - 210 * scale);
      c.lineTo(x + 260, baseY);
    }
    c.lineTo(AR.VIEW.width, AR.VIEW.height);
    c.lineTo(0, AR.VIEW.height);
    c.fill();
  }

  function drawTrees(c, offset) {
    for (let x = -offset % 70 - 70; x < AR.VIEW.width + 100; x += 70) {
      c.fillStyle = "#233d35";
      c.beginPath();
      c.moveTo(x, 585);
      c.lineTo(x + 32, 430 - (x % 3) * 18);
      c.lineTo(x + 68, 585);
      c.fill();
      c.fillStyle = "#3c2b22";
      c.fillRect(x + 30, 560, 8, 70);
    }
  }

  function drawPlatforms(c, level, camera) {
    level.platforms.forEach((p) => {
      const x = p.x - camera.x;
      if (x + p.w < -80 || x > AR.VIEW.width + 80) return;
      c.fillStyle = p.type === "wood" ? "#8d5f3a" : "#6d5a4c";
      c.fillRect(x, p.y, p.w, p.h);
      c.fillStyle = p.type === "wood" ? "#b9814f" : "#4d6f3d";
      c.fillRect(x, p.y, p.w, 14);
      c.fillStyle = "rgba(255,255,255,.12)";
      for (let i = 18; i < p.w; i += 54) c.fillRect(x + i, p.y + 18, 28, 5);
      if (p.type === "ground") {
        c.fillStyle = "#2e542f";
        for (let i = 10; i < p.w; i += 38) c.fillRect(x + i, p.y - 10, 4, 14);
      }
    });
  }

  function drawFinishGate(c, gate, camera) {
    const x = gate.x - camera.x;
    c.fillStyle = "#3d2d55";
    c.fillRect(x, gate.y, 18, gate.h);
    c.fillRect(x + gate.w - 18, gate.y, 18, gate.h);
    c.fillStyle = "#f0bb59";
    c.fillRect(x, gate.y, gate.w, 18);
    c.fillStyle = "rgba(143,244,255,.55)";
    c.fillRect(x + 20, gate.y + 20, gate.w - 40, gate.h - 20);
  }
})();
