const PIXEL_COUNT = 512 * 512;

// rearranges pixels from Y U V plane to Y and UV planes
export function i420ToNv12(buffer: ArrayBuffer): ArrayBuffer {
    const i420View = new Uint8Array(buffer);
    const nv12Buff = new ArrayBuffer(i420View.length);
    const nv12View = new Uint8Array(nv12Buff);
    nv12View.set(i420View.subarray(0, PIXEL_COUNT))
    // copy u
    for(let u=PIXEL_COUNT, newU=PIXEL_COUNT; u<PIXEL_COUNT*1.25; u++,newU+=2) {
        nv12View[newU] = i420View[u];
    }

    // copy v
    for(let v=PIXEL_COUNT*1.25, newV=PIXEL_COUNT+1; v<PIXEL_COUNT*1.5; v++,newV+=2) {
        nv12View[newV] = i420View[v];
    }
    return nv12Buff;
}
