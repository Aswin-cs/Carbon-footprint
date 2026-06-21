import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: [
        '.next/**',
        'node_modules/**',
        'fix_contrast.js',
        'fix_svgs.js',
        'postcss.config.mjs',
        'tailwind.config.ts',
        'next.config.*',
        'vitest.setup.ts',
        'vitest.config.mts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        'app/layout.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
