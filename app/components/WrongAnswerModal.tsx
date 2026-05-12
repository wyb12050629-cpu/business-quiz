"use client";

import { useState } from "react";
import { showRewardedAd, showShareReward } from "@/lib/toss-sdk";

interface WrongAnswerModalProps {
  onRetry: () => void;   // 기회 획득 후 같은 문제 재도전
  onNext: () => void;    // 기회 포기 → 오늘 종료
  correctAnswer: string;
  explanation: string;
}

type ModalState = "idle" | "loading" | "done";

export default function WrongAnswerModal({
  onRetry,
  onNext,
  correctAnswer,
  explanation,
}: WrongAnswerModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [message, setMessage] = useState("");

  // ── 광고 보기 ──────────────────────────────────────────────
  // 흐름: showRewardedAd → userEarnedReward → onRewarded → onRetry
  //       dismissed (without reward) → onDismissed → 메시지 표시
  function handleWatchAd() {
    setState("loading");
    setMessage("광고를 불러오고 있어요...");

    showRewardedAd(
      // onRewarded: userEarnedReward 이벤트 → 리워드 지급
      () => {
        setMessage("기회 1회가 추가됐어요! 다시 도전해 보세요 🎉");
        setState("done");
        setTimeout(onRetry, 1200);
      },
      // onDismissed: 광고 닫힘 (리워드 없이 닫은 경우)
      () => {
        if (state !== "done") {
          setMessage("광고를 끝까지 시청해야 기회를 얻을 수 있어요.");
          setState("idle");
        }
      },
      // onFailed
      () => {
        setMessage("광고를 불러오지 못했어요. 다시 시도해 주세요.");
        setState("idle");
      }
    );
  }

  // ── 공유하기 ───────────────────────────────────────────────
  // 흐름: contactsViral → sendViral (공유 1건 완료) → onReward → onRetry
  //       close (뒤로가기 or 리워드 소진) → onClose
  function handleShare() {
    setState("loading");
    setMessage("친구 목록을 불러오고 있어요...");

    showShareReward(
      // onReward: sendViral — 친구 1명 공유 완료
      ({ rewardAmount, rewardUnit }) => {
        setMessage(`공유 완료! ${rewardAmount}${rewardUnit} 기회가 추가됐어요 🎉`);
        setState("done");
        setTimeout(onRetry, 1300);
      },
      // onClose: 모듈 종료
      (reason, sentCount) => {
        if (sentCount > 0) return; // onReward에서 이미 처리됨
        if (reason === "noReward") {
          setMessage("오늘 공유 가능한 횟수를 모두 사용했어요.");
        } else {
          setMessage(""); // 뒤로가기로 닫음
        }
        setState("idle");
      },
      // onError
      () => {
        setMessage("공유 중 오류가 발생했어요. 다시 시도해 주세요.");
        setState("idle");
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 딤 */}
      <div className="absolute inset-0 bg-black/40" onClick={onNext} />

      {/* 바텀 시트 */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl px-5 pt-6 pb-10 z-10">
        {/* 핸들 */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {/* 오답 안내 */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">😅</div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "#191f28" }}>
            아쉽게도 틀렸어요
          </h2>
          <p className="text-sm" style={{ color: "#4e5968" }}>
            정답:{" "}
            <span className="font-semibold" style={{ color: "#3182f6" }}>
              {correctAnswer}
            </span>
          </p>
          <p className="text-sm mt-1 leading-relaxed px-2" style={{ color: "#8b95a1" }}>
            {explanation}
          </p>
        </div>

        {/* 상태 메시지 */}
        {message && (
          <div
            className="text-center text-sm font-medium mb-4 py-2.5 px-4 rounded-xl"
            style={{ backgroundColor: "#ebf3ff", color: "#3182f6" }}
          >
            {message}
          </div>
        )}

        {/* idle: 선택지 */}
        {state === "idle" && (
          <>
            <p className="text-center text-sm font-medium mb-4" style={{ color: "#4e5968" }}>
              한 번 더 도전할 기회를 얻으세요!
            </p>
            <div className="space-y-3">
              {/* 광고 보기 */}
              <button
                onClick={handleWatchAd}
                className="w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{ backgroundColor: "#3182f6" }}
              >
                <span>📺</span>
                <span>광고 보고 다시 도전</span>
              </button>

              {/* 공유하기 */}
              <button
                onClick={handleShare}
                className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{ backgroundColor: "#f2f4f6", color: "#4e5968" }}
              >
                <span>🔗</span>
                <span>친구에게 공유하고 다시 도전</span>
              </button>

              {/* 기회 포기 */}
              <button
                onClick={onNext}
                className="w-full py-3 text-sm font-medium active:scale-95 transition-all"
                style={{ color: "#8b95a1" }}
              >
                오늘은 여기까지 (기회 포기)
              </button>
            </div>
          </>
        )}

        {/* loading: 스피너 */}
        {state === "loading" && (
          <div className="text-center py-8">
            <div
              className="inline-block w-9 h-9 border-4 rounded-full animate-spin"
              style={{ borderColor: "#e5e8eb", borderTopColor: "#3182f6" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
