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
      };
      this.renderStatic();
    }
    renderStatic() {
      this.nodes.allyCards.innerHTML = AR.ALLY_BLUEPRINTS.map((a, i) => `<button class="card" data-ally="${i}"><strong>${a.name}</strong><span>${a.cost} Energy</span><small>${a.role} | HP ${a.hp} | DMG ${a.damage}</small></button>`).join("");
      this.nodes.abilityBar.innerHTML = AR.ABILITIES.map((a) => `<button class="ability" data-ability="${a.id}"><strong>${a.name}</strong><span>${a.cost} Spirit</span></button>`).join("");
    }
    update() {
      const g = this.game, w = g.waves;
      this.nodes.waveLabel.textContent = `Level 1 - Wave ${w.wave} / ${w.maxWaves}`;
      const countdown = w.countdown > 0 ? ` | starts in ${Math.ceil(w.countdown)}s` : "";
      const next = !w.active && w.nextWaveTimer > 0 ? ` | next wave in ${Math.ceil(w.nextWaveTimer)}s` : "";
      this.nodes.waveDetail.textContent = `Enemies remaining: ${w.remaining}${countdown}${next}`;
      this.nodes.waveProgress.style.width = `${(w.wave / w.maxWaves) * 100}%`;
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
    }
  };
})();
