import { Collider2, Canvas } from "../lib.js";

/**
 * Class for all objects in the world
 */
export default class WorldObject {
    /**
     * @constructor
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    constructor(x, y, width, height) {
        this.col = new Collider2(x, y, width, height);
    }

    draw = canv => {
        canv.rect(this.col.pos.x, this.col.pos.y, this.col.size.x, this.col.size.y);
    }
    
    update = () => {
        this.col.acc.y = 0.5;
        this.col.update();
        this.col.subUpdate();
        this.col.wallLimit({x:500,y:500}, {});
    }
}