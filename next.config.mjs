/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // @apps-in-toss/web-framework 의 React Native 의존성이
    // 서버 사이드 번들에 포함되지 않도록 처리
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "@apps-in-toss/web-framework",
      ];
    }

    // 브라우저에서 사용 불가한 Node.js 빌트인 모듈 fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },
};

export default nextConfig;
