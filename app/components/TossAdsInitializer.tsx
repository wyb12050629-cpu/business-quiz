"use client";

import { useEffect } from "react";
import { initTossAds } from "@/lib/toss-sdk";

/**
 * TossAds SDK 초기화 컴포넌트
 * - 앱 최상위에서 단 한 번 마운트
 * - TossAds.initialize()는 중복 호출 시 SDK가 자체적으로 무시하지만
 *   가이드에 따라 최상위 컴포넌트에서 한 번만 호출하는 것을 권장
 */
export default function TossAdsInitializer() {
  useEffect(() => {
    initTossAds(() => {
      console.log("[App] TossAds SDK 준비 완료");
    });
  }, []);

  return null; // UI 없음
}
