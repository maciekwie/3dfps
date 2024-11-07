
import { Scene } from "./scene.js";
import { Shader } from "./shader.js";
import { setPositionAttribute, setColorAttribute, setTextureAttribute, setNormalAttribute } from "./draw-scene.js";

let deltaTime = 0;

main();
//
// start here
//
function main() {
    const canvas = document.querySelector("#canvasId");
    // Initialize the GL context
    const gl = canvas.getContext("webgl", {stencil: true});

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

    const tfsSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
    `;

    const tvsSource2 = `
  attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform vec2 uvOffset;
    uniform vec2 uvScale;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord * uvScale + uvOffset;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
`;

    const tfsSource2 = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

      if (texelColor.a == 0.0) discard;

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
    shader2.setAttributes = (gl, object) => {
        let buffers = object.getBuffers();
        let programInfo = object.shader.programInfo;

        setPositionAttribute(gl, buffers, programInfo);
        setTextureAttribute(gl, buffers, programInfo);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        setNormalAttribute(gl, buffers, programInfo);
    }

    shader2.setUniforms = (gl, object) => {
        let programInfo = object.shader.programInfo;

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.normalMatrix,
            false,
            object.normalMatrix
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            object.projectionMatrix
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            object.modelViewMatrix
        );

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, object.texture.glTexture);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    }

    let shader3 = new Shader(tvsSource2, tfsSource2, {
        attribLocations: {
            vertexPosition: "aVertexPosition",
            vertexNormal: "aVertexNormal",
            textureCoord: "aTextureCoord"
        },
        uniformLocations: {
            projectionMatrix: "uProjectionMatrix",
            modelViewMatrix: "uModelViewMatrix",
            normalMatrix: "uNormalMatrix",
            uSampler: "uSampler",
            uvOffset: "uvOffset",
            uvScale: "uvScale"
        }
    });
    shader3.initShaderProgram(gl);
    shader3.setAttributes = (gl, object) => {
        let buffers = object.getBuffers();
        let programInfo = object.shader.programInfo;

        setPositionAttribute(gl, buffers, programInfo);
        setTextureAttribute(gl, buffers, programInfo);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        setNormalAttribute(gl, buffers, programInfo);
    }
    shader3.setUniforms = (gl, object, projectionMatrix) => {
        let programInfo = object.shader.programInfo;

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.normalMatrix,
            false,
            object.normalMatrix,
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            object.projectionMatrix
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            object.modelViewMatrix
        );
        
        gl.uniform2fv(programInfo.uniformLocations.uvOffset, [object.GetFramePosX() / object.texture.width, 1 - (object.GetFramePosY() + object.GetFrameHeight()) / object.texture.height]);
        gl.uniform2fv(programInfo.uniformLocations.uvScale, [object.GetFrameWidth() / object.texture.width, object.GetFrameHeight() / object.texture.height]);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, object.texture.glTexture);

        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    }

    let scene = new Scene(gl);

    scene.createScene(gl, shader1, shader2, shader3);
    scene.cameraPosX = 3;
    scene.cameraPosY = 3;
    scene.cameraRotation = -2;

    scene.initBuffers(gl);

    // Flip image pixels into the bottom-to-top order that WebGL expects.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    document.addEventListener("keydown", (event) => {
        const keyName = event.key;

        if (keyName == "ArrowUp") {
            scene.arrowUp = true;
        }
        else if (keyName == "ArrowDown") {
            scene.arrowDown = true;
        }
        else if (keyName == "ArrowLeft") {
            scene.arrowLeft = true;
        }
        else if (keyName == "ArrowRight") {
            scene.arrowRight = true;
        }
    });

    document.addEventListener("keyup", (event) => {
        const keyName = event.key;

        if (keyName == "ArrowUp") {
            scene.arrowUp = false;
        }
        else if (keyName == "ArrowDown") {
            scene.arrowDown = false;
        }
        else if (keyName == "ArrowLeft") {
            scene.arrowLeft = false;
        }
        else if (keyName == "ArrowRight") {
            scene.arrowRight = false;
        }
    });

    let then = 0;
    let lastFrame = 0;
    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001; // convert to seconds
        deltaTime = now - then;
        then = now;

        let timeSinceLastFrame = now - lastFrame;

        scene.update(deltaTime);
        scene.drawScene(gl);

        if(timeSinceLastFrame > (1/30))
        {
            scene.nextFrame();
            lastFrame = now;
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

//
