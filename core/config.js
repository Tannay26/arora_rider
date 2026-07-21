(() => {
  "use strict";

  window.AR = window.AR || {};

  AR.VIEW = {
    width: 1280,
    height: 720,
  };

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
    guardian: {
      name: "Guardian Aura",
      icon: "GA",
      description:
        "Touch enemies and hazards to defeat them. Ends when damaged.",
    },

    wings: {
      name: "Sky Wings",
      icon: "SW",
      description:
        "Hold jump to fly freely. Ends when damaged.",
    },

    blaster: {
      name: "Spirit Blaster",
      icon: "SB",
      description:
        "Press F or X to fire magic. Ends when damaged.",
    },

    stone: {
      name: "Stone Skin",
      icon: "SS",
      description:
        "Ignore the first hit, then the power ends.",
    },

    time: {
      name: "Time Warp",
      icon: "TW",
      description:
        "World hazards and enemies move at half speed. Ends when damaged.",
    },

    treasure: {
      name: "Treasure Sense",
      icon: "TS",
      description:
        "Hidden routes and treasure sparkle. Ends when damaged.",
    },
  };

  AR.ENEMY_INFO = {
    book: {
      name: "Exam Book",
      speed: 105,
      w: 68,
      h: 48,
      hp: 1,
      color: "#8a3d35",
    },

    dumbbell: {
      name: "Heavy Dumbbell",
      speed: 72,
      w: 80,
      h: 46,
      hp: 2,
      color: "#343a45",
    },

    bossArora: {
      name: "The Great Arora",
      speed: 90,
      w: 130,
      h: 120,
      hp: 12,
      color: "#54275f",
    },
  };
})();
