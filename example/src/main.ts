import { getRawPixels, getRgbaPixels } from "./fetchImage";
import { createRendererList } from "./createRenderList";

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
