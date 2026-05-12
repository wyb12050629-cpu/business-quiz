"use client";

import { useState } from "react";
import { showRewardedAd, showShareReward, CHANCE_MODULE_ID } from "@/lib/toss-sdk";

interface WrongAnswerModalProps {
  onRetry: () => void;
  /** 기회 포기 — 오늘 도전 종료. 호출 시 Firestore에 isFailed=true 저장됨 */
  onGiveUp: () => void;
}

type ModalState = "idle" | "loading" | "done";

export default function WrongAnswerModal({
  onRetry,
  onGiveUp,
}: WrongAnswerModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [message, setMessage] = useState("");

  function handleWatchAd() {
    setState("loading");
    setMessage("광고를 불러오고 있어요...");

    showRewardedAd(
      () => {
        setMessage("기회 1회가 추가됐어요! 다시 도전해 보세요 🎉");
        setState("done");
        setTimeout(onRetry, 1200);
      },
      () => {
        if (state !== "done") {
          setMessage("광고를 끝까지 시청해야 기회를 얻을 수 있어요.");
          setState("idle");
        }
      },
      () => {
        setMessage("광고를 불러오지 못했어요. 다시 시도해 주세요.");
        setState("idle");
      }
    );
  }

  function handleShare() {
    setState("loading");
    setMessage("친구 목록을 불러오고 있어요...");

    showShareReward(
      ({ rewardAmount, rewardUnit }) => {
        setMessage(`공유 완료! ${rewardAmount}${rewardUnit} 기회가 추가됐어요 🎉`);
        setState("done");
        setTimeout(onRetry, 1300);
      },
      (reason, sentCount) => {
        if (sentCount > 0) return;
        if (reason === "noReward") {
          setMessage("오늘 공유 가능한 횟수를 모두 사용했어요.");
        } else {
          setMessage("");
        }
        setState("idle");
      },
      () => {
        setMessage("공유 중 오류가 발생했어요. 다시 시도해 주세요.");
        setState("idle");
      },
      CHANCE_MODULE_ID   // 오답 재도전 전용 모듈
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 백드롭 클릭 = 오늘 도전 포기 */}
      <div className="absolute inset-0 bg-black/40" onClick={onGiveUp} />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl px-5 pt-6 pb-10 z-10">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="text-center mb-5">
          <div className="text-4xl mb-2">😅</div>
          <h2 className="text-xl font-bold mb-1 text-gray-900">
            아쉽게도 틀렸어요
          </h2>
          <p className="text-sm text-slate-500">
            광고를 보거나 친구에게 공유하면 다시 도전할 수 있어요
          </p>
        </div>

        {message && (
          <div className="text-center text-sm font-medium mb-4 py-2.5 px-4 rounded-xl bg-blue-50 text-blue-500">
            {message}
          </div>
        )}

        {state === "idle" && (
          <div className="space-y-3">
            <button
              onClick={handleWatchAd}
              className="w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 active:scale-95 transition-all bg-blue-500"
            >
              <span>📺</span>
              <span>광고 보고 다시 도전</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-all bg-gray-100 text-slate-600"
            >
              <span>🔗</span>
              <span>친구에게 공유하고 다시 도전</span>
            </button>

            {/* 포기 버튼 — 오늘 도전 종료, 내일부터 다시 시작 */}
            <button
              onClick={onGiveUp}
              className="w-full py-3 text-sm font-medium active:scale-95 transition-all text-rose-400"
            >
              내일 다시 도전하기
            </button>
          </div>
        )}

        {state === "loading" && (
          <div className="text-center py-8">
            <div className="inline-block w-9 h-9 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
