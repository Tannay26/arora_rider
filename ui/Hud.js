(() => {
  "use strict";

  AR.Hud = class {
    constructor(game) {
      this.game = game;
      this.nodes = {
        levelName: document.getElementById("levelName"),
        hpText: document.getElementById("hpText"),
        gemsText: document.getElementById("gemsText"),
        livesText: document.getElementById("livesText"),
        statusText: document.getElementById("statusText"),
        debugPanel: document.getElementById("debugPanel"),
      };
    }
    update() {
      const { player, level } = this.game;
      this.nodes.levelName.textContent = level.name;
      this.nodes.hpText.textContent = `${player.hp} / ${player.maxHp}`;
      this.nodes.gemsText.textContent = `${this.game.gemsCollected} / ${level.gems.length}`;
      this.nodes.livesText.textContent = player.lives;
      this.nodes.statusText.textContent = this.game.status;
      this.nodes.debugPanel.innerHTML = `Player: ${Math.round(player.x)}, ${Math.round(player.y)}<br>Velocity: ${Math.round(player.vx)}, ${Math.round(player.vy)}<br>Grounded: ${player.grounded}<br>Camera X: ${Math.round(this.game.camera.x)}`;
    }
  };
})();
