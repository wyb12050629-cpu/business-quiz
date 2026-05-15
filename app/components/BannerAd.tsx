"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";
import { AD_GROUP_IDS } from "@/lib/toss-sdk";

export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Step 1: TossAds SDK 초기화 (문서 권장: 최초 1회)
  useEffect(() => {
    try {
      if (!TossAds.initialize.isSupported()) {
        console.warn("[TossAds] 배너 광고 미지원 환경 (토스앱 5.241+ 필요)");
        return;
      }
      TossAds.initialize({
        callbacks: {
          onInitialized: () => {
            console.log("[TossAds] 초기화 완료");
            setIsInitialized(true);
          },
          onInitializationFailed: (error) => {
            console.error("[TossAds] 초기화 실패:", error);
          },
        },
      });
    } catch {
      // 토스앱 외부 환경
    }
  }, []);

  // Step 2: 초기화 완료 후에만 배너 부착 (문서 필수 순서)
  const attachBanner = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (!TossAds.attachBanner.isSupported()) return;
      const result = TossAds.attachBanner(AD_GROUP_IDS.BANNER, container, {
        theme: "auto",
        tone: "blackAndWhite",
        variant: "card",
        callbacks: {
          onAdRendered: (p) => console.debug("[Banner] 렌더링 완료:", p.slotId),
          onAdViewable: (p) => console.debug("[Banner] 노출 기록 (수익 발생):", p.slotId),
          onAdFailedToRender: (p) =>
            console.error("[Banner] 렌더링 실패:", p.error.message),
          onNoFill: () => console.warn("[Banner] 표시할 광고 없음"),
        },
      });
      return () => { result?.destroy(); };
    } catch {
      // 에러 무시
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const cleanup = attachBanner();
    return () => { cleanup?.(); };
  }, [isInitialized, attachBanner]);

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* height 고정 금지 — 광고 콘텐츠 높이에 맞게 자동 조절 */}
      {/* 위아래 8px 이상 여백 권장 */}
      <div ref={containerRef} className="w-full py-2" aria-label="광고" />
    </div>
  );
}
