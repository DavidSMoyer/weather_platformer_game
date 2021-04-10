const Component = function(type = "BaseComponent") {
  this.parentObject = null;
  this.type = type;
};

Component.prototype.setParent = function(obj) {
  this.parentObject = obj;
};

Component.prototype.getType = function() {
  return this.type;
};

Component.prototype.update = function() { };

const Sprite = function (imgSrc, width, height, animDelay) {
  Component.call(this, "Sprite");
  this.imgElm = document.createElement("img");
  this.srcList = [...imgSrc];
  this.imgElm.src = this.srcList[0];
  this.width = width;
  this.height = height;
  this.animDelay = animDelay;
  this.animMaxDelay = animMaxDelay;
  this.frame = 0;
  this.paused = !Array.isArray(imgSrc);
};

Sprite.prototype = Object.create(Component.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.update = function (engine) {
  // if (!this.paused) {
  //   this.animDelay--;
  //   if (this.animDelay > 0) break;
  //   this.animDelay = this.animMaxDelay;
  //   this.frame++;
  //   if (this.frame >= this.srcList.length) this.frame = 0;
  //   this.imgElm.src = this.srcList[this.frame];
  // }
  engine.canvasCTX.drawImage(
    this.imgElm,
    this.parentObject.x,
    this.parentObject.y,
    this.width,
    this.height
  );
};

const BoxCollider = function ( width, height, xOffset = 0, yOffset = 0, friction = 0, bounciness = 0, isTrigger = false ) {
  Component.call(this, "Collider");
  this.width = width;
  this.height = height;
  this.xOffset = xOffset - (width / 2);
  this.yOffset = yOffset - (height / 2);
  this.friction = friction;
  this.bounciness = bounciness;
  this.isTrigger = isTrigger;
  this.collisionFun = null;
};

BoxCollider.prototype = Object.create(Component.prototype);
BoxCollider.prototype.constructor = BoxCollider;

BoxCollider.prototype.update = function (engine) {
  engine.canvasCTX.fillStyle = "#00AA00";
  engine.canvasCTX.beginPath();
  engine.canvasCTX.rect(
    this.parentObject.x + this.xOffset,
    this.parentObject.y + this.yOffset,
    this.width,
    this.height
  );
  engine.canvasCTX.stroke();
};

BoxCollider.prototype.isCollidingWith = function(collider, engine) {
  const x1 = this.parentObject.x + this.xOffset;
  const y1 = this.parentObject.y + this.yOffset;
  const x2 = collider.parentObject.x + collider.xOffset;
  const y2 = collider.parentObject.y + collider.yOffset;
  if (y1 + this.height >= y2 && y1 <= y2 + collider.height && x1 <= x2 + collider.width && x1 + this.width >= x2) {
    if (this.isTrigger) {
      this.collided({ colliderA: this, colliderB: collider }, engine);
      return false;
    }

    if (collider.isTrigger) {
      collider.collided({ colliderA: this, colliderB: collider }, engine);
      return false;
    }

    return { colliderA: this, colliderB: collider };
  }

  return false;
};

BoxCollider.prototype.onCollision = function(fun) {
  this.collisionFun = fun;
};

BoxCollider.prototype.collided = function(collision) {
  if (this.collisionFun) this.collisionFun(collision);
};

const PhysicsBody = function (gravity = 0.00098, mass = 1) {
  Component.call(this, "PhysicsBody");
  this.gravity = gravity;
  this.mass = mass;
  this.xVelocity = 0;
  this.yVelocity = 0;
  this.xFriction = 0;
  this.yFriction = 0;
  this.inAir = true;
};

PhysicsBody.prototype = Object.create(Component.prototype);
PhysicsBody.prototype.constructor = PhysicsBody;

PhysicsBody.prototype.update = function (engine) {
  const collisionTolerance = 2;
  const self = this;

  //Update Friction
  this.yVelocity += this.gravity * engine.deltaTime;
  if (this.yVelocity > 0) {
    this.yVelocity -= this.yFriction * this.mass * engine.deltaTime;
    if (this.yVelocity < 0) this.yVelocity = 0;
  } else {
    this.yVelocity += this.yFriction * this.mass * engine.deltaTime;
    if (this.yVelocity > 0) this.yVelocity = 0;
  }

  if (this.xVelocity > 0) {
    this.xVelocity -= this.xFriction * this.mass * engine.deltaTime;
    if (this.xVelocity < 0) this.xVelocity = 0;
  } else {
    this.xVelocity += this.xFriction * this.mass * engine.deltaTime;
    if (this.xVelocity > 0) this.xVelocity = 0;
  }

  this.xFriction = 0;
  this.yFriction = 0;

  //Apply Velocity
  this.parentObject.y += this.yVelocity * engine.deltaTime;
  this.parentObject.x += this.xVelocity * engine.deltaTime;

  //Check Collisions
  this.inAir = true;
  engine.getAllColliders().forEach(collider => {
    if (collider.parentObject !== self.parentObject) {
      const collision = self.parentObject.getCollider().isCollidingWith(collider);
      if (collision) {
        this.inAir = false;
        if( Math.abs((collision.colliderA.parentObject.y + collision.colliderA.yOffset + collision.colliderA.height) - (collision.colliderB.parentObject.y + collision.colliderB.yOffset)) < collisionTolerance) { //Bottom Collision
          self.xFriction = collision.colliderA.friction + collision.colliderB.friction;
          self.yVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
          collision.colliderA.parentObject.y = -collision.colliderA.yOffset - collision.colliderA.height + (collision.colliderB.parentObject.y + collision.colliderB.yOffset);
        }

        if( Math.abs((collision.colliderB.parentObject.y + collision.colliderB.yOffset + collision.colliderB.height) - (collision.colliderA.parentObject.y + collision.colliderA.yOffset)) < collisionTolerance) { //Top Collision
          self.xFriction = collision.colliderA.friction + collision.colliderB.friction;
          self.yVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
          collision.colliderA.parentObject.y = -collision.colliderA.yOffset + (collision.colliderB.parentObject.y + collision.colliderB.yOffset + collision.colliderB.height);
        }

        if( Math.abs((collision.colliderA.parentObject.x + collision.colliderA.xOffset + collision.colliderA.width) - (collision.colliderB.parentObject.x + collision.colliderB.xOffset)) < collisionTolerance) { //Left Collision
          self.yFriction = collision.colliderA.friction + collision.colliderB.friction;
          self.xVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
          collision.colliderA.parentObject.x = -collision.colliderA.xOffset - collision.colliderA.width + (collision.colliderB.parentObject.x + collision.colliderB.xOffset);
        }

        if( Math.abs((collision.colliderB.parentObject.x + collision.colliderB.xOffset + collision.colliderB.width) - (collision.colliderA.parentObject.x + collision.colliderA.xOffset)) < collisionTolerance) { //Right Collision
          self.yFriction = collision.colliderA.friction + collision.colliderB.friction;
          self.xVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
          collision.colliderA.parentObject.x = -collision.colliderA.xOffset + (collision.colliderB.parentObject.x + collision.colliderB.xOffset + collision.colliderB.width);
        }
      }
    }
  });
};

PhysicsBody.prototype.getOnGround = function() {
  return !this.inAir;
};

const GameObject = function ( x = 0, y = 0, ...components ) {
  this.x = x;
  this.y = y;
  this.enabled = true;
  this.sprite = null;
  this.collider = null;
  this.physicsBody = null;
  this.components = [];
  this.type = "GameObject";
  const self = this;
  components.forEach(c => self.addComponent(c));
};

GameObject.prototype.setEnabled = function(en) {
  this.enabled = en;
}

GameObject.prototype.getEnabled = function() {
  return this.enabled;
}

GameObject.prototype.addComponent = function(component) {
  if (component && component instanceof Component) {
    component.setParent(this);
    switch(component.getType()) {
      case "Sprite":
        this.sprite = component;
        break;
      case "Collider":
        this.collider = component;
        break;
      case "PhysicsBody":
        if (this.collider != null)
          this.physicsBody = component;
        break;
      default:
        this.components.push(component);
        break;
    }
  }
};

GameObject.prototype.update = function (engine) {
  if (this.physicsBody !== null)
    this.physicsBody.update(engine);
  if (this.collider !== null)
    this.collider.update(engine);
  if (this.sprite !== null)
    this.sprite.update(engine);

  this.components.forEach((c) => c.update(engine));
};

GameObject.prototype.getType = function() {
  return this.type;
};

GameObject.prototype.setType = function(t) {
  this.type = t;
};

GameObject.prototype.getCollider = function() {
  return this.collider;
};

GameObject.prototype.stop = function() { };

const Player = function(...params) {
  GameObject.call(this, ...params);
  this.type = "Player";

  const self = this;
  this.input = {};
  this.events = [
    {
      type: "keydown",
      fun: e => {
        self.input[e.keyCode] = true;
        e.preventDefault();
      },
    },
    {
      type: "keyup",
      fun: e => {
        self.input[e.keyCode] = false;
        e.preventDefault();
      },
    },
  ];

  this.events.forEach(e => document.addEventListener(e.type, e.fun));
};

Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function (engine) {
  if (this.input[39])
    this.physicsBody.xVelocity = 0.06;
  else if (this.input[37])
    this.physicsBody.xVelocity = -0.06;

  if (this.input[38] && this.physicsBody !== null && this.physicsBody.getOnGround())
    this.physicsBody.yVelocity = -0.3;

  GameObject.prototype.update.call(this, engine);
};

Player.prototype.getColliders = function() {
  return this.colliders;
};

Player.prototype.stop = function() {
  this.events.forEach(e => document.removeEventListener(e.type, e.fun));
};

const GameEngine = function (canvas) {
  this.canvas = canvas;
  this.canvasCTX = canvas.getContext("2d");
  this.gameObjects = [];
  this.coinCount = 0;
  canvas.width = 600;
  canvas.height = 400;
  window.addEventListener("resize", this.resizeCanvas.bind(this), false);
  this.resizeCanvas();
  this.clearScreen();
  this.deltaTime = 0;
  this.lastFrame = performance.now();
  this.updateInterval = setInterval(this.update.bind(this), 1);
  this.coinCount = 0;
  this.levelTime = 10000;
  this.gameOverTimer = setTimeout(this.stop.bind(this), this.levelTime);
  this.endFun = null;
};

GameEngine.prototype.onEnd = function(fun) {
  this.endFun = fun;
}

GameEngine.prototype.addCoin = function() {
  this.coinCount++;
};

GameEngine.prototype.getCoins = function() {
  return this.coinCount;
};

GameEngine.prototype.clearScreen = function () {
  this.canvasCTX.fillStyle = "#AAAAAA";
  this.canvasCTX.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

GameEngine.prototype.update = function () {
  const engine = this;
  const now = performance.now();
  this.deltaTime = now - this.lastFrame;
  this.lastFrame = now;
  this.clearScreen();
  this.gameObjects.forEach((gameObject) => { if(gameObject.getEnabled()) gameObject.update(engine)});
};

GameEngine.prototype.addGameObject = function (gameObject) {
  if (gameObject && gameObject instanceof GameObject)
    this.gameObjects.push(gameObject);
};

GameEngine.prototype.getAllColliders = function() {
  const colliders = [];
  this.gameObjects.forEach(gameObject => colliders.push(gameObject.getCollider()));
  return colliders;
};

GameEngine.prototype.resizeCanvas = function () {
  const ratio = Math.min(window.innerWidth / 600, window.innerHeight / 400);
  this.canvas.style.width = (this.canvas.width * ratio) + "px";
  this.canvas.style.height = (this.canvas.height * ratio) + "px";
};

GameEngine.prototype.stop = function() {
  clearInterval(this.updateInterval);
  clearTimeout(this.gameOverTimer);
  this.gameObjects.forEach(gameObject => gameObject.stop());
  if (this.endFun) this.endFun(this);
};

const PREFABS = Object.freeze({
  Player: function(x, y) {
    return new Player(x, y, new BoxCollider(10, 10, 0,0,0.001), new PhysicsBody())
  },
  Coin: function(x, y) {
    const collider = new BoxCollider(10, 10,0,0,0,0,true);
    collider.onCollision(c => {
      if (c.colliderA.parentObject instanceof Player) {
        c.colliderA.parentObject.addCoin();
        c.colliderB.parentObject.setEnabled(false);
      }
    });
    return new GameObject(x, y, collider);
  },
  Flag: function(x, y) {
    const collider = new BoxCollider(10, 10,0,0,0,0,true);
    collider.onCollision(c => {
      if (c.colliderA.parentObject instanceof Player) {
        c.colliderA.parentObject.addCoin();
        c.colliderB.parentObject.setEnabled(false);
      }
    });
    return new GameObject(x, y, collider);
  },
  Platform: function(x, y, width, height, bounce = false) {
    return new GameObject(x, y, new BoxCollider(width, height, 0,0,0,bounce?1:0));
  },
});
