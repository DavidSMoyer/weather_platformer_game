const Sprite = function (imgSrc, width, height) {
  this.imgElm = document.createElement("img");
  this.imgElm.src = imgSrc;
  this.width = width;
  this.height = height;
};

Sprite.prototype.render = function (gameObject, engine) {
  engine.canvasCTX.drawImage(
    this.imgElm,
    gameObject.x,
    gameObject.y,
    this.width,
    this.height
  );
};

const BoxCollider = function (
  width,
  height,
  xOffset = 0,
  yOffset = 0,
  friction = 1,
  bounciness = 0
) {
  this.width = width;
  this.height = height;
  this.xOffset = xOffset - (width / 2);
  this.yOffset = yOffset - (height / 2);
  this.friction = friction;
  this.bounciness = bounciness;
  this.gameObject = null;
};

BoxCollider.prototype.renderOutline = function (gameObject, engine) {
  engine.canvasCTX.fillStyle = "#00AA00";
  engine.canvasCTX.beginPath();
  engine.canvasCTX.rect(
    gameObject.x + this.xOffset,
    gameObject.y + this.yOffset,
    this.width,
    this.height
  );
  engine.canvasCTX.stroke();

  engine.canvasCTX.fillStyle = "#FFFF00";
  engine.canvasCTX.beginPath();
  engine.canvasCTX.rect(
    gameObject.x + this.xOffset,
    gameObject.y + this.yOffset,
    1,
    1
  );
  engine.canvasCTX.stroke();
};

BoxCollider.prototype.isCollidingWith = function(collider) {
  const x1 = this.gameObject.x + this.xOffset;
  const y1 = this.gameObject.y + this.yOffset;
  const x2 = collider.gameObject.x + collider.xOffset;
  const y2 = collider.gameObject.y + collider.yOffset;
  if (y1 + this.height >= y2 && y1 <= y2 + collider.height && x1 <= x2 + collider.width && x1 + this.width >= x2) {
     //collision detected!
     //this.gameObject.y = y2 - this.height - this.yOffset;
     
     return { colliderA: this, colliderB: collider };
  }

  return false;
};

const PhysicsBody = function (gravity = 0.00098, mass = 1) {
  this.gravity = gravity;
  this.mass = mass;
  this.xVelocity = 0;
  this.yVelocity = 0;
  this.xFriction = 0;
  this.yFriction = 0;
  this.previousX = 0;
  this.previousY = 0;
};

PhysicsBody.prototype.updatePhysics = function (gameObject, engine) {
  const self = this;
  gameObject.x += this.xVelocity * engine.deltaTime;
  this.yVelocity += this.gravity * engine.deltaTime;
  gameObject.y += this.yVelocity * engine.deltaTime;
  engine.getAllColliders().forEach(collider => {
    if (collider.gameObject !== gameObject) {
      gameObject.getColliders().forEach(ownCollider => {
        const collision = ownCollider.isCollidingWith(collider);
        if (collision) {
          let yDepth = 0;
          let xDepth = 0;

          if (collision.colliderA.gameObject.y + collision.colliderA.yOffset + collision.colliderA.height <= collision.colliderB.gameObject.y + collision.colliderB.yOffset - (collision.colliderB.height/2)) {
            yDepth = collision.colliderA.gameObject.y + collision.colliderA.yOffset + collision.colliderA.height - collision.colliderB.gameObject.y + collision.colliderB.yOffset;
          } else {
            yDepth = collision.colliderB.gameObject.y + collision.colliderB.yOffset + collision.colliderB.height - collision.colliderA.gameObject.y + collision.colliderA.yOffset;
          }

          if (collision.colliderA.gameObject.x + collision.colliderA.xOffset + collision.colliderA.width <= collision.colliderB.gameObject.x + collision.colliderB.xOffset - (collision.colliderB.width/2)) {
            xDepth = collision.colliderA.gameObject.x + collision.colliderA.xOffset + collision.colliderA.height - collision.colliderB.gameObject.x + collision.colliderB.xOffset;
          } else {
            xDepth = collision.colliderB.gameObject.x + collision.colliderB.xOffset + collision.colliderB.height - collision.colliderA.gameObject.x + collision.colliderA.xOffset;
          }

          //console.log(xDepth, yDepth);

          if (xDepth < yDepth) {
            self.xFriction = collision.colliderA.friction + collision.colliderB.friction;
            self.yVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
            if(gameObject.y - this.previousY > 0) 
              gameObject.y = collision.colliderB.gameObject.y + collision.colliderB.yOffset - collision.colliderA.height - collision.colliderA.yOffset;
            else
              gameObject.y = collision.colliderB.gameObject.y + collision.colliderB.yOffset + collision.colliderB.height - collision.colliderA.yOffset;
            //self.yVelocity = 0;
          } else {
            self.yFriction = collision.colliderA.friction + collision.colliderB.friction;
            self.xVelocity *= -1 * (collision.colliderA.bounciness + collision.colliderB.bounciness);
            if(gameObject.x - this.previousX > 0) //Left side
              gameObject.x = collision.colliderB.gameObject.x + collision.colliderB.xOffset - collision.colliderA.width - collision.colliderA.xOffset;
            else
              gameObject.x = collision.colliderB.gameObject.x + collision.colliderB.xOffset + collision.colliderB.width - collision.colliderA.xOffset;
          }
        }
      });
    }
  });

  this.previousX = gameObject.x;
  this.previousY = gameObject.y;
};

