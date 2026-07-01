(() => {
  "use strict";

  AR.clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  AR.lerp = (a, b, t) => a + (b - a) * t;
  AR.rand = (min, max) => min + Math.random() * (max - min);
  AR.pick = (items) => items[Math.floor(Math.random() * items.length)];
  AR.center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  AR.shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  AR.rectOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  AR.pointInRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
})();
