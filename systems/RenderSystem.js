(() => {
  "use strict";
  AR.RenderSystem = class {
    constructor(game) { this.game = game; }
    draw() {
      const c = this.game.ctx;
      drawBackground(c);
      this.game.playerBase.draw(c);
      this.game.enemyBase.draw(c);
      [...this.game.allies, ...this.game.enemies].sort((a, b) => a.x - b.x).forEach((u) => u.draw(c));
      this.game.hero.draw(c);
      this.game.projectiles.forEach((p) => p.draw(c));
      this.game.particles.draw(c);
      this.game.floaters.forEach((f) => f.draw(c));
    }
  };
  AR.drawHp = function drawHp(c, x, y, w, h, ratio) {
    c.fillStyle = "rgba(22, 8, 13, .9)"; c.fillRect(x, y, w, h);
    c.fillStyle = ratio > .45 ? "#69e885" : ratio > .2 ? "#ffd15e" : "#ff6464";
    c.fillRect(x, y, w * AR.clamp(ratio, 0, 1), h);
    c.strokeStyle = "rgba(255,255,255,.72)"; c.lineWidth = 2; c.strokeRect(x, y, w, h);
  };
  function drawBackground(c) {
    const sky = c.createLinearGradient(0, 0, 0, AR.WORLD.groundY);
    sky.addColorStop(0, "#5062bd"); sky.addColorStop(.35, "#c989b4"); sky.addColorStop(1, "#f7d796");
    c.fillStyle = sky; c.fillRect(0, 0, AR.WORLD.width, AR.WORLD.height);
    mountains(c, .45, "#565b86", 430); mountains(c, .7, "#394764", 505);
    forest(c, 560); cliffs(c); waterfalls(c); clouds(c); ground(c);
  }
  function mountains(c, scale, color, baseY) { c.fillStyle = color; c.beginPath(); c.moveTo(0, baseY); for (let x = -80; x <= AR.WORLD.width + 160; x += 220) { c.lineTo(x + 95, baseY - 210 * scale - ((x / 220) % 2) * 42); c.lineTo(x + 220, baseY); } c.lineTo(AR.WORLD.width, AR.WORLD.groundY); c.lineTo(0, AR.WORLD.groundY); c.fill(); }
  function forest(c, y) { for (let x = 0; x < AR.WORLD.width; x += 38) { c.fillStyle = x % 3 ? "#233d35" : "#2f5040"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 22, y - 80 - (x % 5) * 5); c.lineTo(x + 48, y); c.fill(); } }
  function cliffs(c) { c.fillStyle = "#6d5a4c"; c.fillRect(0, 586, AR.WORLD.width, 82); c.fillStyle = "rgba(255,255,255,.08)"; for (let x = 0; x < AR.WORLD.width; x += 90) c.fillRect(x, 600 + (x % 3) * 12, 56, 6); }
  function waterfalls(c) { c.fillStyle = "rgba(145,220,255,.45)"; [620, 1180].forEach((x) => { c.fillRect(x, 500, 36, 150); c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(x + 10, 500, 5, 145); c.fillStyle = "rgba(145,220,255,.45)"; }); }
  function clouds(c) { c.fillStyle = "rgba(255,255,255,.35)"; [[240,105,1.1],[830,92,.8],[1360,145,1.25]].forEach(([x,y,s]) => { c.beginPath(); c.arc(x,y,32*s,0,Math.PI*2); c.arc(x+42*s,y-12*s,42*s,0,Math.PI*2); c.arc(x+88*s,y,30*s,0,Math.PI*2); c.rect(x-5*s,y,105*s,28*s); c.fill(); }); }
  function ground(c) { const g = c.createLinearGradient(0, AR.WORLD.groundY, 0, AR.WORLD.height); g.addColorStop(0, "#466a3d"); g.addColorStop(1, "#1d3320"); c.fillStyle = g; c.fillRect(0, AR.WORLD.groundY, AR.WORLD.width, AR.WORLD.height - AR.WORLD.groundY); c.fillStyle = "rgba(255,223,146,.2)"; c.fillRect(0, AR.WORLD.groundY, AR.WORLD.width, 9); for (let x=20;x<AR.WORLD.width;x+=55){ c.fillStyle=x%2?"#f2c65b":"#d56d8a"; c.beginPath(); c.arc(x, AR.WORLD.groundY+24+(x%4)*3, 4, 0, Math.PI*2); c.fill(); c.fillStyle="#2e542f"; c.fillRect(x-1, AR.WORLD.groundY+26, 2, 10); } for(let x=80;x<AR.WORLD.width;x+=130){ c.fillStyle="#6e6659"; c.beginPath(); c.ellipse(x, AR.WORLD.groundY+45, 15, 8, 0, 0, Math.PI*2); c.fill(); } }
})();
