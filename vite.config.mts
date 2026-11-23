import reactSwc from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
// eslint-disable-next-line import/no-unresolved
import { defineConfig as defineVitestConfig } from 'vitest/config';

export default defineConfig(
  defineVitestConfig(({ mode }) => {
    const isDevelopment = mode === 'development';

    return {
      base: './',
      server: {
        port: 3000,
      },
      plugins: [reactSwc()],
      define: {
        __FEATURE_FLAGS__: JSON.stringify({
          developmentMode: isDevelopment,
        }),
      },
      build: {
        outDir: 'build',
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            manualChunks: undefined,
            assetFileNames: 'assets/[name].[ext]',
            chunkFileNames: 'assets/[name].[hash].js',
            entryFileNames: '[name].[hash].js',
          },
        },
      },
      root: './',
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      },
    };
  })
);
