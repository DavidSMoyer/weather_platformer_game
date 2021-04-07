const rain = [];
let rainDelay = 100;
function weatherEffects(conditionData) {
  if (conditionData.temp <= -5) document.body.classList.add("cold");
  if (conditionData.temp >= 30) document.body.classList.add("hot");
  if (conditionData.weather === "Rain") document.body.classList.add("wet");
}

function RainParticle(x, y) {
  this.pos = {x: x, y: y};
  this.element = document.createElement("DIV");
  this.element.classList.add("rain");
}

RainParticle.prototype.move = function() {
  this.y -= 1;
  this.x -= 0.5;
}

function rainLoop() {

}