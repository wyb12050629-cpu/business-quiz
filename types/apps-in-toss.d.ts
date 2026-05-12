/**
 * @apps-in-toss/web-framework 타입 선언
 * 패키지 설치 전 임시 타입 — 설치 후 이 파일은 자동으로 무시돼요
 *
 * 설치:
 *   npm install @apps-in-toss/web-framework
 */

declare module "@apps-in-toss/web-framework" {
  // ── TossAds (배너 광고) ───────────────────────────────────

  interface TossAdsInitializeOptions {
    callbacks?: {
      onInitialized?: () => void;
      onInitializationFailed?: (error: Error) => void;
    };
  }

  interface TossAdsAttachBannerOptions {
    theme?: "auto" | "light" | "dark";
    tone?: "blackAndWhite" | "grey";
    variant?: "card" | "expanded";
    callbacks?: TossAdsBannerSlotCallbacks;
  }

  interface TossAdsBannerSlotEventPayload {
    slotId: string;
    adGroupId: string;
    adMetadata: { creativeId: string; requestId: string };
  }

  interface TossAdsBannerSlotErrorPayload {
    slotId: string;
    adGroupId: string;
    adMetadata: Record<string, unknown>;
    error: { code: number; message: string; domain?: string };
  }

  interface TossAdsBannerSlotCallbacks {
    onAdRendered?: (payload: TossAdsBannerSlotEventPayload) => void;
    onAdViewable?: (payload: TossAdsBannerSlotEventPayload) => void;
    onAdClicked?: (payload: TossAdsBannerSlotEventPayload) => void;
    onAdImpression?: (payload: TossAdsBannerSlotEventPayload) => void;
    onAdFailedToRender?: (payload: TossAdsBannerSlotErrorPayload) => void;
    onNoFill?: (payload: { slotId: string; adGroupId: string; adMetadata: Record<string, unknown> }) => void;
  }

  interface TossAdsAttachBannerResult {
    destroy: () => void;
  }

  interface TossAdsInitializeFn {
    (options: TossAdsInitializeOptions): void;
    isSupported: () => boolean;
  }

  interface TossAdsAttachBannerFn {
    (
      adGroupId: string,
      target: string | HTMLElement,
      options?: TossAdsAttachBannerOptions
    ): TossAdsAttachBannerResult;
    isSupported: () => boolean;
  }

  interface TossAdsDestroyAllFn {
    (): void;
    isSupported: () => boolean;
  }

  export const TossAds: {
    initialize: TossAdsInitializeFn;
    attachBanner: TossAdsAttachBannerFn;
    destroyAll: TossAdsDestroyAllFn;
  };

  // ── loadFullScreenAd (전면형 / 리워드 광고) ───────────────

  interface LoadFullScreenAdOptions {
    adGroupId: string;
  }

  interface LoadFullScreenAdEvent {
    type: "loaded";
  }

  interface LoadFullScreenAdParams {
    options: LoadFullScreenAdOptions;
    onEvent: (event: LoadFullScreenAdEvent) => void;
    onError: (err: unknown) => void;
  }

  interface LoadFullScreenAdFn {
    (params: LoadFullScreenAdParams): () => void;
    isSupported: () => boolean;
  }

  export const loadFullScreenAd: LoadFullScreenAdFn;

  // ── showFullScreenAd ──────────────────────────────────────

  interface ShowFullScreenAdOptions {
    adGroupId: string;
  }

  type ShowFullScreenAdEvent =
    | { type: "requested" }
    | { type: "show" }
    | { type: "impression" }
    | { type: "clicked" }
    | { type: "dismissed" }
    | { type: "failedToShow" }
    | { type: "userEarnedReward"; data: { unitType: string; unitAmount: number } };

  interface ShowFullScreenAdParams {
    options: ShowFullScreenAdOptions;
    onEvent: (event: ShowFullScreenAdEvent) => void;
    onError: (err: unknown) => void;
  }

  interface ShowFullScreenAdFn {
    (params: ShowFullScreenAdParams): () => void;
    isSupported: () => boolean;
  }

  export const showFullScreenAd: ShowFullScreenAdFn;

  // ── contactsViral (공유 리워드) ───────────────────────────

  interface ContactsViralOption {
    moduleId: string;
  }

  type ContactsViralSuccessEvent = {
    type: "close";
    data: {
      closeReason: "clickBackButton" | "noReward";
      sentRewardAmount?: number;
      sendableRewardsCount?: number;
      sentRewardsCount: number;
      rewardUnit?: string;
    };
  };

  type RewardFromContactsViralEvent = {
    type: "sendViral";
    data: {
      rewardAmount: number;
      rewardUnit: string;
    };
  };

  type ContactsViralEvent = ContactsViralSuccessEvent | RewardFromContactsViralEvent;

  interface ContactsViralParams {
    options: ContactsViralOption;
    onEvent: (event: ContactsViralEvent) => void;
    onError: (error: unknown) => void;
  }

  export function contactsViral(params: ContactsViralParams): () => void;

  // ── 유저 식별키 ───────────────────────────────────────────
  // 게임 카테고리:   getUserKeyForGame  (SDK 1.4.0+, 토스앱 5.232.0+)
  // 비게임 카테고리: getAnonymousKey    (SDK 2.4.5+)
  //
  // 두 함수 모두 미니앱별 고유 hash 값을 반환해요.
  // 미지원 버전에서는 undefined를 반환해요.
  //
  // ⚠️ 콘솔에 등록된 카테고리와 일치하는 함수를 사용해야 해요.

  /**
   * 게임 카테고리 미니앱 전용 유저 식별키
   * @returns 고유 hash 키 (미지원 환경에서는 undefined)
   */
  export function getUserKeyForGame(): Promise<string | undefined>;

  /**
   * 비게임 카테고리 미니앱 전용 유저 식별키
   * @returns 고유 hash 키 (미지원 환경에서는 undefined)
   */
  export function getAnonymousKey(): Promise<string | undefined>;
}
