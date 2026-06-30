(() => {
  "use strict";

  const ground = (x, w, y = 610) => ({ x, y, w, h: 110, type: "ground" });
  const ruin = (x, y, w) => ({ x, y, w, h: 32, type: "ruin" });
  const wood = (x, y, w) => ({ x, y, w, h: 26, type: "wood" });
  const move = (x, y, w, axis, from, to, speed) => ({ x, y, startX: x, startY: y, w, h: 26, type: "moving", moving: { axis, from, to, speed, dir: 1 } });
  const fall = (x, y, w) => ({ x, y, startY: y, w, h: 26, type: "falling", falling: { armed: false, delay: .45, timer: 0 } });
  const block = (x, y) => ({ x, y, w: 48, h: 48, broken: false });

  AR.LEVELS = [
    {
      name: "Level 1 - Forest Ruins Tutorial",
      theme: "forest",
      width: 4550,
      height: 720,
      spawn: { x: 120, y: 420 },
      portal: { x: 4300, y: 414, w: 92, h: 150 },
      platforms: [ground(0, 660), ground(760, 650), ground(1540, 560), ground(2240, 620), ground(3000, 620), ground(3740, 760), ruin(460, 470, 220), ruin(920, 410, 260), wood(1320, 500, 190), ruin(1830, 385, 280), wood(2530, 455, 250), move(3290, 455, 180, "y", 390, 510, 55), fall(3550, 390, 160)],
      gems: [[260,540],[530,420],[650,420],[1010,360],[1120,360],[1390,450],[1880,335],[1990,335],[2330,540],[2600,405],[3340,340],[3600,340],[3840,540],[3960,540]],
      hiddenGems: [[1190,250],[3470,250]],
      powerups: [{ type: "shield", x: 970, y: 355 }, { type: "charge", x: 1870, y: 330 }, { type: "spark", x: 3150, y: 545 }],
      enemies: [{ type: "beetle", x: 860, y: 548, patrol: [760,1410] }, { type: "frog", x: 1660, y: 548, patrol: [1540,2100] }, { type: "snail", x: 2390, y: 548, patrol: [2240,2860] }, { type: "moth", x: 3340, y: 360, patrol: [3160,3620] }, { type: "beetle", x: 3920, y: 548, patrol: [3740,4420] }],
      hazards: [{ x: 675, y: 584, w: 74, h: 26 }, { x: 1460, y: 584, w: 66, h: 26 }, { x: 2890, y: 584, w: 88, h: 26 }],
      pads: [{ x: 1465, y: 560, w: 58, h: 18 }],
      blocks: [block(2760, 562), block(2808, 562)],
      keys: [{ x: 3440, y: 340, taken: false }],
      gates: [{ x: 4070, y: 490, w: 48, h: 120, open: false }],
      checkpoints: [{ x: 2100, y: 518, active: false }, { x: 3460, y: 330, active: false }]
    },
    {
      name: "Level 2 - Sky Vines",
      theme: "sky",
      width: 5050,
      height: 720,
      spawn: { x: 100, y: 350 },
      portal: { x: 4810, y: 300, w: 92, h: 150 },
      platforms: [ground(0, 420, 630), ruin(540, 520, 230), move(880, 470, 190, "x", 820, 1110, 80), ruin(1260, 430, 230), fall(1570, 390, 170), move(1850, 430, 200, "y", 350, 505, 70), ruin(2180, 360, 260), wood(2540, 465, 210), move(2850, 410, 190, "x", 2780, 3150, 95), ruin(3300, 355, 260), fall(3650, 455, 180), ruin(3990, 400, 240), move(4380, 350, 190, "y", 280, 430, 65), ruin(4740, 450, 270)],
      gems: [[610,470],[930,420],[1340,380],[1610,340],[1910,320],[2260,310],[2620,420],[2920,360],[3380,305],[3700,405],[4080,350],[4430,250],[4820,250]],
      hiddenGems: [[1120,265],[2350,210],[4520,190]],
      powerups: [{ type: "feather", x: 1310, y: 375 }, { type: "slow", x: 2870, y: 355 }, { type: "giant", x: 4010, y: 345 }],
      enemies: [{ type: "moth", x: 620, y: 430, patrol: [520,760] }, { type: "frog", x: 1330, y: 368, patrol: [1260,1490] }, { type: "bat", x: 2240, y: 285, patrol: [2160,2460] }, { type: "moth", x: 3370, y: 280, patrol: [3300,3560] }, { type: "beetle", x: 4040, y: 338, patrol: [3990,4230] }],
      hazards: [{ x: 430, y: 606, w: 90, h: 24 }, { x: 2075, y: 584, w: 82, h: 26 }, { x: 3840, y: 584, w: 130, h: 26 }],
      pads: [{ x: 760, y: 590, w: 60, h: 18 }, { x: 2490, y: 575, w: 60, h: 18 }],
      blocks: [block(3460, 307), block(3508, 307), block(3556, 307)],
      keys: [{ x: 3710, y: 405, taken: false }],
      gates: [{ x: 4615, y: 330, w: 48, h: 120, open: false }],
      checkpoints: [{ x: 2050, y: 360, active: false }, { x: 3860, y: 355, active: false }]
    },
    {
      name: "Level 3 - Crystal Caves",
      theme: "cave",
      width: 5350,
      height: 720,
      spawn: { x: 110, y: 420 },
      portal: { x: 5120, y: 414, w: 92, h: 150 },
      platforms: [ground(0, 540), ground(680, 420), ruin(1220, 505, 220), ground(1560, 460), move(2120, 495, 170, "x", 2030, 2360, 70), ruin(2520, 430, 230), fall(2850, 385, 170), ground(3160, 540), ruin(3820, 500, 220), move(4170, 440, 180, "y", 350, 520, 62), ruin(4520, 350, 260), ground(4870, 480)],
      gems: [[300,540],[740,540],[1260,455],[1660,540],[1820,540],[2180,445],[2580,380],[2880,335],[3240,540],[3950,450],[4230,330],[4590,300],[4960,540]],
      hiddenGems: [[1360,305],[3070,245],[4690,185]],
      powerups: [{ type: "charge", x: 760, y: 540 }, { type: "shield", x: 2540, y: 380 }, { type: "feather", x: 4210, y: 325 }],
      enemies: [{ type: "snail", x: 720, y: 548, patrol: [680,1100] }, { type: "bat", x: 1350, y: 405, patrol: [1200,1480] }, { type: "frog", x: 1690, y: 548, patrol: [1560,2020] }, { type: "snail", x: 3290, y: 548, patrol: [3160,3700] }, { type: "bat", x: 4620, y: 270, patrol: [4520,4780] }],
      hazards: [{ x: 565, y: 584, w: 105, h: 26 }, { x: 1120, y: 584, w: 100, h: 26 }, { x: 2420, y: 584, w: 96, h: 26 }, { x: 2990, y: 584, w: 150, h: 26 }, { x: 4775, y: 584, w: 90, h: 26 }],
      pads: [{ x: 1150, y: 590, w: 58, h: 18 }, { x: 3740, y: 590, w: 58, h: 18 }],
      blocks: [block(930, 562), block(978, 562), block(1026, 562), block(4440, 302), block(4488, 302)],
      keys: [{ x: 4720, y: 300, taken: false }],
      gates: [{ x: 5000, y: 490, w: 48, h: 120, open: false }],
      checkpoints: [{ x: 2360, y: 448, active: false }, { x: 4020, y: 452, active: false }]
    }
  ];
})();