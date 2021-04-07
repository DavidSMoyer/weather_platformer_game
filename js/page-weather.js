let rain = [];
let rainDelay = 100;
const rainCanvas = document.querySelector("#rainLayer");
const context = rainCanvas.getContext("2d");
function weatherEffects(conditionData) {
  if (conditionData.temp <= -5) document.body.classList.add("cold");
  if (conditionData.temp >= 30) document.body.classList.add("hot");
  if (conditionData.weather === "Rain") {
    document.body.classList.add("wet");
    setInterval(rainLoop, 10)
  }
}

function RainParticle(x, y) {
  this.pos = {x: x, y: y};
}

RainParticle.prototype.move = function() {
  this.pos.y += 6;
  this.pos.x -= 3;
  context.strokeStyle = "#6777bf";
  context.beginPath();
  context.moveTo(this.pos.x, this.pos.y);
  context.lineTo(this.pos.x - 20, this.pos.y + 40);
  context.stroke();
}

function rainLoop() {
  context.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
  rainDelay--;
  if (rainDelay <= 0) {
    rain.push(new RainParticle(randInt(0, 1700), -10));
    rain.push(new RainParticle(randInt(0, 1700), -10));
    rainDelay = 3;
  }
  rain.forEach(drop => drop.move());
}

function randInt(min, max) {
  return Math.floor(Math.random() * max) + min;
}