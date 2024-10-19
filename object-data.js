
class ObjectData {
    constructor(vertexData, vertexNormals, colorData, indices, textureCoordinates) {
        this.vertexData = vertexData;
        this.vertexNormals = vertexNormals;
        this.colorData = colorData;
        this.indices = indices;
        this.textureCoordinates = textureCoordinates;

        this.useTextureShader = false;
        if (textureCoordinates != null)
            this.useTextureShader = true;

        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.colorBuffer = null;
        this.indexBuffer = null;
        this.textureCoordBuffer = null;

        this.texture = null;

        this.modelViewMatrix = mat4.create();
        this.normalMatrix = mat4.create();

        this.vertexCount = 36;
    }
    updateNormalMatrix() {
        mat4.invert(this.normalMatrix, this.modelViewMatrix);
        mat4.transpose(this.normalMatrix, this.normalMatrix);
    }
    getBuffers() {
        return {
            position: this.vertexBuffer,
            normal: this.normalBuffer,
            color: this.colorBuffer,
            indices: this.indexBuffer,
            textureCoord: this.textureCoordBuffer
        };
    }
    initBuffers(gl) {
        this.gl = gl;

        if (this.vertexBuffer == null)
            this.initVertexBuffer();
        if (this.normalBuffer == null)
            this.initNormalBuffer();
        if (this.colorBuffer == null)
            this.initColorBuffer();
        if (this.indexBuffer == null)
            this.initIndexBuffer();
        if (this.textureCoordBuffer == null)
            this.initTextureBuffer();
    }
    initVertexBuffer() {
        const gl = this.gl;

        let vertexArray = this.vertexData;

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

        this.vertexBuffer = vertexBuffer;
    }
    initNormalBuffer() {
        const gl = this.gl;

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.vertexNormals),
            gl.STATIC_DRAW
        );

        this.normalBuffer = normalBuffer;
    }
    initColorBuffer() {
        if (this.colorData == null)
            return;

        const gl = this.gl;

        let colors = this.colorData;

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        this.colorBuffer = colorBuffer;
    }
    initIndexBuffer() {
        const gl = this.gl;

        let indices = this.indices;

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            gl.STATIC_DRAW
        );

        this.indexBuffer = indexBuffer;
    }
    initTextureBuffer() {
        if (this.useTextureShader == false)
            return;

        const gl = this.gl;

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.textureCoordinates),
            gl.STATIC_DRAW
        );

        this.textureCoordBuffer = textureCoordBuffer;
    }
    draw(gl, programInfo) {
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, this.vertexCount, type, offset);
    }
}

export { ObjectData }
