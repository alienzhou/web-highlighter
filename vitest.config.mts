import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@src': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        // Each spec sets up its own DOM via jsdom-global (some need a custom user agent),
        // so tests run in the plain node environment.
        environment: 'node',
        include: ['test/**/*.spec.ts'],
        testTimeout: 50000,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            reporter: ['text', 'lcov'],
        },
    },
});
