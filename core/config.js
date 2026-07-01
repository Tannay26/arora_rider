(() => {
  "use strict";

  window.AR = window.AR || {};

  AR.VIEW = { width: 1280, height: 720 };
  AR.PHYSICS = {
    gravity: 2250,
    acceleration: 3300,
    groundFriction: 4200,
    airAcceleration: 2100,
    airFriction: 900,
    moveSpeed: 405,
    jumpVelocity: -820,
    wallJumpX: 520,
    wallJumpY: -760,
    maxFall: 1280,
    bounceVelocity: -1060,
    coyoteTime: 0.11,
    jumpBuffer: 0.13,
  };

  AR.STAR_ABILITIES = {
    guardian: { name: "Guardian Aura", icon: "GA", description: "Touch enemies and hazards to defeat them. Ends when damaged." },
    wings: { name: "Sky Wings", icon: "SW", description: "Hold jump to fly freely. Ends when damaged." },
    blaster: { name: "Spirit Blaster", icon: "SB", description: "Press Space to fire magic. Ends when damaged." },
    stone: { name: "Stone Skin", icon: "SS", description: "Ignore the first hit, then the power ends." },
    time: { name: "Time Warp", icon: "TW", description: "World hazards and enemies move at half speed. Ends when damaged." },
    treasure: { name: "Treasure Sense", icon: "TS", description: "Hidden routes and treasure sparkle. Ends when damaged." },
  };

  AR.ENEMY_INFO = {
    wolf: { name: "Dire Wolf", speed: 132, w: 66, h: 46, hp: 1, color: "#5a2634" },
    boar: { name: "Armored Boar", speed: 86, w: 72, h: 52, hp: 2, color: "#5d4b43" },
    spider: { name: "Giant Spider", speed: 92, w: 70, h: 42, hp: 1, color: "#372942" },
    troll: { name: "Cave Troll", speed: 58, w: 76, h: 82, hp: 3, color: "#5e735d" },
    serpent: { name: "Poison Serpent", speed: 96, w: 74, h: 34, hp: 1, color: "#315f43" },
    golem: { name: "Fire Golem", speed: 64, w: 78, h: 86, hp: 3, color: "#7b3c25" },
    ice: { name: "Ice Beast", speed: 78, w: 82, h: 70, hp: 2, color: "#6ca1b6" },
    raven: { name: "Shadow Raven", speed: 148, w: 62, h: 46, hp: 1, flying: true, color: "#25223a" },
    giant: { name: "Stone Giant", speed: 48, w: 92, h: 104, hp: 4, color: "#68635d" },
    guardian: { name: "Ancient Guardian", speed: 74, w: 96, h: 108, hp: 5, color: "#605179" },
  };
})();
