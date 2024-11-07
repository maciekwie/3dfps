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

    draw(gl, projectionMatrix) {
        this.projectionMatrix = projectionMatrix;
        
        this.shader.setAttributes(gl, this);
        this.shader.useProgram(gl);
        this.shader.setUniforms(gl, this);

        const type = gl.UNSIGNED_SHORT;
        const offset = 0;

        gl.enable(gl.STENCIL_TEST);

        //begin mask
        gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        gl.clearStencil(0);
        gl.clear(gl.STENCIL_BUFFER_BIT);
        //draw the mask
        gl.drawElements(gl.TRIANGLES, this.vertexCount, type, offset);
        
        gl.stencilFunc(gl.EQUAL, 0, 0xFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        // draw the masked element
        gl.drawElements(gl.TRIANGLES, this.vertexCount, type, offset);

        gl.disable(gl.STENCIL_TEST);
    }
}

export { AnimatedObjectData }