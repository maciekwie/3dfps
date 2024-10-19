
import mazeJson from './maze.json' with {type: 'json'};
import { ObjectData } from "./object-data.js";
import { AnimatedObjectData } from "./animated-object-data.js";
import { Texture } from "./texture.js";
import { SpritesheetTexture } from './spritesheet-texture.js';
import { setPositionAttribute, setColorAttribute, setTextureAttribute, setNormalAttribute } from "./draw-scene.js";

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
    this.createScene(gl);

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

    if (this.arrowUp) {
      this.cameraPosX += moveSpeed * Math.cos(this.cameraRotation) * deltaTime;
      this.cameraPosY += moveSpeed * Math.sin(this.cameraRotation) * deltaTime;
    }
    else if (this.arrowDown) {
      this.cameraPosX -= moveSpeed * Math.cos(this.cameraRotation) * deltaTime;
      this.cameraPosY -= moveSpeed * Math.sin(this.cameraRotation) * deltaTime;
    }
    if (this.arrowRight) {
      this.cameraRotation += 1 * deltaTime;
    }
    else if (this.arrowLeft) {
      this.cameraRotation -= 1 * deltaTime;
    }

    mat4.rotate(
      this.newProjectionMatrix, // destination matrix
      this.projectionMatrix, // matrix to rotate
      this.cameraRotation, // amount to rotate in radians
      [0, 1, 0]
    );

    mat4.translate(
      this.newProjectionMatrix, // destination matrix
      this.newProjectionMatrix, // matrix to translate
      [-this.cameraPosY, -this.playerHeight, this.cameraPosX]
    ); // amount to translate
  }
  drawScene(gl, programInfo, program2Info, program3Info) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things



    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (let i = 0; i < this.objects.length; i++) {
      // Tell WebGL how to pull out the positions from the position
      // buffer into the vertexPosition attribute.
      let buffers = this.objects[i].getBuffers();

      if (this.objects[i].animated) {
        setPositionAttribute(gl, buffers, program3Info);
        setTextureAttribute(gl, buffers, program3Info);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        setNormalAttribute(gl, buffers, program3Info);

        // Tell WebGL to use our program when drawing
        gl.useProgram(program3Info.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(
          program3Info.uniformLocations.normalMatrix,
          false,
          this.objects[i].normalMatrix,
        );

        gl.uniformMatrix4fv(
          program3Info.uniformLocations.projectionMatrix,
          false,
          this.newProjectionMatrix
        );

        gl.uniformMatrix4fv(
          program3Info.uniformLocations.modelViewMatrix,
          false,
          this.objects[i].modelViewMatrix
        );

        let scaleY = 1 / this.objects[i].texture.numberOfFrames;
        gl.uniform2fv(program3Info.uniformLocations.uvOffset, [0, this.objects[i].currentFrame * scaleY]);
        gl.uniform2fv(program3Info.uniformLocations.uvScale, [1, scaleY]);

        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, this.objects[i].texture.glTexture);

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(program3Info.uniformLocations.uSampler, 0);

        this.objects[i].draw(gl, program3Info);
      }
      else if (this.objects[i].useTextureShader) {
        setPositionAttribute(gl, buffers, program2Info);
        setTextureAttribute(gl, buffers, program2Info);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        setNormalAttribute(gl, buffers, program2Info);

        // Tell WebGL to use our program when drawing
        gl.useProgram(program2Info.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(
          program2Info.uniformLocations.normalMatrix,
          false,
          this.objects[i].normalMatrix,
        );

        gl.uniformMatrix4fv(
          program2Info.uniformLocations.projectionMatrix,
          false,
          this.newProjectionMatrix
        );

        gl.uniformMatrix4fv(
          program2Info.uniformLocations.modelViewMatrix,
          false,
          this.objects[i].modelViewMatrix
        );

        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, this.objects[i].texture.glTexture);

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(program2Info.uniformLocations.uSampler, 0);

        this.objects[i].draw(gl, program2Info);
      }
      else {
        setPositionAttribute(gl, buffers, programInfo);
        setColorAttribute(gl, buffers, programInfo);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(
          programInfo.uniformLocations.projectionMatrix,
          false,
          this.newProjectionMatrix
        );

        gl.uniformMatrix4fv(
          programInfo.uniformLocations.modelViewMatrix,
          false,
          this.objects[i].modelViewMatrix
        );

        this.objects[i].draw(gl, programInfo);
      }
    }

    for (let i = 0; i < this.objects.length; i++) {
      if(this.objects[i].animated) {
        this.objects[i].nextFrame();
      }
    }
  }
  createScene(gl) {
    
    let mazeObject = new ObjectData(mazeJson.vertices, mazeJson.normals, null, mazeJson.indices, mazeJson.textureCoords);
    /*mat4.rotate(
      mazeObject.modelViewMatrix, // destination matrix
      mazeObject.modelViewMatrix, // matrix to rotate
      Math.PI / 2, // amount to rotate in radians
      [1, 0, 0]
    ); // axis to rotate around (Z)*/
    mazeObject.vertexCount = mazeJson.indices.length;
    mazeObject.updateNormalMatrix();

    let wallTexture = new Texture();
    wallTexture.loadTexture(gl, "texture.jpg");
    mazeObject.texture = wallTexture;

    this.objects.push(mazeObject);

    let floor = createPlane(47, 30);
    let floorObject = new ObjectData(floor.vertices, floor.normals, null, floor.indices, floor.textureCoords);

    let floorTexture = new Texture();
    floorTexture.loadTexture(gl, "floorTexture.jpg");
    floorObject.texture = floorTexture;
    floorObject.vertexCount = floor.indices.length;
    
    floorObject.updateNormalMatrix();

    mat4.translate(
      floorObject.modelViewMatrix, // destination matrix
      floorObject.modelViewMatrix, // matrix to translate
      [23.5, 0, 15.0]
    ); // amount to translate

    this.objects.push(floorObject);


    let spritesheetTexture = new SpritesheetTexture();
    spritesheetTexture.loadTexture(gl, "walk_front_spritesheet.png", { numberOfFrames: 30 });

    let plane = createPlane_v2(1, 1);
    let object3 = new AnimatedObjectData(plane.vertices, plane.normals, plane.indices, plane.textureCoords, spritesheetTexture);
    object3.vertexCount = object3.indices.length;

    object3.updateNormalMatrix();
    mat4.rotate(
      object3.modelViewMatrix, // destination matrix
      object3.modelViewMatrix, // matrix to translate,
      Math.PI / 2,
      [0, 0, 1]
    ); // amount to translate

    this.objects.push(object3);

    const positions = [
      // Front face
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

      // Back face
      -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

      // Top face
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

      // Right face
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

      // Left face
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];

    const faceColors = [
      [1.0, 1.0, 1.0, 1.0], // Front face: white
      [1.0, 0.0, 0.0, 1.0], // Back face: red
      [0.0, 1.0, 0.0, 1.0], // Top face: green
      [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
      [1.0, 1.0, 0.0, 1.0], // Right face: yellow
      [1.0, 0.0, 1.0, 1.0], // Left face: purple
    ];

    // Convert the array of colors into a table for all the vertices.
    var colors = [];

    for (var j = 0; j < faceColors.length; ++j) {
      const c = faceColors[j];
      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(c, c, c, c);
    }

    const indices = [
      0,
      1,
      2,
      0,
      2,
      3, // front
      4,
      5,
      6,
      4,
      6,
      7, // back
      8,
      9,
      10,
      8,
      10,
      11, // top
      12,
      13,
      14,
      12,
      14,
      15, // bottom
      16,
      17,
      18,
      16,
      18,
      19, // right
      20,
      21,
      22,
      20,
      22,
      23, // left
    ];

    const textureCoordinates = [
      // Front
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Back
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Top
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Bottom
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Right
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Left
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ];

    const vertexNormals = [
      // Front
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

      // Back
      0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

      // Top
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

      // Bottom
      0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

      // Right
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

      // Left
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    ];

    let object1 = new ObjectData(positions, vertexNormals, null, indices, textureCoordinates);
    let object2 = new ObjectData(positions, vertexNormals, colors, indices, null);

    object1.texture = wallTexture;

    let cubeRotation = 1;
    mat4.translate(
      object1.modelViewMatrix, // destination matrix
      object1.modelViewMatrix, // matrix to translate
      [-0.0, 0.0, -6.0]
    ); // amount to translate

    mat4.rotate(
      object1.modelViewMatrix, // destination matrix
      object1.modelViewMatrix, // matrix to rotate
      cubeRotation, // amount to rotate in radians
      [0, 0, 1]
    ); // axis to rotate around (Z)
    mat4.rotate(
      object1.modelViewMatrix, // destination matrix
      object1.modelViewMatrix, // matrix to rotate
      cubeRotation * 0.7, // amount to rotate in radians
      [0, 1, 0]
    ); // axis to rotate around (Y)
    mat4.rotate(
      object1.modelViewMatrix, // destination matrix
      object1.modelViewMatrix, // matrix to rotate
      cubeRotation * 0.3, // amount to rotate in radians
      [1, 0, 0]
    ); // axis to rotate around (X)

    object1.updateNormalMatrix();

    mat4.translate(
      object2.modelViewMatrix, // destination matrix
      object2.modelViewMatrix, // matrix to translate
      [-0.5, 0.3, -6.0]
    ); // amount to translate

    this.objects.push(object1);
    this.objects.push(object2);
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

