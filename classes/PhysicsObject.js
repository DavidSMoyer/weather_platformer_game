import WorldObject from "./WorldObject.js";

/**
 * Class for all dynamic objects in the world
 * @extends WorldObject
 */
export default class PhysicsObject extends WorldObject{
    constructor(x, y, width, height){
        super(x, y, width, height);
    }
}