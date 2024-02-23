export async function getRgbaPixels(
    url: string,
    size: number = 512,
): Promise<ArrayBuffer> {
    return new Promise(resolve => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = url;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size)
            const pixelData = ctx.getImageData(0, 0, size, size);
            resolve(pixelData.data.buffer);
        }
    });
}
