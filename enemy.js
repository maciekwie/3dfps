import { AnimatedObjectData } from "./animated-object-data.js";

class Enemy
{
    constructor(x, y, enemyObjectData) {
        this.x = x;
        this.y = y;
        this.enemyObjectData = Object.assign(new AnimatedObjectData(null, null, null, null, null, null), enemyObjectData);

        this.moveDirection = Math.random() * 2 * Math.PI - Math.PI;
        this.speed = 1;

        this.enemyObjectData.setAnimation("idle_front");
    }

    update(deltaTime, cameraPosX, cameraPosY, scene) {
        let newX = this.x + Math.sin(this.moveDirection) * deltaTime * this.speed;
        let newY = this.y + Math.cos(this.moveDirection) * deltaTime * this.speed;

        if(scene.checkWallCollision(newX, newY) == false)
        {
            this.x = newX;
            this.y = newY;
        }
        else
        {
            this.newDirection();
        }

        this.enemyObjectData.createModelViewMarix();

        const dx = cameraPosX - this.x;
        const dy = cameraPosY - this.y;

        const rotation = Math.atan2(dx, dy);

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

        let angle = -this.moveDirection + rotation;

        if(angle > -Math.PI / 4 && angle < Math.PI / 4) {
            this.enemyObjectData.setAnimation("walk_front");
        }
        else if(angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
            this.enemyObjectData.setAnimation("walk_left");
        }
        else if(angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
            this.enemyObjectData.setAnimation("walk_right");
        }
        else {
            this.enemyObjectData.setAnimation("walk_back");
        }
    }

    newDirection()
    {
        this.moveDirection = Math.random() * 2 * Math.PI - Math.PI;
    }
}

export { Enemy }