(() => {
  "use strict";

  AR.RenderSystem = class {
    constructor(game) { this.game = game; }
    draw() {
      const { ctx: c, camera, level, player } = this.game;
      c.clearRect(0, 0, AR.VIEW.width, AR.VIEW.height);
      drawBackground(c, camera, level.theme);
      c.save(); c.translate(-camera.x, 0);
      level.platforms.forEach((p) => drawPlatform(c, p));
      level.blocks.forEach((b) => { if (!b.broken) drawBlock(c, b); });
      level.hazards.forEach((h) => drawSpikes(c, h));
      level.pads.forEach((p) => drawPad(c, p));
      level.gates.forEach((g) => drawGate(c, g));
      level.keys.forEach((k) => { if (!k.taken) drawKey(c, k); });
      level.powerups.forEach((p) => { if (!p.taken) drawPower(c, p); });
      level.checkpoints.forEach((cp) => drawCheckpoint(c, cp));
      drawPortal(c, level.portal);
      c.restore();
      level.gems.forEach((gem) => gem.draw(c, camera, player));
      level.enemies.forEach((enemy) => enemy.draw(c, camera));
      this.game.projectiles.forEach((p) => drawSpark(c, p, camera));
      player.draw(c, camera);
      drawHpBar(c, player.x - camera.x, player.y - 13, player.w, player.hp / player.maxHp, "#6fd28b");
    }
  };

  function drawBackground(c, camera, theme) {
    const sky = theme === "cave" ? ["#1a1731", "#25203b"] : theme === "sky" ? ["#8cc7ff", "#d8f4ff"] : ["#71b9e8", "#cfeea8"];
    const g = c.createLinearGradient(0, 0, 0, AR.VIEW.height); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); c.fillStyle = g; c.fillRect(0, 0, AR.VIEW.width, AR.VIEW.height);
    c.fillStyle = theme === "cave" ? "#30264d" : "rgba(57, 91, 121, .35)";
    for (let x = -((camera.x * .18) % 320); x < AR.VIEW.width + 320; x += 320) { c.beginPath(); c.moveTo(x, 530); c.lineTo(x + 150, 220); c.lineTo(x + 320, 530); c.fill(); }
    c.fillStyle = theme === "cave" ? "rgba(119, 213, 255, .18)" : "rgba(36, 98, 64, .38)";
    for (let x = -((camera.x * .38) % 170); x < AR.VIEW.width + 170; x += 170) c.fillRect(x + 20, 500, 38, 120);
    if (theme === "sky") { c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 5; for (let x = -((camera.x * .55) % 250); x < AR.VIEW.width + 250; x += 250) { c.beginPath(); c.arc(x + 120, 120, 44, 0, Math.PI * 2); c.stroke(); } }
  }
  function drawPlatform(c, p) {
    if (p.disabled) return;
    c.fillStyle = p.type === "wood" ? "#8c623f" : p.type === "moving" ? "#4e9ea7" : p.type === "falling" ? "#7a7485" : p.type === "ruin" ? "#9e9a86" : "#3e7a45";
    c.fillRect(p.x, p.y, p.w, p.h); c.fillStyle = "rgba(255,255,255,.16)"; c.fillRect(p.x, p.y, p.w, 6);
    if (p.type === "ground") { c.fillStyle = "#684b32"; c.fillRect(p.x, p.y + 22, p.w, p.h - 22); }
    if (p.falling && p.falling.armed) { c.strokeStyle = "#ffe08a"; c.lineWidth = 3; c.beginPath(); c.moveTo(p.x + 16, p.y + 6); c.lineTo(p.x + 48, p.y + p.h - 5); c.stroke(); }
  }
  function drawBlock(c, b) { c.fillStyle = "#8f8795"; c.fillRect(b.x, b.y, b.w, b.h); c.strokeStyle = "#ded4e8"; c.strokeRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8); c.strokeStyle = "#4d4655"; c.beginPath(); c.moveTo(b.x + 10, b.y + 12); c.lineTo(b.x + 39, b.y + 35); c.stroke(); }
  function drawSpikes(c, h) { c.fillStyle = "#3a3741"; c.fillRect(h.x, h.y + h.h - 6, h.w, 6); c.fillStyle = "#d9d7e6"; for (let x = h.x; x < h.x + h.w; x += 18) { c.beginPath(); c.moveTo(x, h.y + h.h); c.lineTo(x + 9, h.y); c.lineTo(x + 18, h.y + h.h); c.fill(); } }
  function drawPad(c, p) { c.fillStyle = "#7ad889"; c.fillRect(p.x, p.y, p.w, p.h); c.fillStyle = "#f8f08a"; c.fillRect(p.x + 6, p.y + 3, p.w - 12, 5); }
  function drawGate(c, g) { if (g.open) return; c.fillStyle = "#554071"; c.fillRect(g.x, g.y, g.w, g.h); c.fillStyle = "#f4c95d"; c.beginPath(); c.arc(g.x + g.w / 2, g.y + 56, 9, 0, Math.PI * 2); c.fill(); }
  function drawKey(c, k) { c.strokeStyle = "#ffe070"; c.lineWidth = 5; c.beginPath(); c.arc(k.x + 9, k.y + 10, 8, 0, Math.PI * 2); c.moveTo(k.x + 17, k.y + 10); c.lineTo(k.x + 32, k.y + 10); c.lineTo(k.x + 32, k.y + 19); c.stroke(); }
  function drawPower(c, p) { const cfg = AR.POWERS[p.type]; c.fillStyle = powerColor(p.type); c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h, 6); c.fill(); c.fillStyle = "#13202c"; c.font = "bold 12px sans-serif"; c.textAlign = "center"; c.fillText(cfg.icon, p.x + p.w / 2, p.y + 20); }
  function drawCheckpoint(c, cp) { c.strokeStyle = cp.active ? "#79e894" : "#fff0a0"; c.lineWidth = 4; c.beginPath(); c.moveTo(cp.x, cp.y + 90); c.lineTo(cp.x, cp.y); c.stroke(); c.fillStyle = cp.active ? "#79e894" : "#e6a34a"; c.beginPath(); c.moveTo(cp.x, cp.y); c.lineTo(cp.x + 38, cp.y + 12); c.lineTo(cp.x, cp.y + 28); c.fill(); }
  function drawPortal(c, p) { const g = c.createRadialGradient(p.x + p.w / 2, p.y + p.h / 2, 10, p.x + p.w / 2, p.y + p.h / 2, 80); g.addColorStop(0, "#ffffff"); g.addColorStop(.45, "#83f7ff"); g.addColorStop(1, "rgba(80,120,255,.15)"); c.fillStyle = g; c.beginPath(); c.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, p.h / 2, 0, 0, Math.PI * 2); c.fill(); }
  function drawSpark(c, p, camera) { c.fillStyle = "#9ff3ff"; c.fillRect(p.x - camera.x, p.y, p.w, p.h); c.fillStyle = "#fff"; c.fillRect(p.x - camera.x + 8, p.y + 4, p.w - 16, 4); }
  function drawHpBar(c, x, y, w, ratio, color) { c.fillStyle = "rgba(0,0,0,.45)"; c.fillRect(x, y, w, 6); c.fillStyle = color; c.fillRect(x, y, w * Math.max(0, ratio), 6); }
  function powerColor(type) { return ({ charge: "#f08b54", feather: "#d9f5ff", shield: "#8af0b3", spark: "#8beeff", giant: "#f4d55d", slow: "#b7a4ff" })[type] || "#fff"; }
})();