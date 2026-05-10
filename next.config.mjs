/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the multi-stage Dockerfile (it copies .next/standalone into
  // the runtime image). Vercel ignores this; only matters for self-hosted /
  // Docker production deploys.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "image.pollinations.ai" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
};

export default nextConfig;
