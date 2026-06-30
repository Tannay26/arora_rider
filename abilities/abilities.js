(() => {
  "use strict";
  AR.ABILITIES = [
    { id: "heal", name: "Heal nearby allies", cost: 35, cooldown: 8 },
    { id: "bolt", name: "Spirit Bolt", cost: 25, cooldown: 3 },
    { id: "rally", name: "Rally aura", cost: 45, cooldown: 12 },
  ];
  AR.castAbility = function castAbility(game, id) {
    const ability = AR.ABILITIES.find((item) => item.id === id);
    if (!ability || game.spirit < ability.cost || game.abilityCooldowns[id] > 0 || game.ended) return;
    game.spirit -= ability.cost;
    game.abilityCooldowns[id] = ability.cooldown;
    if (id === "heal") {
      const amount = 78 * game.mods.healPower;
      game.allies.filter((unit) => Math.abs(unit.centerX - game.hero.centerX) < 320).forEach((unit) => {
        unit.hp = Math.min(unit.maxHp, unit.hp + amount);
        game.float(`+${Math.round(amount)}`, unit.centerX, unit.y - unit.h - 22, AR.COLORS.heal);
        game.particles.burst(unit.centerX, unit.y - unit.h * .5, AR.COLORS.heal, 5, 40);
      });
    }
    if (id === "bolt") {
      const target = game.combat.frontEnemyForHero() || game.enemyBase;
      game.projectiles.push(new AR.Projectile({ x: game.hero.centerX + game.hero.facing * 72, y: game.hero.y - 112, side: "ally", damage: 110 * game.mods.heroDamage, speed: 720, target, color: AR.COLORS.spirit, owner: game.hero, type: "bolt" }));
    }
    if (id === "rally") {
      game.allies.filter((unit) => Math.abs(unit.centerX - game.hero.centerX) < 440).forEach((unit) => {
        unit.rally = 8;
        game.float("Rally!", unit.centerX, unit.y - unit.h - 20, AR.COLORS.gold);
      });
    }
  };
})();
