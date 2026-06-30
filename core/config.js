(() => {
  "use strict";

  window.AR = window.AR || {};

  AR.VIEW = { width: 1280, height: 720 };
  AR.PHYSICS = {
    gravity: 2200,
    moveSpeed: 360,
    jumpVelocity: -820,
    doubleJumpVelocity: -930,
    maxFall: 1250,
    bounceVelocity: -1040,
  };
  AR.POWERS = {
    charge: { name: "Elephant Charge", icon: "CH", duration: 9 },
    feather: { name: "Feather Jump", icon: "FJ", duration: 12 },
    shield: { name: "Shield Lotus", icon: "SL", duration: 0 },
    spark: { name: "Spark Trunk", icon: "ST", duration: 14 },
    giant: { name: "Giant Spirit", icon: "GS", duration: 10 },
    slow: { name: "Slow Time Bell", icon: "TB", duration: 8 },
  };
})();