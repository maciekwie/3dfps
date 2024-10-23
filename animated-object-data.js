import { ObjectData } from "./object-data.js";

class AnimatedObjectData extends ObjectData
{
    constructor(vertexData, vertexNormals, textureCoordinates, indices, texture, shader) {
        super(vertexData, vertexNormals, textureCoordinates, indices, texture, shader);

        this.currentFrame = 0;
        this.animated = true;
    }

    nextFrame() {
        this.currentFrame++;
        if(this.currentFrame >= this.texture.numberOfFrames)
        {
            this.currentFrame = 0;
        }
    }
}

export { AnimatedObjectData }