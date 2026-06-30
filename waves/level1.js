(() => {
  "use strict";
  AR.makeLevelOneWave = function makeLevelOneWave(wave) {
    const events = [];
    const count = wave === 10 ? 24 : 4 + wave * 3;
    for (let i = 0; i < count; i++) {
      const type = pickEnemyType(wave, i, count);
      events.push({ time: i * Math.max(.48, 1.06 - wave * .055), stats: enemyStats(type, wave, i === count - 1 && wave === 10) });
    }
    return events;
  };
  function pickEnemyType(wave, i, count) {
    if (wave === 10 && i === count - 1) return "boss";
    if (wave >= 7 && i % 6 === 0) return "warlock";
    if (wave >= 5 && i % 5 === 0) return "brute";
    if (wave >= 3 && i % 4 === 0) return "archer";
    return "imp";
  }
  function enemyStats(type, wave, boss) {
    const scale = 1 + wave * .18;
    const table = {
      imp: { name: "Gloom Imp", hp: 58, damage: 9, range: 44, attackSpeed: .95, speed: 70, type: "melee", color: "#5b5265", w: 44, h: 58, xpReward: 14, coinReward: 2 },
      archer: { name: "Ash Archer", hp: 72, damage: 12, range: 230, attackSpeed: .78, speed: 55, type: "ranged", color: "#734e7e", w: 44, h: 60, xpReward: 18, coinReward: 3 },
      brute: { name: "Dread Guard", hp: 138, damage: 18, range: 50, attackSpeed: .58, speed: 45, type: "melee", color: "#7f3a40", w: 54, h: 72, xpReward: 24, coinReward: 5 },
      warlock: { name: "Hex Warlock", hp: 96, damage: 20, range: 260, attackSpeed: .62, speed: 42, type: "ranged", color: "#53275f", w: 48, h: 72, xpReward: 30, coinReward: 7 },
      boss: { name: "Fortress Warlord", hp: 1180, damage: 46, range: 76, attackSpeed: .7, speed: 36, type: "melee", color: "#b64251", w: 92, h: 108, xpReward: 120, coinReward: 60 },
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
