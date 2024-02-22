import { GlRenderer, initFromPixelFormat } from "./pixelFormat";

export type Renderer = {
    draw: (frame: RenderFrame) => true | Error,
    destroy: () => void,
}

export type RenderFrame = {
    data: ArrayBuffer;
    codedWidth: number;
    codedHeight: number;
    format: VideoPixelFormat;
    timestamp?: number;
    layout?: PlaneLayout[];
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer | Error {
    const gl = canvas.getContext("webgl", {preserveDrawingBuffer: true})
        || canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});

    if (!gl || !(gl instanceof WebGLRenderingContext)) {
        return new Error("WebGL not supported");
    }

    let renderer: GlRenderer | undefined;

    return {
        draw: (frame: RenderFrame): true | Error => {
            if (!renderer) {
                const result = initFromPixelFormat(gl, frame.format);
                if (result instanceof Error) return result;
                renderer = result
            }

            if (canvas.width !== frame.codedWidth || canvas.height !== frame.codedHeight) {
                canvas.height = frame.codedHeight;
                canvas.width = frame.codedWidth;
                gl.viewport(0, 0, frame.codedWidth, frame.codedHeight);
            }

            try {
                renderer.render(frame);
            } catch (e) { return unknownToError(e); };

            return true;
        },

        destroy: () => {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        },
    };
}


function unknownToError(e: unknown): Error {
    if (e instanceof Error) return e;
    if (typeof e === 'string') return new Error(e);
    if (e === undefined || e === null) new Error('Fail while rendering on gl');
    return new Error(JSON.stringify(e));
}
