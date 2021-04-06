import Player from "./classes/Player.js";
import { Canvas } from "./lib.js";

const canv = new Canvas(document.getElementById("mainCanvas"));

const keys = {};

let test = new Player(10, 50, 20, 20);

console.log(test);

const update = () => {
	test.update(keys);
}

const draw = () => {
	canv.background({r: 128, g: 128, b: 128});
	canv.fill({r:255, g:0, b:0});
	canv.noStroke();
	test.draw(canv);
}

const loop = () => {
	update();
	draw();
}

window.addEventListener("keydown", (evt) => {
	keys[evt.key] = true;
	evt.preventDefault();
	return false;
});
window.addEventListener("keyup", (evt) => {
	keys[evt.key] = false;
	evt.preventDefault();
	return false;
});

setInterval(loop, 1000/60);