(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const debugPanel = document.getElementById("debugPanel");

  const WORLD = {
    width: 1600,
    height: 900,
    groundY: 690,
    leftBoundary: 90,
    rightBoundary: 1510,
  };

  const COLORS = {
    skyTop: "#7bb7e8",
    skyBottom: "#dcecff",
    ground: "#3f6b3d",
    groundLine: "#28492a",
    playerBase: "#4d79c7",
    enemyBase: "#b64949",
    hero: "#f3b34c",
    heroTrim: "#273447",
    hpBack: "#2a1d24",
    hpFill: "#52d273",
  };

  class InputManager {
    constructor() {
      this.keys = new Set();

      window.addEventListener("keydown", (event) => {
        if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(event.code)) {
          event.preventDefault();
          this.keys.add(event.code);
        }
      });

      window.addEventListener("keyup", (event) => {
        this.keys.delete(event.code);
      });
    }

    axisX() {
      const left = this.keys.has("ArrowLeft") || this.keys.has("KeyA");
      const right = this.keys.has("ArrowRight") || this.keys.has("KeyD");
      return (right ? 1 : 0) - (left ? 1 : 0);
    }
  }

  class Health {
    constructor(max) {
      this.max = max;
      this.current = max;
    }

    get ratio() {
      return Math.max(0, Math.min(1, this.current / this.max));
    }
  }

  class Entity {
    constructor({ x, y, width, height, color }) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.velocityX = 0;
      this.animationTime = 0;
      this.health = null;
      this.dead = false;
    }

    get bounds() {
      return {
        left: this.x,
        right: this.x + this.width,
        top: this.y,
        bottom: this.y + this.height,
      };
    }

    update(dt) {
      this.animationTime += dt;
      this.x += this.velocityX * dt;
    }

    draw(context) {
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  class Hero extends Entity {
    constructor() {
      super({
        x: 210,
        y: WORLD.groundY - 72,
        width: 44,
        height: 72,
        color: COLORS.hero,
      });
      this.name = "Arora Rider";
      this.speed = 275;
      this.health = new Health(120);
    }

    update(dt, input) {
      this.velocityX = input.axisX() * this.speed;
      super.update(dt);
      this.x = clamp(this.x, WORLD.leftBoundary, WORLD.rightBoundary - this.width);
    }

    draw(context) {
      const bob = Math.sin(this.animationTime * 10) * 2;

      context.fillStyle = this.color;
      context.fillRect(this.x, this.y + bob, this.width, this.height);

      context.fillStyle = COLORS.heroTrim;
      context.fillRect(this.x + 8, this.y + 12 + bob, this.width - 16, 12);

      context.fillStyle = "#ffd77a";
      context.beginPath();
      context.arc(this.x + this.width / 2, this.y - 8 + bob, 17, 0, Math.PI * 2);
      context.fill();

      drawHealthBar(context, this.x - 10, this.y - 42 + bob, this.width + 20, 8, this.health.ratio);
    }
  }

  class EntityManager {
    constructor() {
      this.entities = [];
    }

    add(entity) {
      this.entities.push(entity);
      return entity;
    }

    update(dt, input) {
      for (const entity of this.entities) {
        if (entity instanceof Hero) {
          entity.update(dt, input);
        } else {
          entity.update(dt);
        }
      }

      this.entities = this.entities.filter((entity) => !entity.dead);
    }

    draw(context) {
      for (const entity of this.entities) {
        entity.draw(context);
      }
    }
  }

  class CollisionSystem {
    static intersects(a, b) {
      const ab = a.bounds;
      const bb = b.bounds;
      return ab.left < bb.right && ab.right > bb.left && ab.top < bb.bottom && ab.bottom > bb.top;
    }
  }

  class Game {
    constructor() {
      this.input = new InputManager();
      this.entities = new EntityManager();
      this.collision = CollisionSystem;
      this.hero = this.entities.add(new Hero());
      this.lastTime = performance.now();
      this.fps = 60;
      this.frameSmoothing = 0.9;

      this.resize();
      window.addEventListener("resize", () => this.resize());
      requestAnimationFrame((time) => this.loop(time));
    }

    resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0);
    }

    loop(time) {
      const rawDt = (time - this.lastTime) / 1000;
      const dt = Math.min(rawDt, 1 / 30);
      this.lastTime = time;
      this.fps = this.fps * this.frameSmoothing + (1 / Math.max(rawDt, 0.001)) * (1 - this.frameSmoothing);

      this.update(dt);
      this.render();

      requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    update(dt) {
      this.entities.update(dt, this.input);
    }

    render() {
      drawBackground(ctx);
      drawBattlefield(ctx);
      this.entities.draw(ctx);
      this.renderDebug();
    }

    renderDebug() {
      debugPanel.innerHTML = [
        `FPS: ${Math.round(this.fps)}`,
        `Hero HP: ${Math.round(this.hero.health.current)} / ${this.hero.health.max}`,
        `Hero Position: ${Math.round(this.hero.x)}, ${Math.round(this.hero.y)}`,
      ].join("<br>");
    }
  }

  function drawBackground(context) {
    const gradient = context.createLinearGradient(0, 0, 0, WORLD.groundY);
    gradient.addColorStop(0, COLORS.skyTop);
    gradient.addColorStop(1, COLORS.skyBottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, WORLD.width, WORLD.height);

    context.fillStyle = "rgba(255, 255, 255, 0.58)";
    drawCloud(context, 280, 150, 1.1);
    drawCloud(context, 850, 95, 0.9);
    drawCloud(context, 1210, 190, 1.25);
  }

  function drawBattlefield(context) {
    context.fillStyle = COLORS.ground;
    context.fillRect(0, WORLD.groundY, WORLD.width, WORLD.height - WORLD.groundY);

    context.fillStyle = COLORS.groundLine;
    context.fillRect(0, WORLD.groundY, WORLD.width, 10);

    drawBase(context, 24, WORLD.groundY - 170, COLORS.playerBase, "Player Base");
    drawBase(context, WORLD.width - 154, WORLD.groundY - 170, COLORS.enemyBase, "Enemy Base");
  }

  function drawBase(context, x, y, color, label) {
    context.fillStyle = color;
    context.fillRect(x, y, 130, 170);

    context.fillStyle = "rgba(255, 255, 255, 0.25)";
    context.fillRect(x + 18, y + 25, 34, 38);
    context.fillRect(x + 78, y + 25, 34, 38);

    context.fillStyle = "#172033";
    context.font = "22px Arial";
    context.textAlign = "center";
    context.fillText(label, x + 65, y - 18);
  }

  function drawCloud(context, x, y, scale) {
    context.beginPath();
    context.arc(x, y, 34 * scale, 0, Math.PI * 2);
    context.arc(x + 38 * scale, y - 10 * scale, 42 * scale, 0, Math.PI * 2);
    context.arc(x + 84 * scale, y, 32 * scale, 0, Math.PI * 2);
    context.rect(x - 10 * scale, y, 112 * scale, 32 * scale);
    context.fill();
  }

  function drawHealthBar(context, x, y, width, height, ratio) {
    context.fillStyle = COLORS.hpBack;
    context.fillRect(x, y, width, height);

    context.fillStyle = COLORS.hpFill;
    context.fillRect(x, y, width * ratio, height);

    context.strokeStyle = "rgba(255, 255, 255, 0.8)";
    context.lineWidth = 2;
    context.strokeRect(x, y, width, height);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  new Game();
})();
