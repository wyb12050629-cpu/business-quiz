import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'business-quiz',
  brand: {
    displayName: '직장인 상식 퀴즈',
    primaryColor: '#2780FA', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://static.toss.im/appsintoss/34591/7ab7c17e-33f0-4445-ac58-6b6113310c83.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'next dev',
      build: 'next build',
    },
  },
  permissions: [],
  outdir: '.next',
});
