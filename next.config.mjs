/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

// Security headers — HSTS excluded in dev to prevent localhost issues
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",  value: "on" },
  { key: "X-XSS-Protection",        value: "1; mode=block" },
  { key: "X-Frame-Options",         value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=(self)" },
  ...(!isDev ? [{
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  }] : []),
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://www.google-analytics.com",
      "frame-src 'self' https://js.paystack.co",
      "media-src 'self' https:",
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
      { protocol: "https", hostname: "avatar.vercel.sh" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
    deviceSizes: [640, 750, 828, 1080, 1200],
  },

  // Tell Next.js to transpile packages that ship raw ESM or have issues
  transpilePackages: ["framer-motion"],

  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/images/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/lottie/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "react-icons",
      "date-fns",
    ],
  },

  webpack(config, { isServer, dev }) {
    // Disable source maps in production client bundle (faster build + smaller output)
    if (!isServer && !dev) config.devtool = false;

    // Prevent node built-ins leaking into client bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "node:crypto": false,
        "node:stream": false,
        "node:buffer": false,
      };
    }

    return config;
  },
};

export default nextConfig;
