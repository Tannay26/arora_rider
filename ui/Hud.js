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
        abilityBar: document.getElementById("abilityBar"),
        debugPanel: document.getElementById("debugPanel"),
        startWaveButton: document.getElementById("startWaveButton"),
        troopUpgradePanel: document.getElementById("troopUpgradePanel"),
      };
      this.renderStatic();
    }
    renderStatic() {
      this.nodes.allyCards.innerHTML = AR.ALLY_BLUEPRINTS.map((a, i) => `<button class="card" data-ally="${i}"><strong>${a.name}</strong><span>${a.cost} Energy</span><small>${a.role} | HP ${a.hp} | DMG ${a.damage}</small></button>`).join("");
      this.nodes.abilityBar.innerHTML = AR.ABILITIES.map((a) => `<button class="ability" data-ability="${a.id}"><strong>${a.name}</strong><span>${a.cost} Spirit</span></button>`).join("");
      this.nodes.troopUpgradePanel.innerHTML = AR.ALLY_BLUEPRINTS.map((ally) => `<article class="troop-upgrade-card" data-upgrade-card="${ally.id}"><h3>${ally.name}</h3>${AR.TRAINING_STATS.filter((stat) => !stat.rangedOnly || ally.ranged).map((stat) => `<button class="upgrade-buy" data-ally="${ally.id}" data-train="${stat.key}">${stat.label}</button>`).join("")}</article>`).join("");
    }
    update() {
      const g = this.game, w = g.waves;
      this.nodes.waveLabel.textContent = `Level 1 - Wave ${w.wave} / ${w.maxWaves}`;
      const countdown = w.countdown > 0 ? ` | starts in ${Math.ceil(w.countdown)}s` : "";
      const spawn = w.active && w.countdown <= 0 && w.remaining ? ` | next spawn ${w.lastSpawnIn.toFixed(1)}s` : "";
      const next = !w.active && w.nextWaveTimer > 0 ? ` | next wave in ${Math.ceil(w.nextWaveTimer)}s` : "";
      this.nodes.waveDetail.textContent = `Enemies remaining: ${w.remaining}${countdown}${spawn}${next}`;
      const inWaveProgress = w.total ? (w.spawned + (w.total - w.queue.length - w.spawned)) / w.total : 0;
      this.nodes.waveProgress.style.width = `${Math.max((w.wave - (w.active ? 1 : 0)) / w.maxWaves, 0) * 100 + (w.active ? inWaveProgress * 10 : 0)}%`;
      this.nodes.startWaveButton.hidden = w.active || w.wave >= w.maxWaves;
      this.nodes.startWaveButton.disabled = w.active || w.nextWaveTimer > 0 || g.ended;
      this.nodes.startWaveButton.textContent = w.nextWaveTimer > 0 ? `Next wave in ${Math.ceil(w.nextWaveTimer)}s` : `Start Wave ${w.wave + 1}`;
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
      [...this.nodes.abilityBar.querySelectorAll(".ability")].forEach((button) => {
        const ability = AR.ABILITIES.find((a) => a.id === button.dataset.ability);
        const cd = g.abilityCooldowns[ability.id];
        button.disabled = g.spirit < ability.cost || cd > 0 || g.ended;
        button.querySelector("span").textContent = cd > 0 ? `${cd.toFixed(1)}s cooldown` : `${ability.cost} Spirit`;
      });
      this.nodes.debugPanel.innerHTML = `FPS: ${Math.round(g.fps)}<br>Hero X: ${Math.round(g.hero.x)}<br>Allies: ${g.allies.length}<br>Enemies: ${g.enemies.length}<br>Enemy Base: ${Math.max(0, Math.round(g.enemyBase.hp))}`;
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
