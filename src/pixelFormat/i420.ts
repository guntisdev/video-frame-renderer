import { RenderFrame } from '../createRenderer';
import { createWebGLProgram, createWebglTexture } from './createWebGLProgram';
import { GlRenderer } from './';
import { vertexShaderSource, yuvFragmentShaderSource } from './common';

export function createI420Webgl(gl: WebGLRenderingContext): GlRenderer | Error {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    const program = createWebGLProgram(
        gl,
        [[vertexShaderSource, gl.VERTEX_SHADER], [yuvFragmentShaderSource, gl.FRAGMENT_SHADER]],
    );
    if (program instanceof Error) return program;

    const initResult = initTexture(gl, program);
    if (initResult instanceof Error) return initResult;

    const [yTexture, uTexture, vTexture] = initResult;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    return {
        render: (frame: RenderFrame): void => {
            const ySize = frame.codedWidth * frame.codedHeight;
            const uSize = ySize / 4;
            const yPixels = new Uint8Array(frame.data.slice(0, ySize));
            const uPixels = new Uint8Array(frame.data.slice(ySize, ySize + uSize));
            const vPixels = new Uint8Array(frame.data.slice(ySize + uSize, ySize + uSize * 2));

            gl.bindTexture(gl.TEXTURE_2D, yTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, frame.codedWidth, frame.codedHeight, 0,
                gl.LUMINANCE, gl.UNSIGNED_BYTE, yPixels);
            gl.bindTexture(gl.TEXTURE_2D, uTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, frame.codedWidth >> 1, frame.codedHeight >> 1, 0,
                gl.LUMINANCE, gl.UNSIGNED_BYTE, uPixels);
            gl.bindTexture(gl.TEXTURE_2D, vTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, frame.codedWidth >> 1, frame.codedHeight >> 1, 0,
                gl.LUMINANCE, gl.UNSIGNED_BYTE, vPixels);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    };
}

function initTexture(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
): [WebGLTexture, WebGLTexture, WebGLTexture] | Error {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]), gl.STATIC_DRAW);
    const vertexPositionAttribute = gl.getAttribLocation(program, "a_position");
    if (vertexPositionAttribute === -1) return new Error("Webgl vertex attribute failed");
    gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);
    const textureRectangle = new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
    const textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureRectangle, gl.STATIC_DRAW);
    const textureCoord = gl.getAttribLocation(program, "a_texCoord");
    if (textureCoord === -1) return new Error("Webgl texture attribute failed");
    gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoord);

    gl.activeTexture(gl.TEXTURE0);
    const yTexture = createWebglTexture(gl);
    if (!yTexture) return new Error("Failed to create WebGL texture for Y plane");
    gl.uniform1i(gl.getUniformLocation(program, "samplerY"), 0);
    gl.activeTexture(gl.TEXTURE1);
    const uTexture = createWebglTexture(gl);
    if (!uTexture) return new Error("Failed to create WebGL texture for U plane");
    gl.uniform1i(gl.getUniformLocation(program, "samplerU"), 1);
    gl.activeTexture(gl.TEXTURE2);
    const vTexture = createWebglTexture(gl);
    if (!vTexture) return new Error("Failed to create WebGL texture for V plane");
    gl.uniform1i(gl.getUniformLocation(program, "samplerV"), 2);

    return [yTexture, uTexture, vTexture];
}
