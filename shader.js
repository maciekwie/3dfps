
function Shader(vsSource, fsSource)
{
    this.vsSource = vsSource;
    this.fsSource = fsSource;
}

Shader.prototype.initShaderProgram = function(gl)
{
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

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
}

Shader.prototype.setProgramInfo(programInfo)
{

}
