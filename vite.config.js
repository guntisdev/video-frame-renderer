import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'example'),
  server: {},
  plugins: [],
  resolve: {
    alias: {
      'video-frame-renderer': path.resolve(__dirname, './dist/createRenderer.js'),
    },
  },
});