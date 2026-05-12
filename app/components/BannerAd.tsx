"use client";

import { useEffect, useRef } from "react";
import { attachBannerAd } from "@/lib/toss-sdk";

/**
 * 토스 배너 광고 — 리스트형 (하단 고정, 96px)
 *
 * 가이드 스펙:
 *   - width: 100% (화면 너비와 동일)
 *   - height: 96px (고정형)
 *   - 위치: 퀴즈 화면 하단 (게임형 서비스 규칙 준수)
 *   - TossAds.initialize()는 layout.tsx에서 한 번만 호출
 */
export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // attachBannerAd는 destroy() 함수를 반환
    const destroy = attachBannerAd(container);

    return () => {
      destroy?.(); // 언마운트 시 배너 제거 (메모리 누수 방지)
    };
  }, []);

  return (
    <div
      id="banner-ad-container"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 448, // max-w-md
        height: 96,
        paddingBottom: "env(safe-area-inset-bottom)",
        backgroundColor: "#fff",
        zIndex: 40,
      }}
    >
      {/* 광고가 부착될 컨테이너 — width: 100%, height: 96px */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "96px" }}
        aria-label="광고"
      >
        {/* SDK 미지원 환경에서 표시되는 플레이스홀더 */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f2f4f6",
            borderTop: "1px solid #e5e8eb",
          }}
        >
          <span style={{ fontSize: 11, color: "#8b95a1" }}>
            광고 영역 (96px · 실기기에서 광고 노출)
          </span>
        </div>
      </div>
    </div>
  );
}
