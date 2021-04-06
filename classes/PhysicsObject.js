import { WorldObject } from "./WorldObject";

/**
 * Class for all dynamic objects in the world
 * @extends WorldObject
 */
export class PhysicsObject extends WorldObject{
    constructor(x, y, width, height){
        super(x, y, width, height);
    }
}