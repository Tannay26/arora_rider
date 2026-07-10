(() => {
  "use strict";

  AR.ASSETS = {
    images: {},
    ready: false,
  };

  const FILES = {
    riderIdle: "assets/player/rider-elephant-idle.png",
    riderRun: "assets/player/rider-elephant-run.png",
    riderJump: "assets/player/rider-elephant-jump.png",
    riderPortrait: "assets/player/rider-portrait.png",

    forestSky: "assets/backgrounds/forest/sky.png",
    forestFar: "assets/backgrounds/forest/far-mountains.png",
    forestMid: "assets/backgrounds/forest/mid-jungle.png",
    forestFront: "assets/backgrounds/forest/front-foliage.png",

    grassGround: "assets/terrain/grass-ground.png",
    ruinPlatform: "assets/terrain/ruin-platform.png",
    stoneBlock: "assets/terrain/stone-block.png",
    bridge: "assets/terrain/bridge.png",

    wolf: "assets/enemies/wolf.png",
    boar: "assets/enemies/boar.png",
    spider: "assets/enemies/spider.png",
    guardian: "assets/enemies/guardian.png",

    heartFull: "assets/ui/heart-full.png",
    heartEmpty: "assets/ui/heart-empty.png",
    gemIcon: "assets/ui/gem.png",
    starIcon: "assets/ui/star.png",
    keyIcon: "assets/ui/key.png",
  };

  AR.loadAssets = async function () {
    const entries = Object.entries(FILES);

    const results = await Promise.allSettled(
      entries.map(([name, src]) => loadImage(name, src))
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const [name, src] = entries[index];
        console.warn(`Optional asset not loaded: ${name} (${src})`);
      }
    });

    AR.ASSETS.ready = true;
  };

  function loadImage(name, src) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        AR.ASSETS.images[name] = image;
        resolve(image);
      };

      image.onerror = () => {
        reject(new Error(`Could not load ${src}`));
      };

      image.src = src;
    });
  }

  AR.getImage = function (name) {
    return AR.ASSETS.images[name] || null;
  };
})();
