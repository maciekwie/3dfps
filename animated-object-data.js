import { ObjectData } from "./object-data.js";

class AnimatedObjectData extends ObjectData
{
    constructor(vertexData, vertexNormals, indices, textureCoordinates, texture)
    {
        super(vertexData, vertexNormals, null, indices, textureCoordinates);
        this.texture = texture;

        this.currentFrame = 0;
        this.animated = true;
    }

    nextFrame()
    {
        this.currentFrame++;
        if(this.currentFrame >= this.texture.numberOfFrames)
        {
            this.currentFrame = 0;
        }
    }
}

export { AnimatedObjectData }