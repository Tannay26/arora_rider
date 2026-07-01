(() => {
  "use strict";

  AR.RenderSystem = class {
    constructor(game) { this.game = game; this.time = 0; }
    draw() {
      const { ctx: c, camera, level, player } = this.game; this.time += 1 / 60;
      c.clearRect(0, 0, AR.VIEW.width, AR.VIEW.height);
      const shakeX = this.game.cameraShake ? AR.rand(-this.game.cameraShake, this.game.cameraShake) : 0;
      const shakeY = this.game.cameraShake ? AR.rand(-this.game.cameraShake, this.game.cameraShake) : 0;
      c.save(); c.translate(shakeX, shakeY);
      drawBackground(c, camera, level, this.time);
      c.save(); c.translate(-camera.x, 0);
      drawSecretHints(c, level, player, this.time);
      level.tunnels.forEach((t) => drawTunnel(c, t));
      level.secretRooms.forEach((r) => drawSecretRoom(c, r, player, this.time));
      level.platforms.forEach((p) => drawPlatform(c, p, this.time));
      level.blocks.forEach((b) => { if (!b.broken) drawBlock(c, b); });
      level.hazards.forEach((h) => drawHazard(c, h, this.time));
      level.pads.forEach((p) => drawPad(c, p, this.time));
      level.gates.forEach((g) => drawGate(c, g));
      level.keys.forEach((k) => { if (!k.taken) drawKey(c, k, this.time); });
      level.powerups.forEach((p) => { if (!p.taken) drawStar(c, p, this.time); });
      level.checkpoints.forEach((cp) => drawCheckpoint(c, cp, this.time));
      if (level.secretExit) drawSecretExit(c, level.secretExit, this.time);
      drawPortal(c, level.portal, this.time);
      c.restore();
      level.gems.forEach((gem) => gem.draw(c, camera, player));
      level.enemies.forEach((enemy) => enemy.draw(c, camera));
      this.game.projectiles.forEach((p) => drawProjectile(c, p, camera));
      this.game.particles.forEach((p) => drawParticle(c, p, camera));
      player.draw(c, camera);
      drawHpBar(c, player.x - camera.x, player.y - 13, player.w, player.hp / player.maxHp, "#6fd28b");
      drawLighting(c, level.theme, this.time);
      if (this.game.transition > 0) { c.fillStyle = `rgba(3,8,16,${this.game.transition})`; c.fillRect(0, 0, AR.VIEW.width, AR.VIEW.height); }
      c.restore();
    }
  };

  function palette(theme) {
    return {
      forest: ["#7cc7ff", "#d9f1bd", "#315b47"], ruins: ["#a9bfd1", "#e8d8b5", "#665846"], crystal: ["#1a1731", "#38275b", "#7eeaff"], frozen: ["#b9e6ff", "#f2fbff", "#6ca1b6"], volcano: ["#3a1420", "#7d2d22", "#ff8848"], sky: ["#8fd0ff", "#ecfbff", "#8fb0d8"], jungle: ["#5eb48f", "#c7e79c", "#1f6046"], citadel: ["#171326", "#31233f", "#8f4b72"],
    }[theme] || ["#7cc7ff", "#d9f1bd", "#315b47"];
  }
  function drawBackground(c, camera, level, t) {
    const p = palette(level.theme), g = c.createLinearGradient(0, 0, 0, AR.VIEW.height); g.addColorStop(0, p[0]); g.addColorStop(1, p[1]); c.fillStyle = g; c.fillRect(0, 0, AR.VIEW.width, AR.VIEW.height);
    c.fillStyle = level.theme === "volcano" ? "rgba(45,12,12,.58)" : "rgba(47,74,102,.34)";
    for (let x = -((camera.x * .14) % 420); x < AR.VIEW.width + 420; x += 420) { c.beginPath(); c.moveTo(x, 540); c.lineTo(x + 185, 210); c.lineTo(x + 420, 540); c.fill(); }
    c.fillStyle = level.theme === "citadel" ? "rgba(20,15,30,.55)" : "rgba(28,86,61,.35)";
    for (let x = -((camera.x * .32) % 180); x < AR.VIEW.width + 180; x += 180) drawTree(c, x + 20, 525, p[2]);
    c.fillStyle = "rgba(255,255,255,.48)";
    for (let x = -((camera.x * .22 + t * 18) % 360); x < AR.VIEW.width + 360; x += 360) drawCloud(c, x, 95 + Math.sin(t + x) * 12);
    if (["jungle", "forest"].includes(level.theme)) drawLeaves(c, t);
    if (level.theme === "frozen") drawSnow(c, t);
    if (level.theme === "crystal") drawFog(c, "rgba(112,230,255,.14)"); else drawFog(c, "rgba(255,255,255,.12)");
  }
  function drawTree(c, x, y, color) { c.fillStyle = "#3b2b21"; c.fillRect(x + 25, y - 75, 18, 75); c.fillStyle = color; c.beginPath(); c.ellipse(x + 34, y - 85, 54, 70, 0, 0, Math.PI * 2); c.fill(); }
  function drawCloud(c, x, y) { c.beginPath(); c.ellipse(x, y, 46, 18, 0, 0, Math.PI * 2); c.ellipse(x + 38, y + 4, 54, 21, 0, 0, Math.PI * 2); c.ellipse(x + 83, y, 36, 17, 0, 0, Math.PI * 2); c.fill(); }
  function drawLeaves(c, t) { c.fillStyle = "rgba(255,220,90,.35)"; for (let i = 0; i < 28; i++) { const x = (i * 93 + t * 60) % AR.VIEW.width, y = 120 + (i * 47) % 420; c.beginPath(); c.ellipse(x, y + Math.sin(t * 2 + i) * 12, 4, 9, .7, 0, Math.PI * 2); c.fill(); } }
  function drawSnow(c, t) { c.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 50; i++) c.fillRect((i * 57 + t * 35) % AR.VIEW.width, (i * 91 + t * 60) % AR.VIEW.height, 2, 2); }
  function drawFog(c, color) { c.fillStyle = color; c.fillRect(0, 455, AR.VIEW.width, 120); c.fillStyle = color; c.fillRect(0, 560, AR.VIEW.width, 160); }
  function drawPlatform(c, p, t) {
    if (p.disabled) return;
    const colors = { ground: "#3f7b4b", ruin: "#98917b", wood: "#8a5f3b", moving: "#4c9ead", falling: "#767083", bridge: "#8b653e", ice: "#93cee1" };
    c.fillStyle = colors[p.type] || "#7c7567"; c.fillRect(p.x, p.y, p.w, p.h); c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(p.x, p.y, p.w, 6);
    if (p.type === "ground" || p.type === "ice") { c.fillStyle = p.type === "ice" ? "#d8f6ff" : "#664a32"; c.fillRect(p.x, p.y + 22, p.w, p.h - 22); }
    if (p.type === "bridge") { c.strokeStyle = "rgba(40,20,10,.45)"; for (let x = p.x; x < p.x + p.w; x += 34) { c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); } }
    if (p.falling && p.falling.armed) { c.strokeStyle = "#ffe08a"; c.lineWidth = 3; c.beginPath(); c.moveTo(p.x + 15, p.y + 6); c.lineTo(p.x + 55, p.y + p.h - 5); c.stroke(); }
  }
  function drawBlock(c, b) { c.fillStyle = "#87808e"; c.fillRect(b.x, b.y, b.w, b.h); c.strokeStyle = "#ded4e8"; c.strokeRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8); c.strokeStyle = "#494452"; c.beginPath(); c.moveTo(b.x + 9, b.y + 13); c.lineTo(b.x + 40, b.y + 36); c.stroke(); }
  function drawHazard(c, h, t) { if (h.kind === "spikes") drawSpikes(c, h); else if (h.kind === "blade") drawBlade(c, h, t); else if (h.kind === "log") drawLog(c, h, t); else if (h.kind === "lava") drawLava(c, h, t); else if (h.kind === "boulder") drawBoulder(c, h, t); else if (h.kind === "wind") drawZone(c, h, "rgba(180,230,255,.16)"); else if (h.kind === "waterfall") drawWaterfall(c, h, t); }
  function drawSpikes(c, h) { c.fillStyle = "#2f3038"; c.fillRect(h.x, h.y + h.h - 6, h.w, 6); c.fillStyle = "#d9d7e6"; for (let x = h.x; x < h.x + h.w; x += 18) { c.beginPath(); c.moveTo(x, h.y + h.h); c.lineTo(x + 9, h.y); c.lineTo(x + 18, h.y + h.h); c.fill(); } }
  function drawBlade(c, h, t) { c.save(); c.translate(h.x + h.w / 2, h.y + h.h / 2); c.rotate(t * h.speed); c.fillStyle = "#dce2ea"; for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(11, -42); c.lineTo(-11, -42); c.fill(); } c.fillStyle = "#4a4d56"; c.beginPath(); c.arc(0, 0, 12, 0, Math.PI * 2); c.fill(); c.restore(); }
  function drawLog(c, h, t) { const a = Math.sin(t * h.speed) * .65; c.save(); c.translate(h.pivotX, h.pivotY); c.strokeStyle = "#2c211a"; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(a) * h.length, Math.cos(a) * h.length); c.stroke(); c.translate(Math.sin(a) * h.length, Math.cos(a) * h.length); c.rotate(-a); c.fillStyle = "#7b4c2f"; c.fillRect(-70, -14, 140, 28); c.restore(); }
  function drawLava(c, h, t) { const g = c.createLinearGradient(0, h.y, 0, h.y + h.h); g.addColorStop(0, "#ffcc58"); g.addColorStop(.45, "#ff5f2f"); g.addColorStop(1, "#5b1512"); c.fillStyle = g; c.fillRect(h.x, h.y, h.w, h.h); c.fillStyle = "rgba(255,230,90,.7)"; for (let x = h.x; x < h.x + h.w; x += 32) c.fillRect(x, h.y + 8 + Math.sin(t * 5 + x) * 5, 18, 4); }
  function drawBoulder(c, h, t) { c.save(); c.translate(h.x + h.w / 2, h.y + h.h / 2); c.rotate(t * 2); c.fillStyle = "#5c5551"; c.beginPath(); c.arc(0, 0, h.w / 2, 0, Math.PI * 2); c.fill(); c.strokeStyle = "#332f2c"; c.strokeRect(-14, -14, 28, 28); c.restore(); }
  function drawZone(c, h, color) { c.fillStyle = color; c.fillRect(h.x, h.y, h.w, h.h); c.strokeStyle = "rgba(255,255,255,.25)"; for (let y = h.y + 25; y < h.y + h.h; y += 42) { c.beginPath(); c.moveTo(h.x + 20, y); c.lineTo(h.x + h.w - 20, y - 12); c.stroke(); } }
  function drawWaterfall(c, h, t) { c.fillStyle = "rgba(115,210,255,.4)"; c.fillRect(h.x, h.y, h.w, h.h); c.fillStyle = "rgba(255,255,255,.55)"; for (let i = 0; i < 6; i++) c.fillRect(h.x + i * 14, h.y + ((t * 180 + i * 55) % h.h), 5, 80); }
  function drawPad(c, p, t) { c.fillStyle = "#65d984"; c.fillRect(p.x, p.y, p.w, p.h); c.fillStyle = "#fff08a"; c.fillRect(p.x + 6, p.y + 3 + Math.sin(t * 8) * 1, p.w - 12, 5); }
  function drawGate(c, g) { if (g.open) return; c.fillStyle = "#51406c"; c.fillRect(g.x, g.y, g.w, g.h); c.fillStyle = "#f3ca5e"; c.beginPath(); c.arc(g.x + g.w / 2, g.y + 58, 9, 0, Math.PI * 2); c.fill(); }
  function drawKey(c, k, t) { c.strokeStyle = "#ffe070"; c.lineWidth = 5; c.beginPath(); c.arc(k.x + 9, k.y + 10 + Math.sin(t * 5) * 3, 8, 0, Math.PI * 2); c.moveTo(k.x + 17, k.y + 10); c.lineTo(k.x + 34, k.y + 10); c.lineTo(k.x + 34, k.y + 19); c.stroke(); }
  function drawStar(c, p, t) { c.save(); c.translate(p.x + p.w / 2, p.y + p.h / 2); c.rotate(t * 1.4); const r1 = 21 + Math.sin(t * 7) * 2, r2 = 9; c.shadowColor = "#fff29a"; c.shadowBlur = 25; c.fillStyle = "#ffe76d"; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); }
  function drawCheckpoint(c, cp, t) { c.strokeStyle = cp.active ? "#82f09b" : "#fff0a0"; c.lineWidth = 4; c.beginPath(); c.moveTo(cp.x, cp.y + 90); c.lineTo(cp.x, cp.y); c.stroke(); c.fillStyle = cp.active ? "#82f09b" : "#e5a64a"; c.beginPath(); c.moveTo(cp.x, cp.y); c.lineTo(cp.x + 40, cp.y + 14 + Math.sin(t * 5) * 3); c.lineTo(cp.x, cp.y + 30); c.fill(); if (cp.t) cp.t = Math.max(0, cp.t - .016); }
  function drawPortal(c, p, t) { const g = c.createRadialGradient(p.x + p.w / 2, p.y + p.h / 2, 10, p.x + p.w / 2, p.y + p.h / 2, 90); g.addColorStop(0, "#fff"); g.addColorStop(.45, "#83f7ff"); g.addColorStop(1, "rgba(80,120,255,.12)"); c.fillStyle = g; c.beginPath(); c.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w / 2 + Math.sin(t * 4) * 4, p.h / 2, 0, 0, Math.PI * 2); c.fill(); }
  function drawSecretExit(c, p, t) { c.strokeStyle = "rgba(255,235,120,.55)"; c.lineWidth = 4; c.strokeRect(p.x, p.y, p.w, p.h); }
  function drawTunnel(c, t) { c.fillStyle = "rgba(20,14,24,.52)"; c.fillRect(t.x, t.y, t.w, t.h); }
  function drawSecretRoom(c, r, player, t) { const visible = player.activeAbility === "treasure" || AR.rectOverlap(player, r); c.fillStyle = visible ? "rgba(255,230,100,.12)" : "rgba(0,0,0,.18)"; c.fillRect(r.x, r.y, r.w, r.h); }
  function drawSecretHints(c, level, player, t) { if (player.activeAbility !== "treasure") return; c.fillStyle = "rgba(255,245,145,.85)"; [...level.secretRooms, ...(level.secretExit ? [level.secretExit] : [])].forEach((r) => { for (let i = 0; i < 8; i++) c.fillRect(r.x + (i * 43 + t * 30) % r.w, r.y + 8 + (i * 29) % Math.max(20, r.h - 20), 4, 4); }); }
  function drawProjectile(c, p, camera) { c.fillStyle = p.color || "#9ff3ff"; c.fillRect(p.x - camera.x, p.y, p.w, p.h); c.fillStyle = "#fff"; c.fillRect(p.x - camera.x + 8, p.y + 4, p.w - 16, 4); }
  function drawParticle(c, p, camera) { const alpha = Math.max(0, p.life); c.fillStyle = p.kind === "hit" ? `rgba(255,90,80,${alpha})` : p.kind === "shield" ? `rgba(190,210,255,${alpha})` : p.kind === "spark" ? `rgba(255,230,90,${alpha})` : `rgba(190,150,100,${alpha})`; c.fillRect(p.x - camera.x, p.y, 4, 4); }
  function drawHpBar(c, x, y, w, ratio, color) { c.fillStyle = "rgba(0,0,0,.45)"; c.fillRect(x, y, w, 6); c.fillStyle = color; c.fillRect(x, y, w * Math.max(0, ratio), 6); }
  function drawLighting(c, theme, t) { const g = c.createRadialGradient(640, 260, 80, 640, 260, 760); g.addColorStop(0, "rgba(255,245,210,.08)"); g.addColorStop(1, theme === "citadel" ? "rgba(5,0,12,.5)" : "rgba(0,0,0,.16)"); c.fillStyle = g; c.fillRect(0, 0, AR.VIEW.width, AR.VIEW.height); }
})();
