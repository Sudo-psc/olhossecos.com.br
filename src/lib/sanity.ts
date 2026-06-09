import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const client = createClient({
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'qum5qhgj',
    dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
    useCdn: true, // Use a CDN for faster response times, set to false for real-time preview
    apiVersion: '2024-01-01', // Use current date
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
    if (!source) return null;
    return builder.image(source);
}

// Tipos básicos para o Blog
export interface SanityPost {
    _id: string;
    title: string;
    slug: {
        current: string;
    };
    mainImage: any;
    publishedAt: string;
    body: any;
    excerpt: string;
    author?: {
        name: string;
        image: any;
    };
    categories?: Array<{
        title: string;
    }>;
}
