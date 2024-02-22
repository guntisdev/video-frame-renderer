import { RenderFrame } from '../createRenderer';
import { createWebGLProgram, createWebglTexture } from './createWebGLProgram';
import { GlRenderer } from './';
import { vertexShaderSource } from './common';

export function createNv12Webgl(gl: WebGLRenderingContext): GlRenderer | Error {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    const program = createWebGLProgram(
        gl,
        [[vertexShaderSource, gl.VERTEX_SHADER], [fragmentShaderSource, gl.FRAGMENT_SHADER]],
    );
    if (program instanceof Error) return program;

    const initResult = initTexture(gl, program);
    if (initResult instanceof Error) return initResult;

    const [yTexture, uvTexture] = initResult;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    
    return {
        render: (frame: RenderFrame): void => {
            const ySize = frame.codedWidth * frame.codedHeight;
            const uvSize = ySize / 2; // UV plane size is half of Y plane size in NV12
            const yPixels = new Uint8Array(frame.data.slice(0, ySize));
            const uvPixels = new Uint8Array(frame.data.slice(ySize, ySize + uvSize));

            // Bind and update Y texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, yTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, frame.codedWidth, frame.codedHeight, 0,
                gl.LUMINANCE, gl.UNSIGNED_BYTE, yPixels);

            // Bind and update UV texture
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, uvTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE_ALPHA, frame.codedWidth / 2, frame.codedHeight / 2, 0,
                gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE, uvPixels);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    };
}

const fragmentShaderSource = `
    precision lowp float;
    uniform sampler2D samplerY;
    uniform sampler2D samplerUV;
    varying vec2 v_texCoord;

    float sContrastValue = 1.5;
    float sBrightnessValue = -0.1;

    void main() {
        float r, g, b, y, u, v;

        y = texture2D(samplerY, v_texCoord).r;
        u = texture2D(samplerUV, v_texCoord).r - 0.5;
        v = texture2D(samplerUV, v_texCoord).a - 0.5;


        r = y + 1.13983*v;
        g = y - 0.39465*u - 0.58060*v;
        b = y + 2.03211*u;

        r = r * sContrastValue + sBrightnessValue;
        g = g * sContrastValue + sBrightnessValue;
        b = b * sContrastValue + sBrightnessValue;

        gl_FragColor = vec4(r, g, b, 1.0);
    }
`;

function initTexture(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
): [WebGLTexture, WebGLTexture] | Error {
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

    const yTexture = createWebglTexture(gl);
    if (!yTexture) return new Error("Failed to create WebGL texture for Y plane");
    gl.uniform1i(gl.getUniformLocation(program, "samplerY"), 0);
    gl.activeTexture(gl.TEXTURE1);

    const uvTexture = createWebglTexture(gl);
    if (!uvTexture) return new Error("Failed to create WebGL texture for UV plane");
    gl.uniform1i(gl.getUniformLocation(program, "samplerUV"), 1);
    gl.activeTexture(gl.TEXTURE2);

    return [yTexture, uvTexture];
}
