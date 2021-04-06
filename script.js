import Player from "./classes/Player.js";
import { Canvas } from "./lib.js";

const canv = new Canvas(document.getElementById("mainCanvas"));

let test = new Player(10, 50, 20, 20);

console.log(test);

const update = () => {
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

setInterval(loop, 1000/60);