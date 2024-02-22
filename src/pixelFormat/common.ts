export const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = a_position;
        v_texCoord = a_texCoord;
    }
`;

export const yuvFragmentShaderSource = `
    precision lowp float;
    uniform sampler2D samplerY;
    uniform sampler2D samplerU;
    uniform sampler2D samplerV;
    varying vec2 v_texCoord;
    void main() {
        float r,g,b,y,u,v,fYmul;
        y = texture2D(samplerY, v_texCoord).r;
        u = texture2D(samplerU, v_texCoord).r;
        v = texture2D(samplerV, v_texCoord).r;
        fYmul = y * 1.1643835616;
        r = fYmul + 1.7927410714 * v - 0.96914450781;
        g = fYmul - 0.2132486143 * u - 0.5329093286 * v + 0.300305;
        b = fYmul + 2.1124017857 * u - 1.12897486719;
        gl_FragColor = vec4(r, g, b, 1.0);
    }
`;
