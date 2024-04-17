import { Renderer, createRenderer } from "video-frame-renderer";
import { getRawPixels, getRgbaPixels } from "./fetchImage";

function createRendererList(count: number, container: HTMLDivElement) {
    const rendererList: Renderer[] = [];
    for (let i=0; i<count; i++) {
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const rendererOrError = createRenderer(canvas);
        if (rendererOrError instanceof Error) return rendererOrError;
        rendererList.push(rendererOrError);
    }

    return rendererList;
}

window.onload = () => {
    const appDiv: HTMLDivElement = document.querySelector('#app');
    const rendererList = createRendererList(3, appDiv);
    if (rendererList instanceof Error) return console.error(rendererList);

    getRgbaPixels('assets/cat-rainbow.webp')
        .then(pixels => {
            rendererList[0].draw({
                codedWidth: 512,
                codedHeight: 512,
                data: pixels,
                format: 'RGBA',
            });
        });

    getRawPixels('assets/cat-rainbow-nv12.yuv')
        .then(pixels => {
            rendererList[1].draw({
                codedWidth: 512,
                codedHeight: 512,
                data: pixels,
                format: 'NV12',
            });
        });

    getRawPixels('assets/cat-rainbow-i420.yuv')
        .then(pixels => {
            rendererList[2].draw({
                codedWidth: 512,
                codedHeight: 512,
                data: pixels,
                format: 'I420',
            });
        });
}
