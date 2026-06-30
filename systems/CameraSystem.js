(() => {
  "use strict";

  AR.CameraSystem = class {
    constructor(level) {
      this.level = level;
      this.x = 0;
    }
    follow(player) {
      const target = player.x - AR.VIEW.width * 0.42;
      this.x += (target - this.x) * 0.12;
      this.x = AR.clamp(this.x, 0, this.level.width - AR.VIEW.width);
    }
  };
})();
