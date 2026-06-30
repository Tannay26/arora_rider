(() => {
  "use strict";
  AR.makeLevelOneWave = function makeLevelOneWave(wave, game) {
    const events = [];
    const count = wave === 10 ? 58 : 12 + wave * 4;
    const gap = wave === 10 ? 2.3 : Math.max(1.75, 3.8 - wave * .16);
    for (let i = 0; i < count; i++) {
      const type = pickEnemyType(wave, i, count);
      events.push({ time: i * gap + AR.rand(0, 1.4), stats: enemyStats(type, wave, game, i === count - 1 && wave === 10) });
    }
    return events;
  };
  function pickEnemyType(wave, i, count) {
    if (wave === 10 && i === count - 1) return "boss";
    if (wave >= 8 && i % 7 === 0) return "rhino";
    if (wave >= 6 && i % 6 === 0) return "serpent";
    if (wave >= 4 && i % 5 === 0) return "crow";
    if (wave >= 2 && i % 4 === 0) return "boar";
    return "wolf";
  }
  function enemyStats(type, wave, game, boss) {
    const upgradePower = Object.values(game.training || {}).reduce((sum, group) => sum + Object.values(group).reduce((a, b) => a + b, 0), 0);
    const timePower = Math.min(1.8, game.timeSurvived / 420);
    const scale = 1 + wave * .18 + (game.hero.level - 1) * .08 + upgradePower * .018 + timePower * .2;
    const table = {
      wolf: { name: "Wolf Raider", hp: 72, damage: 12, range: 48, attackSpeed: 1.1, speed: 92, type: "melee", role: "wolfRaider", color: "#625568", w: 52, h: 56, size: 1, xpReward: 16, coinReward: 2 },
      boar: { name: "Boar Brute", hp: 165, damage: 18, range: 48, attackSpeed: .62, speed: 50, type: "melee", role: "boarBrute", color: "#75433d", w: 66, h: 62, size: 1.12, xpReward: 24, coinReward: 4 },
      crow: { name: "Crow Shaman", hp: 92, damage: 18, range: 255, attackSpeed: .72, speed: 48, type: "ranged", role: "crowShaman", color: "#2c2438", w: 52, h: 72, size: 1, xpReward: 28, coinReward: 6 },
      serpent: { name: "Serpent Spitter", hp: 118, damage: 16, range: 245, attackSpeed: .82, speed: 56, type: "poison", role: "serpentSpitter", color: "#416b3f", w: 66, h: 44, size: 1, xpReward: 32, coinReward: 7 },
      rhino: { name: "Rhino Breaker", hp: 260, damage: 30, range: 62, attackSpeed: .52, speed: 58, type: "charge", role: "rhinoBreaker", color: "#65636a", w: 82, h: 76, size: 1.25, xpReward: 44, coinReward: 10 },
      boss: { name: "Elder Warbeast", hp: 2100, damage: 58, range: 82, attackSpeed: .68, speed: 38, type: "melee", role: "elderWarbeast", color: "#8f2f42", w: 132, h: 134, size: 1.9, xpReward: 180, coinReward: 90 },
    };
    const base = { ...table[type] };
    if (!boss) {
      base.hp = Math.round(base.hp * scale);
      base.damage = Math.round(base.damage * (1 + wave * .13));
      base.xpReward += wave * 3;
      base.coinReward += Math.floor(wave / 2);
    }
    return base;
  }
})();
