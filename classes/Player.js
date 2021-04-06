import PhysicsObject from "./PhysicsObject.js";

/**
 * Class for the player
 * @extends PhysicsObject
 */
export default class Player extends PhysicsObject {
	static influenceFrames = 10;
	static jumpForce = -5;

	constructor(x, y) {
		super(x, y, 20, 20);
		this.canJump = false;
		this.jumpInfluenceFrames = 0;
	}

	update = (keys) => {
		this.col.vel.x = 0;
		if(keys.w) {
			if(this.canJump) {
				this.canJump = false;
				this.col.vel.y = Player.jumpForce;
				this.jumpInfluenceFrames = Player.influenceFrames;
			} else if (this.jumpInfluenceFrames > 0) {
				this.col.vel.y = Player.jumpForce - (Player.influenceFrames - this.jumpInfluenceFrames) * 0.1;
				this.jumpInfluenceFrames--;
			}
		} else {
			this.jumpInfluenceFrames = 0;
		}
		if(keys.a) this.col.vel.x = -5;
		if(keys.d) this.col.vel.x = 5;

		this.col.acc.y = 0.5;
		this.col.update();
		this.col.subUpdate();
		this.col.wallLimit({x:500,y:500}, {y: () => {this.canJump = true}});
	}
}