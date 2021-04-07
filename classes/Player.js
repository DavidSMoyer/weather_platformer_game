import EnvironmentObject from "./EnvironmentObject.js";
import PhysicsObject from "./PhysicsObject.js";
import WorldObject from "./WorldObject.js";

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
		this.onGround = false;
	}

	/**
	 * @param {WorldObject[]} objs 
	 */
	checkCol = objs => {
		const staticObjs = objs.filter(obj => obj instanceof EnvironmentObject);
		const interactables = objs.filter(obj => obj instanceof PhysicsObject);
		this.col.checkCollision(
			staticObjs.map(obj => obj.col),
			{
				xany: col => this.col.vel.x = 0,
				yany: col => this.col.vel.y = 0,
				ypos: col => {this.onGround = true; this.canJump = true;}
			}
		);
	}

	update = (keys, objs) => {
		this.col.vel.x = 0;
		if(keys.w) {
			if(this.canJump) {
				this.canJump = false;
				this.onGround = false;
				this.col.vel.y = Player.jumpForce;
				this.jumpInfluenceFrames = Player.influenceFrames;
			} else if (this.jumpInfluenceFrames > 0) {
				const influenceDecay = (Player.influenceFrames - this.jumpInfluenceFrames) * 0.1;
				this.col.vel.y = Player.jumpForce - influenceDecay;
				this.jumpInfluenceFrames--;
			}
		} else {
			this.jumpInfluenceFrames = 0;
		}
		if(keys.a) this.col.vel.x = -5;
		if(keys.d) this.col.vel.x = 5;

		// If the player is moving we set onGround to be false
		// This is so that if they move off of a platform they don't looney tunes off the edge
		// Because otherwise gravity would never turn back on so yeah
		if(this.col.vel.x !== 0) this.onGround = false;

		this.col.acc.y = this.onGround ? 0 : 0.5;
		this.col.update();
		this.checkCol(objs);
		this.col.subUpdate();
		this.col.wallLimit({x:500,y:500}, {y: () => {this.canJump = true; this.onGround = true;}});
	}
}