import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/renaissance-lexicon-react-uvm-e4-2/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8'
    }
  }
})
