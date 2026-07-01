(() => {
  "use strict";

  AR.Hud = class {
    constructor(game) {
      this.game = game;
      this.hp = document.getElementById("hpText"); this.gems = document.getElementById("gemsText"); this.lives = document.getElementById("livesText");
      this.keys = document.getElementById("keysText"); this.status = document.getElementById("statusText"); this.debug = document.getElementById("debugPanel");
      this.power = document.getElementById("powerText"); this.powerIcon = document.getElementById("powerIcon"); this.shield = document.getElementById("shieldText");
    }
    update() {
      const p = this.game.player, level = this.game.level;
      this.hp.textContent = `${p.hp} / ${p.maxHp}`; this.gems.textContent = `${this.game.gemsCollected} / ${level.gems.length}`; this.lives.textContent = p.lives;
      this.keys.textContent = p.keys; this.status.textContent = this.game.status; this.shield.textContent = p.activeAbility === "stone" ? "1" : "0";
      if (p.activeAbility) { const cfg = AR.STAR_ABILITIES[p.activeAbility]; this.powerIcon.textContent = cfg.icon; this.power.textContent = `${cfg.name} - Active`; }
      else { this.powerIcon.textContent = "--"; this.power.textContent = "No ability"; }
      this.debug.innerHTML = [
        `Level: ${this.game.levelIndex + 1} / ${AR.LEVELS.length}`,
        `Hero: ${Math.round(p.x)}, ${Math.round(p.y)}`,
        `Camera: ${Math.round(this.game.camera.x)}`,
        `Enemies: ${level.enemies.filter((e) => !e.dead).length}`,
        `Ability: ${p.activeAbility || "none"}`,
        `Map width: ${level.width}`,
      ].join("<br>");
    }
  };
})();
