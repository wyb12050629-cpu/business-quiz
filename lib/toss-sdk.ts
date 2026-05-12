/**
 * Toss 인앱 광고 & 공유 리워드 SDK 래퍼
 * 패키지: @apps-in-toss/web-framework
 *
 * 테스트 광고 그룹 ID (콘솔 발급 ID로 교체 전까지 사용):
 *   배너(리스트형): ait-ad-test-banner-id
 *   배너(피드형):   ait-ad-test-native-image-id
 *   전면형/리워드:  ait-ad-test-rewarded-id  /  ait-ad-test-interstitial-id
 *
 * ✏️ = 출시 전 실제 콘솔 ID로 교체 필요
 */

import {
  TossAds,
  loadFullScreenAd,
  showFullScreenAd,
  contactsViral,
} from "@apps-in-toss/web-framework";

// ────────────────────────────────────────────────────────────
// 광고 그룹 ID 상수
// ────────────────────────────────────────────────────────────
export const AD_GROUP_IDS = {
  BANNER: "ait.v2.live.7dcbc970fbd64914",
  REWARDED: "ait.v2.live.0e829aaf49e54308",
  INTERSTITIAL: "ait-ad-test-interstitial-id",
} as const;

/** 결과 페이지 공유 → 스탬프 5개 지급 */
export const SHARE_MODULE_ID = "d4fd7b9c-6647-418f-ab22-f32953786e5f";

/** 오답 시 공유 → 재도전 기회 1회 지급 */
export const CHANCE_MODULE_ID = "61da5ee5-11e8-4db3-8e4e-69387cbc0895";

// ────────────────────────────────────────────────────────────
// 안전한 isSupported 헬퍼 (토스앱 외부 환경에서 에러 방지)
// ────────────────────────────────────────────────────────────
function safeIsSupported(fn: { isSupported: () => boolean }): boolean {
  try {
    return fn.isSupported();
  } catch {
    return false;
  }
}

// ────────────────────────────────────────────────────────────
// 배너 광고 SDK 초기화
// app/layout.tsx 또는 최상위 컴포넌트에서 한 번만 호출
// ────────────────────────────────────────────────────────────
export function initTossAds(onReady?: () => void): void {
  if (!safeIsSupported(TossAds.initialize)) {
    console.warn("[TossAds] 이 환경에서는 배너 광고를 사용할 수 없어요 (토스앱 5.241+ 필요)");
    return;
  }
  TossAds.initialize({
    callbacks: {
      onInitialized: () => {
        console.log("[TossAds] 배너 광고 SDK 초기화 완료");
        onReady?.();
      },
      onInitializationFailed: (error) => {
        console.error("[TossAds] 배너 광고 SDK 초기화 실패:", error);
      },
    },
  });
}

// ────────────────────────────────────────────────────────────
// 배너 광고 — attachBanner
// 반환된 destroy()를 컴포넌트 언마운트 시 호출하세요
// ────────────────────────────────────────────────────────────
export function attachBannerAd(
  container: HTMLElement,
  onImpression?: () => void
): (() => void) | undefined {
  if (!safeIsSupported(TossAds.attachBanner)) {
    console.warn("[TossAds] attachBanner 미지원 환경");
    return undefined;
  }
  const result = TossAds.attachBanner(AD_GROUP_IDS.BANNER, container, {
    theme: "auto",
    tone: "blackAndWhite",
    variant: "expanded",
    callbacks: {
      onAdRendered: (p) => console.debug("[Banner] 렌더링 완료:", p.slotId),
      onAdViewable: (p) => console.debug("[Banner] 화면 노출:", p.slotId),
      onAdImpression: (p) => {
        console.debug("[Banner] 노출 기록 (수익 발생):", p.slotId);
        onImpression?.();
      },
      onAdFailedToRender: (p) =>
        console.error("[Banner] 렌더링 실패:", p.error.message),
      onNoFill: () => console.warn("[Banner] 표시할 광고 없음"),
    },
  });
  return result?.destroy;
}

// ────────────────────────────────────────────────────────────
// 리워드 광고 — loadFullScreenAd + showFullScreenAd
// 흐름: loadFullScreenAd → loaded 이벤트 → showFullScreenAd
//       → userEarnedReward 이벤트 → 리워드 지급
//       → dismissed → 다음 로드
// ────────────────────────────────────────────────────────────
let unregisterLoad: (() => void) | null = null;

