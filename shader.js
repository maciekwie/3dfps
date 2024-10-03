
class Shader {
    constructor(vsSource, fsSource, sourceInfo) {
        this.vsSource = vsSource;
        this.fsSource = fsSource;
        this.sourceInfo = sourceInfo;
    }
    
    initShaderProgram(gl) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, this.vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, this.fsSource);

        // Create the shader program
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert(
                `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                    shaderProgram
                )}`
            );
            return;
        }

        this.shaderProgram = shaderProgram;

        this.setProgramInfo(gl, this.sourceInfo);
    }
    setProgramInfo(gl, info) {
        let programInfo = {
            program: this.shaderProgram
        };

        if (info.attribLocations) {
            programInfo.attribLocations = {};

            let keys = Object.keys(info.attribLocations);
            keys.forEach((property) => 
                programInfo.attribLocations[property] = gl.getAttribLocation(this.shaderProgram, info.attribLocations[property]),
            );
        }

        if (info.uniformLocations) {
            programInfo.uniformLocations = {};

            let keys = Object.keys(info.uniformLocations);
            keys.forEach((property) => 
                programInfo.uniformLocations[property] = gl.getUniformLocation(this.shaderProgram, info.uniformLocations[property]),
            );
        }

        this.programInfo = programInfo;
    }
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
  
    // Send the source to the shader object
    gl.shaderSource(shader, source);
  
    // Compile the shader program
    gl.compileShader(shader);
  
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
            );
            gl.deleteShader(shader);
        return null;
    }
  
    return shader;
}

export { Shader }