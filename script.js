import Player from "./classes/Player.js";
import EnvironmentObject, { objsEnum } from "./classes/EnvironmentObject.js";
import { Canvas } from "./lib.js";

const canv = new Canvas(document.getElementById("mainCanvas"));

const keys = {};

let player = new Player(10, 50, 20, 20);
let testEnv = new EnvironmentObject(200, 450, objsEnum.block);

console.log(player);

const update = () => {
	player.update(keys, [testEnv]);
}

const draw = () => {
	canv.background({r: 128, g: 128, b: 128});
	canv.fill({r:255, g:0, b:0});
	canv.noStroke();
	player.draw(canv);
	testEnv.draw(canv);
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