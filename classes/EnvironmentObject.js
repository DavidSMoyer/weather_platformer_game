import WorldObject from "./WorldObject.js";

export const objsEnum = Object.freeze({
	"block":0,
	"rampA":1,
	"rampB":2,
	"rampC":3,
	"rampD":4,
	"coin":5,
	"finish":6
});

export const objSizes = Object.freeze({
	[objsEnum.block]: [20, 20],
	[objsEnum.rampA]: [20, 20],
	[objsEnum.rampB]: [20, 20],
	[objsEnum.rampC]: [20, 20],
	[objsEnum.rampD]: [20, 20],
	[objsEnum.coin]: [10, 15],
	[objsEnum.finish]: [20, 40]
});

export default class EnvironmentObject extends WorldObject {
	constructor(x, y, type) {
		super(x, y, objSizes[type][0], objSizes[type][1]);

		this.draw = (canv) => {
			canv.fill({r:0,g:255,b:0});
			canv.rect(this.col.pos.x, this.col.pos.y, this.col.size.x, this.col.size.y);
		}
	}
}