import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
    site: 'https://olhossecos.com.br',
    output: 'static',
    adapter: node({
        mode: 'standalone'
    }),
    integrations: [
        tailwind(),
        sitemap({
            filter: (page) => !page.includes('/studio/'),
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date(),
        }),
    ],
    vite: {
        define: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        },
        ssr: {
            noExternal: ['html-entities', 'sanitize-html']
        }
    },
    build: {
        format: 'directory',
        inlineStylesheets: 'auto'
    },
    image: {
        // Restrict to specific trusted domains only
        domains: ['olhossecos.com.br', 'cdn.sanity.io'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.sanity.io',
            },
            {
                protocol: 'https',
                hostname: 'olhossecos.com.br',
            },
            {
                protocol: 'https',
                hostname: 'olhossecos.com',
            }
        ],
    },
    compressHTML: true,
    prefetch: {
        prefetchAll: false,
        defaultStrategy: 'hover'
    }
});
