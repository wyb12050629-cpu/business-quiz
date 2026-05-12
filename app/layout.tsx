import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import TossAdsInitializer from "@/app/components/TossAdsInitializer";

export const metadata: Metadata = {
  title: "비즈니스 퀴즈",
  description: "비즈니스 지식을 퀴즈로 테스트하고 포인트를 모아보세요!",
  other: {
    "toss-mini-app": "true",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 antialiased">
        <AuthProvider>
          {/* TossAds.initialize() — 앱 시작 시 한 번만 호출 */}
          <TossAdsInitializer />
          <div className="max-w-md mx-auto min-h-screen relative">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
