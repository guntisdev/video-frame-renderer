import { Renderer, createRenderer } from "video-frame-renderer";

export function createRendererList(count: number, container: HTMLDivElement) {
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
