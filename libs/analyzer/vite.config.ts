import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const root = path.resolve(__dirname, 'src/ui');
const outDir = path.resolve(__dirname, 'dist/ui');

export default defineConfig(({ command }) => ({
    root,
    cacheDir: '../../node_modules/.vite/libs/analyzer',
    plugins: [react()],
    build: {
        outDir,
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: path.resolve(root, 'index.html'),
        },
    },
    server: {
        port: 3333,
        strictPort: true,
        open: false,
    },
    preview: {
        port: 3333,
        open: true,
    },
    test: {
        name: '@code-analyzer/analyzer',
        watch: false,
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: './test-output/vitest/coverage',
            provider: 'v8' as const,
        },
    },
}));
