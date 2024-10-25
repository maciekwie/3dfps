
import mazeJson from './maze.json' with { type: 'json' };
import { ObjectData } from './object-data.js';
import { AnimatedObjectData } from './animated-object-data.js';
import { Texture } from './texture.js';
import { SpritesheetTexture } from './spritesheet-texture.js';
import { Enemy } from './enemy.js'

class Scene {
    constructor(gl) {
        this.gl = gl;

        this.arrowUp = false;
        this.arrowDown = false;
        this.arrowLeft = false;
        this.arrowRight = false;

        this.cameraPosX = 0;
        this.cameraPosY = 0;
        this.cameraRotation = 0;
        this.playerHeight = 0.6;

        this.objects = [];
        this.enemies = [];

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
        const fieldOfView = (45 * Math.PI) / 180; // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        this.projectionMatrix = projectionMatrix;

        this.newProjectionMatrix = mat4.create();
    }

    initBuffers(gl) {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].initBuffers(gl);
        }
    }

    update(deltaTime) {
        const moveSpeed = 3;

        let newCameraPosX = this.cameraPosX;
        let newCameraPosY = this.cameraPosY;

        if (this.arrowUp) {
            newCameraPosX -= moveSpeed * Math.sin(this.cameraRotation) * deltaTime;
            newCameraPosY -= moveSpeed * Math.cos(this.cameraRotation) * deltaTime;
        }
        else if (this.arrowDown) {
            newCameraPosX += moveSpeed * Math.sin(this.cameraRotation) * deltaTime;
            newCameraPosY += moveSpeed * Math.cos(this.cameraRotation) * deltaTime;
        }
        if (this.arrowRight) {
            this.cameraRotation -= 1 * deltaTime;
        }
        else if (this.arrowLeft) {
            this.cameraRotation += 1 * deltaTime;
        }

        if(this.checkWallCollision(newCameraPosX, newCameraPosY) == false)
        {
            this.cameraPosX = newCameraPosX;
            this.cameraPosY = newCameraPosY;
        }
        else if(this.checkWallCollision(newCameraPosX, this.cameraPosY) == false)
        {
            this.cameraPosX = newCameraPosX;
        }
        else if(this.checkWallCollision(this.cameraPosX, newCameraPosY) == false)
        {
            this.cameraPosY = newCameraPosY;
        }

        mat4.rotate(
            this.newProjectionMatrix, // destination matrix
            this.projectionMatrix, // matrix to rotate
            this.cameraRotation, // amount to rotate in radians
            [0, -1, 0]
        );

        mat4.translate(
            this.newProjectionMatrix, // destination matrix
            this.newProjectionMatrix, // matrix to translate
            [-this.cameraPosX, -this.playerHeight, -this.cameraPosY]
        ); 

        for(let i = 0; i < this.enemies.length; i++)
        {
            this.enemies[i].update(this.cameraPosX, this.cameraPosY, this.cameraRotation);
        }
    }

    checkWallCollision(posX, posY) {
        let x = Math.round(posX - 0.5);
        let y = Math.round(posY - 0.5);

        if(x < 0 || y < 0 || x > this.wallMap.length || y > this.wallMap[0].length)
            return false;

        if (this.wallMap[x][y] == 1)
            return true;
        else
            return false;
    }

    drawScene(gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].draw(gl, this.newProjectionMatrix);
        }

        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].animated) {
                this.objects[i].nextFrame();
            }
        }
    }

    createScene(gl, shader1, shader2, shader3) {
        let wallTexture = new Texture();
        wallTexture.loadTexture(gl, "texture.jpg");

        let floorTexture = new Texture();
        floorTexture.loadTexture(gl, "floorTexture.jpg");

        let spritesheetTexture = new SpritesheetTexture();
        spritesheetTexture.loadTexture(gl, "walk_front_spritesheet.png", { numberOfFrames: 30 });


        let mazeObject = new ObjectData(mazeJson.vertices, mazeJson.normals, mazeJson.textureCoords, mazeJson.indices, wallTexture, shader2);
        this.objects.push(mazeObject);

        this.wallMap = mazeJson.wall_map;

        let floor = createPlane(47, 30);
        let floorObject = new ObjectData(floor.vertices, floor.normals, floor.textureCoords, floor.indices, floorTexture, shader2);

        mat4.translate(
            floorObject.modelViewMatrix, // destination matrix
            floorObject.modelViewMatrix, // matrix to translate
            [23.5, 0, 15.0]
        ); // amount to translate

        this.objects.push(floorObject);

        let plane = createPlane_v2(0.6, 1);
        let enemyObject = new AnimatedObjectData(plane.vertices, plane.normals, plane.textureCoords, plane.indices, spritesheetTexture, shader3);


        let enemy1 = new Enemy(3, 3, enemyObject);
        this.enemies.push(enemy1);
        this.objects.push(enemy1.enemyObjectData);
        
        let enemy2 = new Enemy(13, 4, enemyObject);
        this.enemies.push(enemy2);
        this.objects.push(enemy2.enemyObjectData);

        let enemy3 = new Enemy(13, 8, enemyObject);
        this.enemies.push(enemy3);
        this.objects.push(enemy3.enemyObjectData);
    }
}

