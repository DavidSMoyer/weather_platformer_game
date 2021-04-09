// Variables for rain effects
let rain = [];
let rainDelay = 100;
const rainCanvas = document.querySelector("#rainLayer");
const context = rainCanvas.getContext("2d");

// Loads in the conditionData from the general script
function weatherEffects() {
  // conditionData.time.getHours() > 8 && conditionData.time.getHours() < 19
  if (true) {
    //document.body.style.background = "linear-gradient(to left, black, black)";
  }
  if (GlobalObject.conditionData.temp <= -5) document.body.classList.add("cold");
  if (GlobalObject.conditionData.temp >= 30) document.body.classList.add("hot");
  if (GlobalObject.conditionData.weather === "Rain") {
    document.body.classList.add("wet");
    setInterval(rainLoop, 10, GlobalObject.conditionData.temp)
  }
}

// Rain particle class
function RainParticle(x, y) {
  this.pos = {x: x, y: y};
}

RainParticle.prototype.move = function(temp) {
  context.strokeStyle = "#6777bf";
  if (temp <= -5) {
    this.pos.y += 2;
    this.pos.x -= 1;
    context.strokeStyle = "#fdfdfd";
  } else {
    this.pos.y += 6;
    this.pos.x -= 3;
    if (temp >= 30) context.strokeStyle = "#48735b";
  }

  context.beginPath();
  if (temp > -5) {
    context.moveTo(this.pos.x, this.pos.y);
    context.lineTo(this.pos.x - 20, this.pos.y + 40);
  } else {
    context.moveTo(this.pos.x - 7.5, this.pos.y);
    context.lineTo(this.pos.x + 5, this.pos.y + 10);
    context.moveTo(this.pos.x, this.pos.y);
    context.lineTo(this.pos.x - 5, this.pos.y + 10);
  }
  context.stroke();
}

// Canvas rain loop
function rainLoop(temp) {
  context.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
  rainDelay--;
  if (rainDelay <= 0) {
    rain.push(new RainParticle(randInt(0, 1700), -10));
    rain.push(new RainParticle(randInt(0, 1700), -10));
    if (temp > -5) rainDelay = 3;
    else rainDelay = 10;
  }
  rain.forEach(drop => drop.move(temp));
}

// Simple random int function
function randInt(min, max) {
  return Math.floor(Math.random() * max) + min;
}