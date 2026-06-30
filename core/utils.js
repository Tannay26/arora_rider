(() => {
  "use strict";

  AR.clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  AR.rand = (min, max) => min + Math.random() * (max - min);
  AR.distance = (a, b) => Math.abs(a.centerX - b.centerX);
  AR.shuffle = (items) => {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  };
})();