function createPlane(width, depth) {
    // Vertex positions (x, y, z)
    const vertices = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    // Calculate the number of segments based on the dimensions
    const widthSegments = Math.ceil(width);
    const depthSegments = Math.ceil(depth);

    // Loop over the grid and create vertices, normals, and texture coordinates
    for (let z = 0; z <= depthSegments; z++) {
        for (let x = 0; x <= widthSegments; x++) {
            // Position each vertex
            const xPos = x - width / 2;
            const yPos = 0;
            const zPos = z - depth / 2;

            vertices.push(xPos, yPos, zPos);

            // Normals pointing up along Y-axis
            normals.push(0, 1, 0);

            // Texture coordinates scaled to repeat every 1 unit
            texCoords.push(x, z);
        }
    }

    // Create indices for the grid
    for (let z = 0; z < depthSegments; z++) {
        for (let x = 0; x < widthSegments; x++) {
            const topLeft = z * (widthSegments + 1) + x;
            const topRight = topLeft + 1;
            const bottomLeft = topLeft + (widthSegments + 1);
            const bottomRight = bottomLeft + 1;

            // First triangle
            indices.push(topLeft, bottomLeft, topRight);

            // Second triangle
            indices.push(topRight, bottomLeft, bottomRight);
        }
    }

    return {
        vertices: vertices,
        normals: normals,
        textureCoords: texCoords,
        indices: indices
    };
}

function createPlane_v2(width = 1, height = 1, subdivisionsX = 1, subdivisionsY = 1) {
    // Ensure subdivisions are at least 1
    subdivisionsX = Math.max(1, Math.floor(subdivisionsX));
    subdivisionsY = Math.max(1, Math.floor(subdivisionsY));

    const numVertices = (subdivisionsX + 1) * (subdivisionsY + 1);
    const positions = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    // Calculate the size of each subdivision
    const dx = width / subdivisionsX;
    const dy = height / subdivisionsY;

    // Starting coordinates (bottom-left corner)
    const startX = -width / 2;
    const startY = -height / 2;

    // Generate vertices, normals, and texture coordinates
    for (let y = 0; y <= subdivisionsY; y++) {
        for (let x = 0; x <= subdivisionsX; x++) {
            // Position
            const posX = startX + x * dx;
            const posY = startY + y * dy;
            const posZ = 0;

            positions.push(posX, posY, posZ);

            // Normal (pointing up)
            normals.push(0, 0, 1);

            // Texture coordinates
            const u = x / subdivisionsX;
            const v = y / subdivisionsY;
            texCoords.push(u, v);
        }
    }

    // Generate indices
    for (let y = 0; y < subdivisionsY; y++) {
        for (let x = 0; x < subdivisionsX; x++) {
            const i0 = y * (subdivisionsX + 1) + x;
            const i1 = i0 + 1;
            const i2 = i0 + (subdivisionsX + 1);
            const i3 = i2 + 1;

            // First triangle
            indices.push(i0, i2, i1);

            // Second triangle
            indices.push(i1, i2, i3);
        }
    }

    return {
        vertices: positions,
        normals: normals,
        textureCoords: texCoords,
        indices: indices
    };
}

export { Scene }

