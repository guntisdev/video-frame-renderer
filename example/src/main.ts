import { createRenderer } from "video-frame-renderer";
import { getRgbaPixels } from "./getRGBApixels";

window.onload = () => {
    const appDiv: HTMLDivElement = document.querySelector('#app');
    const canvas = document.createElement('canvas');
    appDiv.appendChild(canvas);
    const rendererOrError = createRenderer(canvas);
    if (rendererOrError instanceof Error) return console.error(rendererOrError);
    const renderer = rendererOrError;

    getRgbaPixels('assets/cat-rainbow.webp')
        .then(pixels => {
            renderer.draw({
                codedWidth: 512,
                codedHeight: 512,
                data: pixels,
                format: 'RGBA',
            });
        });
}
