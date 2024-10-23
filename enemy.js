import { AnimatedObjectData } from "./animated-object-data.js";

class Enemy
{
    constructor(x, y, enemyObjectData) {
        this.x = x;
        this.y = y;
        this.enemyObjectData = Object.assign(new AnimatedObjectData(null, null, null, null, null, null), enemyObjectData);
    }

    update(cameraPosX, cameraPosY, cameraRotation) {
        this.enemyObjectData.createModelViewMarix();

        const dx = cameraPosX - this.x;
        const dy = cameraPosY - this.y;

        let rotation = Math.atan2(dx, dy);

        mat4.translate(
            this.enemyObjectData.modelViewMatrix, // destination matrix
            this.enemyObjectData.modelViewMatrix, // matrix to translate
            [this.x, 0.5, this.y]
        ); // amount to translate

        mat4.rotate(
            this.enemyObjectData.modelViewMatrix, // destination matrix
            this.enemyObjectData.modelViewMatrix, // matrix to translate
            rotation,
            [0, 1, 0]
        ); 
    }
}

export { Enemy }