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

//Speed in FPS
const Sprite = function (imgSrc, width = 10, height = 10, speed = 1, xOffset = 0, yOffset = 0) {
  Component.call(this, "Sprite");
  this.changeAnimation(imgSrc, width, height, speed, xOffset, yOffset);
  this.paused = false;
};

Sprite.prototype = Object.create(Component.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.changeAnimation = function(imgSrc, width = null, height = null, speed = null, xOffset = null, yOffset = null) {
  if (Array.isArray(imgSrc))
    this.srcList = imgSrc;
  else
    this.srcList = [imgSrc];

  this.frames = [];
  this.srcList.forEach(img => {
    const elm = document.createElement("img");
    elm.src = img;
    this.frames.push(elm);
  });

  this.frameTime = 1000/(speed === null?this.speed:speed);
  this.width = width === null?this.width:width;
  this.height = height === null?this.height:height;
  this.xOffset = xOffset === null?this.xOffset:(xOffset - (this.width/2));
  this.yOffset = yOffset === null?this.yOffset:(yOffset - (this.height/2));
  this.frameIndex = 0;
  this.lastFrame = performance.now();
};

Sprite.prototype.update = function (engine) {
  if (!this.paused) {
    const now = performance.now();
    if (now - this.lastFrame > this.frameTime) {
      ++this.frameIndex;
      this.lastFrame = now;
      if (this.frameIndex >= this.frames.length)
        this.frameIndex = 0;
    }
  }

  engine.canvasCTX.drawImage(
    this.frames[this.frameIndex],
    this.parentObject.x + this.xOffset,
    this.parentObject.y + this.yOffset,
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

BoxCollider.prototype.collided = function(collision, engine) {
  if (this.collisionFun) this.collisionFun(collision, engine);
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
  this.collidingSide = PhysicsBody.SIDE.NONE;
};

PhysicsBody.prototype = Object.create(Component.prototype);
PhysicsBody.prototype.constructor = PhysicsBody;

PhysicsBody.SIDE = Object.freeze({
  "NONE": 0,
  "TOP": 1,
  "BOTTOM": 2,
  "LEFT": 3,
  "RIGHT": 4,
});

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
  this.collidingSide = PhysicsBody.SIDE.NONE;
  engine.getAllColliders().forEach(collider => {
    if (collider.parentObject !== self.parentObject) {
      const collision = self.parentObject.getCollider().isCollidingWith(collider, engine);
      if (collision) {
        this.inAir = false;

        if( Math.abs((collision.colliderB.parentObject.y + collision.colliderB.yOffset + collision.colliderB.height) - (collision.colliderA.parentObject.y + collision.colliderA.yOffset)) < collisionTolerance) { //Top Collision
          self.xFriction = collision.colliderA.friction + collision.colliderB.friction;
          self.yVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
          collision.colliderA.parentObject.y = -collision.colliderA.yOffset + (collision.colliderB.parentObject.y + collision.colliderB.yOffset + collision.colliderB.height);
          this.collidingSide = PhysicsBody.SIDE.TOP;
        }

        if( Math.abs((collision.colliderA.parentObject.x + collision.colliderA.xOffset + collision.colliderA.width) - (collision.colliderB.parentObject.x + collision.colliderB.xOffset)) < collisionTolerance) { //Left Collision
          self.yFriction = collision.colliderA.friction + collision.colliderB.friction;
          self.xVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
          collision.colliderA.parentObject.x = -collision.colliderA.xOffset - collision.colliderA.width + (collision.colliderB.parentObject.x + collision.colliderB.xOffset);
          this.collidingSide = PhysicsBody.SIDE.LEFT;
        }

        if( Math.abs((collision.colliderB.parentObject.x + collision.colliderB.xOffset + collision.colliderB.width) - (collision.colliderA.parentObject.x + collision.colliderA.xOffset)) < collisionTolerance) { //Right Collision
          self.yFriction = collision.colliderA.friction + collision.colliderB.friction;
          self.xVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
          collision.colliderA.parentObject.x = -collision.colliderA.xOffset + (collision.colliderB.parentObject.x + collision.colliderB.xOffset + collision.colliderB.width);
          this.collidingSide = PhysicsBody.SIDE.RIGHT;
        }

        if( Math.abs((collision.colliderA.parentObject.y + collision.colliderA.yOffset + collision.colliderA.height) - (collision.colliderB.parentObject.y + collision.colliderB.yOffset)) < collisionTolerance) { //Bottom Collision
          self.xFriction = collision.colliderA.friction + collision.colliderB.friction;
          self.yVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
          collision.colliderA.parentObject.y = -collision.colliderA.yOffset - collision.colliderA.height + (collision.colliderB.parentObject.y + collision.colliderB.yOffset);
          this.collidingSide = PhysicsBody.SIDE.BOTTOM;
        }
      }
    }
  });
};

PhysicsBody.prototype.getOnGround = function() {
  return !this.inAir;
};

PhysicsBody.prototype.getCollidingSide = function() {
  return this.collidingSide;
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
  if (this.collider !== null && this.sprite === null)
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
  if (this.y > 700) {
    engine.stop();
    return;
  }
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

const GameEngine = function (canvas, levelData) {
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
  this.endFun = null;
  this.hasWon = false;
  if (levelData) {
    this.levelTime = levelData.time;
    const self = this;
    levelData.objects.forEach(obj => {
      self.addGameObject(GameEngine.PREFABS[obj.type](...obj.params));
    });
  } else {
    this.levelTime = 10000;
  }
  this.gameStartTime = performance.now();
};

GameEngine.prototype.onEnd = function(fun) {
  this.endFun = fun;
};

GameEngine.prototype.getWon = function() {
  return this.hasWon;
};

GameEngine.prototype.getTime = function() {
  if (this.time) return this.time;
  return performance.now() - this.gameStartTime;
};

GameEngine.prototype.setWon = function() {
  this.hasWon = true;
};

GameEngine.prototype.addCoin = function() {
  ++this.coinCount;
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

  if (now - this.gameStartTime >= this.levelTime) {
    this.stop();
    return;
  }

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
  this.gameObjects.forEach(gameObject => {if (gameObject.getEnabled()) colliders.push(gameObject.getCollider());});
  return colliders;
};

GameEngine.prototype.resizeCanvas = function () {
  const ratio = Math.min(window.innerWidth / 600, window.innerHeight / 400);
  this.canvas.style.width = (this.canvas.width * ratio) + "px";
  this.canvas.style.height = (this.canvas.height * ratio) + "px";
};

GameEngine.prototype.stop = function() {
  clearInterval(this.updateInterval);
  this.gameObjects.forEach(gameObject => gameObject.stop());
  this.time = performance.now - this.gameStartTime;
  if (this.endFun) this.endFun(this);
};

GameEngine.PREFABS = Object.freeze({
  Player: function(x, y) {
    return new Player(x, y, new BoxCollider(20,50,0,0,0.001), new PhysicsBody(), new Sprite(["images/walk/1.png", "images/walk/2.png", "images/walk/3.png" , "images/walk/4.png", "images/walk/5.png", "images/walk/6.png", "images/walk/7.png"], 20, 50, 8));
  },
  Coin: function(x, y) {
    const collider = new BoxCollider(15.5,15.5,0,0,0,0,true);
    collider.onCollision((c, e) => {
      if (c.colliderA.parentObject instanceof Player) {
        e.addCoin();
        c.colliderB.parentObject.setEnabled(false);
      }
    });
    return new GameObject(x, y, collider, new Sprite(["images/coin/1.png", "images/coin/2.png", "images/coin/3.png" , "images/coin/4.png", "images/coin/5.png", "images/coin/6.png", "images/coin/7.png"], 15.5, 15.5, 7));
  },
  Flag: function(x, y) {
    const collider = new BoxCollider(16,39,0,0,0,0,true);
    collider.onCollision((c, e) => {
      if (c.colliderA.parentObject instanceof Player) {
        e.setWon();
        e.stop();
      }
    });
    return new GameObject(x, y, collider, new Sprite("images/flag.png", 16, 39));
  },
  Platform: function(x, y, width, height, bounce = false) {
    return new GameObject(x, y, new BoxCollider(width, height, 0,0,0,bounce?1:0));
  },
});
