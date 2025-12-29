import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Suas outras configs (se houver, como images) */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Para fotos do Google
      },
    ],
  },
  
  // 👇 ADICIONE ESTE BLOCO DE HEADERS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups', // <--- O SEGREDO ESTÁ AQUI
          },
        ],
      },
    ];
  },
};

export default nextConfig;