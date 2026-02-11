import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: 'images', dest: '.' },
        { src: 'apollo_icons', dest: '.' },
        { src: 'apps.json', dest: '.' },
        { src: 'apps_noext.json', dest: '.' },
        { src: 'apps_glass.json', dest: '.' },
        { src: 'apps_noext_glass.json', dest: '.' },
      ],
    }),
  ],
  base: '/Apollo/',
})
