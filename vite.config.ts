import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use relative paths for built assets so the app works from /tiles/chatgpt/geojson/
  base: './'
});
