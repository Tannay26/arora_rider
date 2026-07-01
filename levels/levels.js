(() => {
  "use strict";

  const ground = (x, w, y = 610, type = "ground") => ({ x, y, w, h: 110, type });
  const plat = (x, y, w, type = "ruin") => ({ x, y, w, h: 28, type, oneWay: true });
  const move = (x, y, w, axis, from, to, speed, type = "moving") => ({ x, y, w, h: 26, type, oneWay: true, moving: { axis, from, to, speed, dir: 1 } });
  const fall = (x, y, w) => ({ x, y, w, h: 24, type: "falling", oneWay: true, falling: { armed: false, delay: .55, timer: 0 } });
  const bridge = (x, y, w) => ({ x, y, w, h: 22, type: "bridge", oneWay: true, falling: { armed: false, delay: .85, timer: 0 } });
  const block = (x, y) => ({ x, y, w: 48, h: 48, broken: false });
  const hazard = (kind, x, y, w, h, extra = {}) => ({ kind, x, y, w, h, t: 0, ...extra });
  const pad = (x, y) => ({ x, y, w: 64, h: 18 });
  const gemLine = (x, y, count, step = 48) => Array.from({ length: count }, (_, i) => [x + i * step, y]);

  const THEMES = [
    { key: "forest", title: "Forest Trail", mechanics: ["checkpoint statues", "spike pits", "jump pads"] },
    { key: "ruins", title: "Forgotten Ruins", mechanics: ["collapsing bridges", "locked gates", "secret rooms"] },
    { key: "crystal", title: "Crystal Caverns", mechanics: ["underground tunnels", "rotating blades", "falling stone"] },
    { key: "frozen", title: "Frozen Mountains", mechanics: ["icy slopes", "strong wind", "snowy moving lifts"] },
    { key: "volcano", title: "Volcanic Forge", mechanics: ["lava pools", "rolling boulders", "fire hazards"] },
    { key: "sky", title: "Floating Kingdom", mechanics: ["long moving platforms", "wind zones", "floating routes"] },
    { key: "jungle", title: "Ancient Jungle", mechanics: ["waterfalls", "swinging logs", "hidden treasure rooms"] },
    { key: "citadel", title: "Dark Citadel", mechanics: ["all hazards", "boss introduction", "secret exit"] },
  ];

  AR.LEVELS = THEMES.map((theme, index) => buildAdventureLevel(index, theme));

  function buildAdventureLevel(index, theme) {
    const width = 13800 + index * 650;
    const platforms = [];
    const hazards = [];
    const pads = [];
    const blocks = [];
    const gems = [];
    const hiddenGems = [];
    const stars = [];
    const enemies = [];
    const keys = [];
    const gates = [];
    const checkpoints = [];
    const secretRooms = [];
    const tunnels = [];

    addGroundRun(platforms, 0, width, index);
    platforms.push(ground(width - 980, 980, 610, index === 3 ? "ice" : "ground"));
    const sections = Math.floor(width / 900);
    for (let s = 0; s < sections; s++) {
      const x = 680 + s * 850;
      const high = 430 - (s % 3) * 38;
      const mid = 500 - (s % 2) * 25;
      platforms.push(plat(x, mid, 210 + (s % 3) * 34, s % 2 ? "wood" : "ruin"));
      platforms.push(plat(x + 330, high, 180 + (s % 4) * 22, theme.key === "frozen" ? "ice" : "ruin"));
      if (s % 3 === 1) platforms.push(move(x + 620, 470, 180, "x", x + 560, x + 850, 78 + index * 4));
      if (s % 4 === 2) platforms.push(move(x + 450, 380, 170, "y", 330, 500, 58 + index * 3));
      if (s % 5 === 3) platforms.push(fall(x + 760, 410, 170));
      if (s % 6 === 4) platforms.push(bridge(x + 140, 550, 230));

      gems.push(...gemLine(x + 35, mid - 42, 3));
      if (s % 2 === 0) gems.push(...gemLine(x + 360, high - 44, 3));
      if (s % 4 === 0) hiddenGems.push(...gemLine(x + 210, 300, 3));
      if (s % 5 === 0) stars.push({ x: x + 520, y: high - 54, w: 34, h: 34, taken: false });
      if (s % 3 === 0) checkpoints.push({ x: x + 720, y: 514, active: false });

      const enemyType = enemyFor(index, s);
      enemies.push({ type: enemyType, x: x + 120, y: enemyY(enemyType, mid), patrol: [x - 20, x + 520] });
      if (s % 4 === 1) enemies.push({ type: enemyFor(index + 1, s), x: x + 500, y: 500, patrol: [x + 360, x + 820] });

      if (s % 3 === 2) hazards.push(hazard("spikes", x + 30, 584, 110, 26));
      if (s >= 2 && s % 4 === 0) hazards.push(hazard("blade", x + 500, 452, 54, 54, { radius: 66, speed: 2.6 + index * .18 }));
      if (index >= 1 && s % 5 === 2) hazards.push(hazard("log", x + 260, 370, 140, 28, { pivotX: x + 330, pivotY: 330, length: 150, speed: 1.25 }));
      if (index >= 4 && s % 4 === 1) hazards.push(hazard("lava", x + 620, 600, 230, 36));
      if (index >= 4 && s % 5 === 0) hazards.push(hazard("boulder", x + 700, 532, 58, 58, { from: x + 620, to: x + 990, speed: 105 }));
      if (index >= 3 && s % 4 === 3) hazards.push(hazard("wind", x + 120, 250, 420, 310, { force: index === 5 ? 640 : -460 }));
      if (index >= 6 && s % 4 === 2) hazards.push(hazard("waterfall", x + 640, 180, 86, 430, { force: 520 }));
      if (s % 6 === 1) pads.push(pad(x + 760, 590));
      if (s % 7 === 2) {
        blocks.push(block(x + 95, 562), block(x + 143, 562), block(x + 191, 562));
        secretRooms.push({ x: x + 70, y: 250, w: 320, h: 140 });
      }
    }

    const keyX = width - 1750;
    keys.push({ x: keyX, y: 350, taken: false });
    gates.push({ x: width - 680, y: 490, w: 52, h: 120, open: false });
    checkpoints.push({ x: Math.floor(width * .28), y: 514, active: false }, { x: Math.floor(width * .55), y: 514, active: false }, { x: Math.floor(width * .78), y: 514, active: false });
    tunnels.push({ x: Math.floor(width * .42), y: 568, w: 520, h: 80 });
    secretRooms.push({ x: Math.floor(width * .64), y: 235, w: 430, h: 160 });
    hiddenGems.push(...gemLine(Math.floor(width * .64) + 40, 300, 6));

    if (index === 7) {
      enemies.push({ type: "guardian", x: width - 1120, y: 502, patrol: [width - 1250, width - 760], boss: true });
      hazards.push(hazard("blade", width - 980, 505, 70, 70, { radius: 86, speed: 4 }));
    }

    return {
      name: `Level ${index + 1} - ${theme.title}`,
      theme: theme.key,
      mechanics: theme.mechanics,
      width,
      height: 720,
      spawn: { x: 120, y: 420 },
      portal: { x: width - 250, y: 414, w: 96, h: 150 },
      secretExit: index % 2 === 1 ? { x: width - 1250, y: 260, w: 80, h: 120 } : null,
      platforms,
      gems,
      hiddenGems,
      powerups: stars,
      enemies,
      hazards,
      pads,
      blocks,
      keys,
      gates,
      checkpoints,
      secretRooms,
      tunnels,
    };
  }

  function addGroundRun(platforms, widthStart, width, index) {
    let x = widthStart;
    while (x < width - 280) {
      const segment = 540 + ((x / 430) % 4) * 70;
      const y = index === 3 && Math.floor(x / 900) % 3 === 1 ? 600 : 610;
      const type = index === 3 && Math.floor(x / 1000) % 2 === 1 ? "ice" : "ground";
      platforms.push(ground(x, Math.min(segment, width - x), y, type));
      const gap = 130 + (Math.floor(x / 780) % 3) * 35;
      x += segment + gap;
    }
  }

  function enemyFor(index, s) {
    const lists = [
      ["wolf", "boar", "spider"],
      ["wolf", "boar", "spider", "troll"],
      ["spider", "serpent", "troll", "raven"],
      ["ice", "raven", "wolf", "boar"],
      ["golem", "serpent", "boar", "raven"],
      ["raven", "guardian", "wolf", "ice"],
      ["serpent", "spider", "giant", "raven"],
      ["guardian", "giant", "golem", "raven", "ice"],
    ];
    return lists[Math.min(index, lists.length - 1)][s % lists[Math.min(index, lists.length - 1)].length];
  }
  function enemyY(type, platformY) { return AR.ENEMY_INFO[type]?.flying ? platformY - 105 : platformY - (AR.ENEMY_INFO[type]?.h || 48); }
})();

