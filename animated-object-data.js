import { ObjectData } from "./object-data.js";

class AnimatedObjectData extends ObjectData
{
    constructor(vertexData, vertexNormals, textureCoordinates, indices, texture, shader) {
        super(vertexData, vertexNormals, textureCoordinates, indices, texture, shader);

        this.currentFrame = 0;
        this.animated = true;
        this.animations = [];
        this.currentAnimation = null;
    }

    setAnimations(animationsData, atlasData)
    {
        animationsData.forEach(anim => {
            let animation = {};
            animation.name = anim.name;
            animation.numberOfFrames = anim.frames;
            animation.frames = [];

            for(let i = 0; i < animation.numberOfFrames; i++)
            {
                const frameName = anim.name + "_" + String(i).padStart(3, '0');;
                const frame = atlasData.frames.find((element) => element.name == frameName);
                animation.frames[i] = {
                    x: frame.x,
                    y: frame.y,
                    width: frame.width,
                    height: frame.height
                }
            }

            this.animations[anim.name] = animation;
            this.currentAnimation = animation;
        });
    }

    nextFrame() {
        this.currentFrame++;
        if(this.currentFrame >= this.currentAnimation.numberOfFrames)
        {
            this.currentFrame = 0;
        }
    }

    setAnimation(animName) {
        this.currentAnimation = this.animations[animName];
    }

    GetFramePosX() {
        return this.currentAnimation.frames[this.currentFrame].x;
    }

    GetFramePosY() {
        return this.currentAnimation.frames[this.currentFrame].y;
    }

    GetFrameWidth() {
        return this.currentAnimation.frames[this.currentFrame].width;
    }

    GetFrameHeight() {
        return this.currentAnimation.frames[this.currentFrame].height;
    }
}

export { AnimatedObjectData }