import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { local } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
            fonts: [
                // Self-hosted variable font: the stylesheets use weights between the static cuts.
                local('Instrument Sans', {
                    variants: [
                        {
                            src: 'resources/fonts/instrument-sans-latin-wght-normal.woff2',
                            weight: '400 700',
                        },
                    ],
                }),
            ],
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        chunkSizeWarningLimit: 550,
        rollupOptions: {
            output: {
                // The font plugin names the file after its weight range; keep spaces out of URLs.
                assetFileNames: ({ names }) =>
                    names[0]?.includes(' ')
                        ? `assets/${names[0].replace(/\.[^.]+$/, '').replaceAll(' ', '-')}-[hash][extname]`
                        : 'assets/[name]-[hash][extname]',
            },
        },
    },
});
