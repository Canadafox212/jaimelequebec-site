/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk'],
  webpack: (config, { isServer }) => {
    // Réduit la concurrence webpack pour éviter ERR_MEMORY_ALLOCATION_FAILED sur Windows
    config.parallelism = 1
    return config
  },
}

export default nextConfig
