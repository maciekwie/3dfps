
import mazeJson from './maze.json' with {type: 'json'};
import { ObjectData } from "./object-data.js";
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

    this.objects = [];
    this.createScene();

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
      [-this.cameraPosY, 0, this.cameraPosX]
    ); // amount to translate
  }
  drawScene(gl, programInfo, program2Info, texture) {
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

      if (this.objects[i].useTextureShader) {
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
        gl.bindTexture(gl.TEXTURE_2D, texture);

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
  }
  createScene() {
    
    let mazeObject = new ObjectData(mazeJson.vertices, mazeJson.normals, null, mazeJson.indices, mazeJson.textureCoords);
    /*mat4.rotate(
      mazeObject.modelViewMatrix, // destination matrix
      mazeObject.modelViewMatrix, // matrix to rotate
      Math.PI / 2, // amount to rotate in radians
      [1, 0, 0]
    ); // axis to rotate around (Z)*/
    mazeObject.vertexCount = mazeJson.indices.length - 1;
    mazeObject.updateNormalMatrix();

    this.objects.push(mazeObject);

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

export { Scene }




