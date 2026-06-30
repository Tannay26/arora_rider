(() => {
  "use strict";
  AR.Hud = class {
    constructor(game) {
      this.game = game;
      this.nodes = {
        waveLabel: document.getElementById("waveLabel"),
        waveDetail: document.getElementById("waveDetail"),
        waveProgress: document.getElementById("waveProgress"),
        heroHpText: document.getElementById("heroHpText"),
        heroLevelText: document.getElementById("heroLevelText"),
        heroXpText: document.getElementById("heroXpText"),
        coinsText: document.getElementById("coinsText"),
        energyBar: document.getElementById("energyBar"),
        spiritBar: document.getElementById("spiritBar"),
        energyText: document.getElementById("energyText"),
        spiritText: document.getElementById("spiritText"),
        allyCards: document.getElementById("allyCards"),
        turretCards: document.getElementById("turretCards"),
        abilityBar: document.getElementById("abilityBar"),
        debugPanel: document.getElementById("debugPanel"),
        startWaveButton: document.getElementById("startWaveButton"),
        troopUpgradePanel: document.getElementById("troopUpgradePanel"),
      };
      this.renderStatic();
    }
    renderStatic() {
      this.nodes.allyCards.innerHTML = AR.ALLY_BLUEPRINTS.map((a, i) => `<button class="card" data-ally="${i}"><strong>${a.name}</strong><span>${a.cost} Energy</span><small>${a.role} | HP ${a.hp} | DMG ${a.damage}</small></button>`).join("");
      this.nodes.turretCards.innerHTML = AR.TURRETS.map((t, i) => `<button class="card" data-turret="${i}"><strong>${t.name}</strong><span>${t.cost} Energy</span><small>${t.type} | HP ${t.hp} | DMG ${t.damage}</small></button>`).join("");
      this.nodes.abilityBar.innerHTML = AR.ABILITIES.map((a) => `<button class="ability" data-ability="${a.id}"><strong>${a.name}</strong><span>${a.cost} Spirit</span></button>`).join("");
      this.nodes.troopUpgradePanel.innerHTML = AR.ALLY_BLUEPRINTS.map((ally) => `<article class="troop-upgrade-card" data-upgrade-card="${ally.id}"><h3>${ally.name}</h3>${AR.TRAINING_STATS.filter((stat) => !stat.rangedOnly || ally.ranged).map((stat) => `<button class="upgrade-buy" data-ally="${ally.id}" data-train="${stat.key}">${stat.label}</button>`).join("")}</article>`).join("");
    }
    update() {
      const g = this.game, w = g.waves;
      this.nodes.waveLabel.textContent = `Endless Assault - Threat Tier ${w.scaleTier + 1}`;
      this.nodes.waveDetail.textContent = `Enemies alive: ${w.remaining} | next spawn ${w.lastSpawnIn.toFixed(1)}s | spawned ${w.spawned}`;
      this.nodes.waveProgress.style.width = `${w.active ? (1 - w.lastSpawnIn / w.spawnInterval) * 100 : 0}%`;
      this.nodes.startWaveButton.hidden = false;
      this.nodes.startWaveButton.disabled = w.active || g.ended;
      this.nodes.startWaveButton.textContent = w.active ? "Endless Assault Active" : "Start Endless Assault";
      this.nodes.heroHpText.textContent = `${Math.max(0, Math.round(g.hero.hp))} / ${Math.round(g.hero.maxHp)}`;
      this.nodes.heroLevelText.textContent = g.hero.level;
      this.nodes.heroXpText.textContent = `${Math.round(g.hero.xp)} / ${g.hero.xpNeed}`;
      this.nodes.coinsText.textContent = g.coins;
      this.nodes.energyText.textContent = `${Math.floor(g.energy)} / ${g.maxEnergy}`;
      this.nodes.spiritText.textContent = `${Math.floor(g.spirit)} / ${g.maxSpirit}`;
      this.nodes.energyBar.style.width = `${g.energy / g.maxEnergy * 100}%`;
      this.nodes.spiritBar.style.width = `${g.spirit / g.maxSpirit * 100}%`;
      [...this.nodes.allyCards.querySelectorAll(".card")].forEach((button, i) => {
        const cost = Math.ceil(AR.ALLY_BLUEPRINTS[i].cost * g.mods.cost);
        button.disabled = g.energy < cost || g.ended;
        button.querySelector("span").textContent = `${cost} Energy`;
      });
      [...this.nodes.turretCards.querySelectorAll(".card")].forEach((button, i) => {
        const cost = AR.TURRETS[i].cost;
        button.disabled = g.energy < cost || g.ended;
        button.querySelector("span").textContent = `${cost} Energy`;
      });
      [...this.nodes.abilityBar.querySelectorAll(".ability")].forEach((button) => {
        const ability = AR.ABILITIES.find((a) => a.id === button.dataset.ability);
        const cd = g.abilityCooldowns[ability.id];
        button.disabled = g.spirit < ability.cost || cd > 0 || g.ended;
        button.querySelector("span").textContent = cd > 0 ? `${cd.toFixed(1)}s cooldown` : `${ability.cost} Spirit`;
      });
      this.nodes.debugPanel.innerHTML = `FPS: ${Math.round(g.fps)}<br>Hero X: ${Math.round(g.hero.x)}<br>Allies: ${g.allies.length}<br>Turrets: ${g.turrets.length}<br>Enemies alive: ${g.enemies.length}<br>Enemy Base: ${Math.max(0, Math.round(g.enemyBase.hp))}`;
      this.updateTrainingButtons();
    }
    updateTrainingButtons() {
      const g = this.game;
      AR.ALLY_BLUEPRINTS.forEach((ally) => {
        const card = this.nodes.troopUpgradePanel.querySelector(`[data-upgrade-card="${ally.id}"]`);
        if (!card) return;
        AR.TRAINING_STATS.filter((stat) => !stat.rangedOnly || ally.ranged).forEach((stat) => {
          const button = card.querySelector(`[data-train="${stat.key}"]`);
          const level = g.training[ally.id][stat.key];
          const cost = g.troopUpgradeCost(ally.id, stat.key);
          button.textContent = `${stat.label} ${level} - ${cost} Spirit`;
          button.disabled = g.spirit < cost || g.ended;
        });
      });
    }
  };
})();
