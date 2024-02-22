export function createWebglTexture (gl: WebGLRenderingContext): WebGLTexture | Error {
    const texture =  gl.createTexture();
    if (!texture) {
        return new Error("Failed to create WebGl texture");
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
}

export function createWebGLProgram(
    gl: WebGLRenderingContext,
    shaderSourceArr: Array<[string, GLenum]>,
): WebGLProgram | Error {
    const shaderArr = shaderSourceArr.map(([shaderSource, shaderType]) =>
        compileShader(gl, shaderSource, shaderType ));
    
    const error = shaderArr.find(shader => shader instanceof Error);
    if (error instanceof Error) return error;

    return createProgram(gl, shaderArr);
}

function compileShader (
    gl: WebGLRenderingContext,
    shaderSource: string,
    shaderType: GLenum,
): WebGLShader | Error {
    const shader = gl.createShader(shaderType);
    if (!shader){
        return new Error("Failed to compile shader");
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        const err = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        return new Error("WebGl could not compile shader" + err);
    }

    return shader;
}

function createProgram (
    gl: WebGLRenderingContext,
    shaderArr: WebGLShader[],
): WebGLProgram | Error {
    const program = gl.createProgram();
    if (!program) {
        return new Error("Failed to create WebGl program");
    }

    for (const shader of shaderArr) {
        gl.attachShader(program, shader);
    }

    gl.linkProgram(program);
    gl.useProgram(program);

    for (const shader of shaderArr) {
        gl.detachShader(program, shader);
        gl.deleteShader(shader);
    }
    shaderArr.length = 0;

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        return new Error("WebGl program fail to link " + gl.getShaderInfoLog(program));
    }

    return program;
}
