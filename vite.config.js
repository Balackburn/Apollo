import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Apollo/',
  publicDir: 'public',
  plugins: [
    {
      name: 'copy-assets',
      writeBundle() {
        // Assets are in public/ dir, Vite handles copying automatically
      }
    }
  ],
});
