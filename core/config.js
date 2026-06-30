(() => {
  "use strict";

  window.AR = window.AR || {};

  AR.VIEW = { width: 1280, height: 720 };

  AR.PHYSICS = {
    gravity: 2200,
    moveSpeed: 360,
    jumpVelocity: -820,
    maxFall: 1250,
  };

  AR.COLORS = {
    text: "#fff4df",
    gem: "#8ff4ff",
    enemy: "#8b3d4a",
    player: "#f0bb59",
  };
})();