/** 리워드 광고 미리 로드 (퀴즈 화면 진입 시 호출 권장) */
export function preloadRewardedAd(): () => void {
  if (!safeIsSupported(loadFullScreenAd)) {
    console.warn("[FullScreenAd] 미지원 환경 (토스앱 5.247+ 필요)");
    return () => {};
  }
  unregisterLoad?.();

  const unregister = loadFullScreenAd({
    options: { adGroupId: AD_GROUP_IDS.REWARDED },
    onEvent: (event) => {
      if (event.type === "loaded") {
        console.debug("[FullScreenAd] 리워드 광고 로드 완료");
      }
    },
    onError: (error) => {
      console.error("[FullScreenAd] 광고 로드 실패:", error);
    },
  });

  unregisterLoad = unregister;
  return unregister;
}

/**
 * 리워드 광고 재생
 * @param onRewarded  userEarnedReward 이벤트 발생 시 호출 (리워드 지급)
 * @param onDismissed 광고 닫힘 시 호출
 * @param onFailed    표시 실패 시 호출
 */
export function showRewardedAd(
  onRewarded: (unitType: string, unitAmount: number) => void,
  onDismissed?: () => void,
  onFailed?: () => void
): void {
  // 개발 환경 / 미지원 환경 fallback
  if (!safeIsSupported(showFullScreenAd)) {
    console.warn("[FullScreenAd] 미지원 환경 — 개발 fallback: 리워드 즉시 지급");
    onRewarded("기회", 1);
    return;
  }

  const unregister = showFullScreenAd({
    options: { adGroupId: AD_GROUP_IDS.REWARDED },
    onEvent: (event) => {
      switch (event.type) {
        case "requested":
          console.debug("[FullScreenAd] 광고 표시 요청됨");
          break;
        case "show":
          console.debug("[FullScreenAd] 광고 화면 표시");
          break;
        case "impression":
          console.debug("[FullScreenAd] 노출 기록 (수익 발생)");
          break;
        case "userEarnedReward":
          // ✅ 반드시 이 이벤트에서만 리워드 지급
          console.debug("[FullScreenAd] 리워드 획득:", event.data);
          onRewarded(event.data.unitType, event.data.unitAmount);
          break;
        case "dismissed":
          console.debug("[FullScreenAd] 광고 닫힘");
          onDismissed?.();
          unregister();
          // 다음 광고 미리 로드
          preloadRewardedAd();
          break;
        case "failedToShow":
          console.error("[FullScreenAd] 광고 표시 실패");
          onFailed?.();
          unregister();
          break;
      }
    },
    onError: (error) => {
      console.error("[FullScreenAd] 광고 표시 에러:", error);
      onFailed?.();
      unregister();
    },
  });
}

// ────────────────────────────────────────────────────────────
// 공유 리워드 — contactsViral
// 공식 API: @apps-in-toss/web-framework
// ────────────────────────────────────────────────────────────
export interface ShareRewardResult {
  rewardAmount: number;
  rewardUnit: string;
}

/**
 * 친구 공유 리워드 실행
 *
 * @param onReward  공유 1건 완료 → sendViral 이벤트 (rewardAmount, rewardUnit)
 * @param onClose   모듈 종료 → close 이벤트 (clickBackButton | noReward, sentCount)
 * @param onError   에러 발생
 */
export function showShareReward(
  onReward: (result: ShareRewardResult) => void,
  onClose?: (reason: "clickBackButton" | "noReward", sentCount: number) => void,
  onError?: (error: unknown) => void,
  moduleId: string = SHARE_MODULE_ID
): void {
  try {
    const cleanup = contactsViral({
      options: { moduleId },
      onEvent: (event) => {
        if (event.type === "sendViral") {
          // 친구 1명 공유 완료 → 리워드 지급
          onReward({
            rewardAmount: event.data.rewardAmount,
            rewardUnit: event.data.rewardUnit,
          });
        } else if (event.type === "close") {
          onClose?.(event.data.closeReason, event.data.sentRewardsCount);
          cleanup(); // 반드시 cleanup 호출
        }
      },
      onError: (error) => {
        console.error("[contactsViral] 에러:", error);
        onError?.(error);
        cleanup?.();
      },
    });
  } catch (error) {
    console.error("[contactsViral] 실행 중 에러:", error);
    onError?.(error);
  }
}
