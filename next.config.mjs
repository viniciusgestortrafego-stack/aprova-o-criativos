/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // O link do cliente carrega a assinatura na URL: não vazar via Referer ao abrir prévia/Instagram.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
