import { GlRenderer } from '.';
import { RenderFrame } from '../createRenderer';
import { createWebGLProgram, createWebglTexture } from './createWebGLProgram';

export function createVideoFrameWebgl(gl: WebGLRenderingContext): GlRenderer | Error {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    const program = createWebGLProgram(
        gl,
        [[vertexShaderSource, gl.VERTEX_SHADER], [fragmentShaderSource, gl.FRAGMENT_SHADER]],
    );
    if (program instanceof Error) return program;

    const initResult = initTexture(gl, program);
    if (initResult instanceof Error) return initResult;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    return {
        render: (frame: RenderFrame): void => {
            const videoFrame = new VideoFrame(frame.data, {
                codedHeight: frame.codedHeight,
                codedWidth: frame.codedWidth,
                format: frame.format,
                timestamp: frame.timestamp ?? 0,
                layout: frame.layout,
            });

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoFrame);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },
    };
}

const vertexShaderSource: string = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = a_position;
        v_texCoord = a_texCoord;
    }
`;

const fragmentShaderSource: string = `
    precision mediump float;
    uniform sampler2D u_image;
    varying vec2 v_texCoord;
    void main() {
        gl_FragColor = texture2D(u_image, v_texCoord);
    }
`;

function initTexture(gl: WebGLRenderingContext, program: WebGLProgram): WebGLTexture | Error {
    const texture =  createWebglTexture(gl);
    if (!texture) {
        return new Error("Failed to create WebGl texture");
    }

    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, 1.0, 1.0,  1.0, -1.0, -1.0, -1.0, -1.0, 1.0,  1.0, 1.0, -1.0]), gl.STATIC_DRAW);

    let vertexPositionAttribute = gl.getAttribLocation(program, "a_position");
    if (vertexPositionAttribute === -1) return new Error("Webgl vertex attribute failed");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer); // !
    gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,  1.0]), gl.STATIC_DRAW);

    let textureCoord = gl.getAttribLocation(program, "a_texCoord");
    if (textureCoord === -1) return new Error("Webgl texture attribute failed");
    gl.enableVertexAttribArray(textureCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);

    return texture;
}