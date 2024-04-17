# video-frame-renderer

## Overview
video-frame-renderer is a library designed to provide a performant method for drawing `VideoFrame` objects on WebGL (GPU) while supporting various pixel formats. This library is particularly useful for applications requiring high-efficiency video processing in web environments, as it optimizes the rendering pathway to utilize GPU capabilities for pixel format conversion and rendering.

## Supported Pixel Formats
The library supports a wide range of pixel formats, including:
- BGRA
- BGRX
- I420
- I420A
- I422
- I444
- NV12
- RGBA
- RGBX

## Why video-frame-renderer?
Video frames may be returned from the browser in different pixel formats, such as I420 and NV12, which represent YUV formats. These formats are more data-efficient compared to RGBA but require conversion for rendering, traditionally done via CPU, leading to performance bottlenecks. video-frame-renderer addresses this issue by performing YUV to RGBA conversion directly on the GPU, ensuring high performance and efficiency.

## API
```ts
type Renderer = {
    draw: (frame: RenderFrame) => true | Error;
    destroy: () => void;
};

type RenderFrame = {
    data: ArrayBuffer;
    codedWidth: number;
    codedHeight: number;
    format: VideoPixelFormat;
    timestamp?: number;
    layout?: PlaneLayout[];
};

function createRenderer(canvas: HTMLCanvasElement): Renderer | Error;
```

## Usage
Below is a basic example of how to use `video-frame-renderer` to render a `VideoFrame` from a `VideoDecoder` output:

```ts
const frame: VideoFrame = ... // VideoDecoder output

// Rectangle needed for Androids to correctly copy frame
const rect = { x: 0, y: 0, width: frame.codedWidth, height: frame.codedHeight };
const size = frame.allocationSize({ rect });
const data = new ArrayBuffer(size);

frame.copyTo(data, { rect })
    .then(() => {
        const renderFrame = {
            codedWidth: frame.codedWidth,
            codedHeight: frame.codedHeight,
            format: frame.format,
            data,
        };

       const renderer = createRenderer(canvas);
       if (renderer instanceof Error) {
           // Handle error
           return;
       }
       renderer.draw(renderFrame);
});
```

## Installation
```sh
npm install video-frame-renderer
```

## Run examples
```sh
npm run dev
```

## Convert example image rgb to yuv
```sh
ffmpeg -i cat-rainbow.webp -pix_fmt yuv420p cat-rainbow-i420.yuv
ffmpeg -i cat-rainbow.webp -pix_fmt nv12 cat-rainbow-nv12.yuv
```

## GIT
[https://github.com/guntisdev/video-frame-renderer](https://github.com/guntisdev/video-frame-renderer)

## License
video-frame-renderer is MIT licensed.
