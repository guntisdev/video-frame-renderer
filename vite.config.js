import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/createRenderer.ts'),
      name: 'video-frame-renderer',
      formats: ['es'],
      fileName: 'createRenderer'
    },
    outDir: resolve(__dirname, 'dist')
  },
  plugins: [dts()]
})