const GameObject = function ( x, y, sprite = null, colliders = null, physicsBody = null ) {
  const self = this;
  this.x = x;
  this.y = y;
  this.sprite = sprite;
  this.colliders = colliders === null ? [] : colliders;
  this.physicsBody = physicsBody;
  this.colliders.forEach(collider => collider.gameObject = self);
};

GameObject.prototype.update = function (engine) {
  const object = this;
  if (this.physicsBody != null) this.physicsBody.updatePhysics(this, engine);
  this.colliders.forEach((collider) => collider.renderOutline(object, engine));
  if (this.sprite !== null) this.sprite.render(this, engine);

  engine.canvasCTX.fillStyle = "#FFFFFF";
  engine.canvasCTX.beginPath();
  engine.canvasCTX.rect(
    this.x,
    this.y,
    1,
    1
  );
  engine.canvasCTX.stroke();
};

GameObject.prototype.getColliders = function() {
  return this.colliders;
};

const Player = function(x, y, sprite = null, colliders = null, physicsBody = null) {
  const self = this;
  this.x = x;
  this.y = y;
  this.sprite = sprite;
  this.colliders = colliders === null ? [] : colliders;
  this.physicsBody = physicsBody;
  this.colliders.forEach(collider => collider.gameObject = self);
  this.input = {};

  document.addEventListener('keydown', (e => {
    this.input[e.keyCode] = true;
  }).bind(this));

  document.addEventListener('keyup', (e => {
    this.input[e.keyCode] = false;
  }).bind(this));
};

Player.prototype.update = function (engine) {
  const object = this;
  if (this.physicsBody != null) this.physicsBody.updatePhysics(this, engine);
  this.colliders.forEach((collider) => collider.renderOutline(object, engine));
  if (this.sprite !== null) this.sprite.render(this, engine);

  engine.canvasCTX.fillStyle = "#FFFFFF";
  engine.canvasCTX.beginPath();
  engine.canvasCTX.rect(
    this.x,
    this.y,
    1,
    1
  );
  engine.canvasCTX.stroke();

  console.log(this.input);
};

Player.prototype.getColliders = function() {
  return this.colliders;
};

const GameEngine = function (canvas) {
  this.canvas = canvas;
  this.canvasCTX = canvas.getContext("2d");
  this.gameObjects = [];
  canvas.width = 600;
  canvas.height = 400;
  window.addEventListener("resize", this.resizeCanvas.bind(this), false);
  this.resizeCanvas();
  this.clearScreen();
  this.deltaTime = 0;
  this.lastFrame = performance.now();
  this.updateInterval = setInterval(this.update.bind(this), 1);
};

GameEngine.prototype.clearScreen = function () {
  this.canvasCTX.fillStyle = "#AAAAAA";
  this.canvasCTX.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

GameEngine.prototype.update = function () {
  const engine = this;
  const now = performance.now();
  //console.log(this.deltaTime);
  this.deltaTime = now - this.lastFrame;
  this.lastFrame = now;
  this.clearScreen();
  this.gameObjects.forEach((gameObject) => gameObject.update(engine));
};

GameEngine.prototype.addGameObject = function (gameObject) {
  this.gameObjects.push(gameObject);
};

GameEngine.prototype.getAllColliders = function() {
  const colliders = [];
  this.gameObjects.forEach(gameObject => colliders.push(...gameObject.getColliders()));
  return colliders;
};

GameEngine.prototype.resizeCanvas = function () {
  const ratio = Math.min(window.innerWidth / 600, window.innerHeight / 400);
  this.canvas.style.width = (this.canvas.width * ratio) + "px";
  this.canvas.style.height = (this.canvas.height * ratio) + "px";
};
