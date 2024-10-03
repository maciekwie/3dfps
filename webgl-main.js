
import { Scene } from "./scene.js";
import { Shader } from "./shader.js";
import { Texture } from "./texture.js";

let deltaTime = 0;

main();
//
// start here
//
function main() {
  const canvas = document.querySelector("#canvasId");
  // Initialize the GL context
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Vertex shader program
  const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec4 aVertexColor;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      varying lowp vec4 vColor;

      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
      }
`;

  const fsSource = `
      varying lowp vec4 vColor;

      void main(void) {
        gl_FragColor = vColor;
      }
  `;

  const tvsSource = `
  attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
`;

  const tfsSource =  `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
    `;

  let shader1 = new Shader(vsSource, fsSource, {
      attribLocations: {
        vertexPosition: "aVertexPosition",
        vertexColor: "aVertexColor"
      },
      uniformLocations: {
        projectionMatrix: "uProjectionMatrix",
        modelViewMatrix: "uModelViewMatrix"
      }
  });
  shader1.initShaderProgram(gl);

  let shader2 = new Shader(tvsSource, tfsSource, {
      attribLocations: {
        vertexPosition: "aVertexPosition",
        vertexNormal: "aVertexNormal",
        textureCoord: "aTextureCoord"
      },
      uniformLocations: {
        projectionMatrix: "uProjectionMatrix",
        modelViewMatrix: "uModelViewMatrix",
        normalMatrix: "uNormalMatrix",
        uSampler: "uSampler"
      }
    });
  shader2.initShaderProgram(gl);

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = shader1.shaderProgram;
  const textureShaderProgram = shader2.shaderProgram;

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVertexColor and also
  // look up uniform locations.
  const programInfo = shader1.programInfo;
  const program2Info = shader2.programInfo;

  let scene = new Scene(gl);
  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  scene.initBuffers(gl);

  // Load texture
  let texture = new Texture();
  texture.loadTexture(gl, "texture.jpg");
  // Flip image pixels into the bottom-to-top order that WebGL expects.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  document.addEventListener("keydown", (event) => {
    const keyName = event.key;

    if(keyName == "ArrowUp") {
      scene.arrowUp = true;
    }
    else if(keyName == "ArrowDown") {
      scene.arrowDown= true;
    }
    else if(keyName == "ArrowLeft") {
      scene.arrowLeft = true;
    }
    else if(keyName == "ArrowRight") {
      scene.arrowRight = true;
    }
  });

  document.addEventListener("keyup", (event) => {
    const keyName = event.key;

    if(keyName == "ArrowUp") {
      scene.arrowUp = false;
    }
    else if(keyName == "ArrowDown") {
      scene.arrowDown = false;
    }
    else if(keyName == "ArrowLeft") {
      scene.arrowLeft = false;
    }
    else if(keyName == "ArrowRight") {
      scene.arrowRight = false;
    }
  });

  let then = 0;
  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001; // convert to seconds
    deltaTime = now - then;
    then = now;

    scene.update(deltaTime);
    scene.drawScene(gl, programInfo, program2Info, texture.glTexture);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
