import { RenderFrame } from "../createRenderer";
import { createBgraWebgl } from "./bgra";
import { createBgrxWebgl } from "./bgrx";
import { createI420Webgl } from "./i420";
import { createI422Webgl } from "./i422";
import { createI444Webgl } from "./i444";
import { createNv12Webgl } from "./nv12";
import { createRgbaWebgl } from "./rgba";
import { createRgbxWebgl } from "./rgbx";
import { createVideoFrameWebgl } from "./videoFrameWebgl";

// type VideoPixelFormat = "BGRA" | "BGRX" | "I420" | "I420A" | "I422" | "I444" | "NV12" | "RGBA" | "RGBX";
export function initFromPixelFormat(gl: WebGLRenderingContext, format?: VideoPixelFormat) {
    let result: GlRenderer | Error;
    switch(format) {
        case "RGBA": result = createRgbaWebgl(gl); break;
        case "RGBX": result = createRgbxWebgl(gl); break;
        case "BGRA": result = createBgraWebgl(gl); break;
        case "BGRX": result = createBgrxWebgl(gl); break;
        case "NV12": result = createNv12Webgl(gl); break;
        case "I420": result = createI420Webgl(gl); break;
        case "I420A": result = createI420Webgl(gl); break; // same renderer can be used, Alpha pixels will be skipped
        case "I422": result = createI422Webgl(gl); break;
        case "I444": result = createI444Webgl(gl); break;
        default: result = createVideoFrameWebgl(gl); break;
    }

    return result;
}

export type GlRenderer = {
    render: (frame: RenderFrame) => void,
}
