import { RenderFrame } from '../createRenderer';
import { createWebGLProgram, createWebglTexture } from './createWebGLProgram';
import { GlRenderer } from './';
import { vertexShaderSource } from './common';

export function createBgrxWebgl(gl: WebGLRenderingContext): GlRenderer | Error {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    const program = createWebGLProgram(
        gl,
        [[vertexShaderSource, gl.VERTEX_SHADER], [fragmentShaderSource, gl.FRAGMENT_SHADER]],
    );
    if (program instanceof Error) return program;

    const initResult = initTexture(gl, program);
    if (initResult instanceof Error) return initResult;

    const [bgraTexture] = initResult;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    
    return {
        render: (frame: RenderFrame): void => {
            gl.bindTexture(gl.TEXTURE_2D, bgraTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, frame.codedWidth, frame.codedHeight, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(frame.data));
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    };
}

const fragmentShaderSource = `
    precision lowp float;
    uniform sampler2D samplerBGRA;
    varying vec2 v_texCoord;
    
    void main() {
        vec4 texColor = texture2D(samplerBGRA, v_texCoord);
        gl_FragColor = vec4(texColor.b, texColor.g, texColor.r, 1.0);
    }
`;

function initTexture(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
): [WebGLTexture] | Error {
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
    const bgraTexture = createWebglTexture(gl);
    if (!bgraTexture) return new Error("Failed to create WebGL texture");
    gl.uniform1i(gl.getUniformLocation(program, "samplerBGRA"), 0);
    gl.activeTexture(gl.TEXTURE1);

    return [bgraTexture];
}
