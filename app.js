(() => {
  "use strict";

  window.addEventListener("load", async () => {
    try {
      await AR.loadAssets();
    } catch (error) {
      console.warn("Some visual assets could not be loaded.", error);
    }

    const game = new AR.Game();
    window.AR_GAME = game;
  });
})();
