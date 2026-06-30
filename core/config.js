(() => {
  "use strict";

  window.AR = window.AR || {};

  AR.WORLD = {
    width: 1920,
    height: 900,
    groundY: 660,
    leftWall: 36,
    rightWall: 1884,
    laneMin: 145,
    laneMax: 1710,
    playerStructureX: 34,
    enemyStructureX: 1728,
  };

  AR.COLORS = {
    gold: "#f4c861",
    ivory: "#fff4dd",
    damage: "#ffe082",
    crit: "#ff5f5f",
    heal: "#7dff9b",
    spirit: "#9cf4ff",
  };

  AR.ALLY_BLUEPRINTS = [
    { id: "bladePup", name: "Blade Pup", cost: 18, hp: 88, damage: 14, range: 46, attackSpeed: 1.35, speed: 105, type: "melee", xp: 0, level: 1, size: 0.82, role: "duelist" },
    { id: "thornHare", name: "Thorn Hare", cost: 25, hp: 62, damage: 12, range: 255, attackSpeed: 0.95, speed: 88, type: "ranged", xp: 0, level: 1, size: 0.92, role: "archer" },
    { id: "shellback", name: "Shellback", cost: 36, hp: 215, damage: 10, range: 48, attackSpeed: 0.62, speed: 40, type: "tank", xp: 0, level: 1, size: 1.12, role: "guardian" },
    { id: "emberFox", name: "Ember Fox", cost: 34, hp: 76, damage: 9, range: 190, attackSpeed: 1.18, speed: 115, type: "burn", xp: 0, level: 1, size: 0.86, role: "skirmisher" },
    { id: "ironRam", name: "Iron Ram", cost: 42, hp: 142, damage: 24, range: 58, attackSpeed: 0.58, speed: 90, type: "charge", xp: 0, level: 1, size: 1.02, role: "breaker" },
    { id: "frostOwl", name: "Frost Owl", cost: 39, hp: 70, damage: 10, range: 270, attackSpeed: 0.9, speed: 72, type: "slow", xp: 0, level: 1, size: 0.88, role: "control" },
    { id: "sparkLynx", name: "Spark Lynx", cost: 47, hp: 78, damage: 15, range: 225, attackSpeed: 0.85, speed: 124, type: "chain", xp: 0, level: 1, size: 0.9, role: "arc" },
    { id: "stonebackTurtle", name: "Stoneback Turtle", cost: 52, hp: 295, damage: 8, range: 44, attackSpeed: 0.5, speed: 30, type: "blocker", xp: 0, level: 1, size: 1.32, role: "fortress" },
    { id: "windCrane", name: "Wind Crane", cost: 56, hp: 74, damage: 19, range: 330, attackSpeed: 0.75, speed: 84, type: "longshot", xp: 0, level: 1, size: 1, role: "lancer" },
    { id: "sunLion", name: "Sun Lion", cost: 82, hp: 215, damage: 36, range: 82, attackSpeed: 0.78, speed: 75, type: "elite", xp: 0, level: 1, size: 1.36, role: "champion" },
  ];

  AR.UPGRADES = [
    { title: "+15% hero max HP", apply: (game) => { game.hero.maxHp *= 1.15; game.hero.hp = Math.min(game.hero.maxHp, game.hero.hp + game.hero.maxHp * 0.15); } },
    { title: "+10% hero damage", apply: (game) => { game.mods.heroDamage *= 1.1; } },
    { title: "+10% Energy regeneration", apply: (game) => { game.mods.energyRegen *= 1.1; } },
    { title: "+10% Spirit regeneration", apply: (game) => { game.mods.spiritRegen *= 1.1; } },
    { title: "+12% ally damage", apply: (game) => { game.mods.allyDamage *= 1.12; } },
    { title: "+12% ally HP", apply: (game) => { game.mods.allyHp *= 1.12; } },
    { title: "-5% ally summon cost", apply: (game) => { game.mods.cost *= 0.95; } },
    { title: "+10% elephant movement speed", apply: (game) => { game.hero.speed *= 1.1; } },
    { title: "+15% healing ability power", apply: (game) => { game.mods.healPower *= 1.15; } },
  ];
})();
