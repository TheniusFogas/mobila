import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: [
        'payload',
        '@payloadcms/db-postgres',
        '@payloadcms/drizzle',
        '@payloadcms/richtext-lexical',
        '@payloadcms/next',
        'drizzle-kit',
        'esbuild',
        'esbuild-register',
        'pino',
        'thread-stream',
    ],
};

export default nextConfig;
