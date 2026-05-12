"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameState, TodayStatus } from "@/hooks/useGameState";
import StreakCard from "@/app/components/StreakCard";
import PointBadge from "@/app/components/PointBadge";
import RankCard from "@/app/components/RankCard";
import { showRewardedAd } from "@/lib/toss-sdk";

const NAME_KEY = "quiz_user_name";

export default function HomePage() {
  const router = useRouter();
  const {
    todayStatus,
    streak,
    totalPoints,
    sessionPoints,
    score,
    totalQuestions,
    currentStepIndex,
    progress,
    startQuiz,
    addBonusStamps,
  } = useGameState();

  const [adState, setAdState] = useState<"idle" | "loading" | "done">("idle");
  const [userName, setUserName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // localStorage에서 이름 로드
  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY) ?? "";
    setUserName(saved);
    setNameInput(saved);
    if (!saved) setEditingName(true); // 처음이면 바로 입력 모드
  }, []);

  function handleSaveName() {
    const trimmed = nameInput.trim();
    setUserName(trimmed);
    localStorage.setItem(NAME_KEY, trimmed);
    setEditingName(false);
  }

  async function handleStart() {
    await startQuiz();
    router.push("/quiz");
  }

  function handleStampAd() {
    setAdState("loading");
    showRewardedAd(
      async () => {
        // 리워드 획득 → 스탬프 50개 지급
        await addBonusStamps(50);
        setAdState("done");
      },
      () => {
        // 광고 닫힘 (리워드 없음)
        if (adState !== "done") setAdState("idle");
      },
      () => {
        // 광고 실패
        setAdState("idle");
      }
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-5 pt-14 pb-8 gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          직장인 상식 퀴즈 풀기 📚
        </h1>
        <button onClick={() => router.push("/points")} className="active:scale-95 transition-all">
          <PointBadge value={totalPoints} size="sm" />
        </button>
      </div>

      {/* 스트릭 카드 — 항상 표시 */}
      <StreakCard count={streak.count} maxStreak={streak.maxStreak} />

      {/* 오늘 도전 상태 카드 */}
      <TodayChallengeCard
        status={todayStatus}
        currentStep={currentStepIndex}
        totalQuestions={totalQuestions}
        score={score}
        failedAtStep={progress?.failedAtStep ?? null}
        sessionPoints={sessionPoints}
        onStart={handleStart}
        onContinue={() => router.push("/quiz")}
      />

      {/* 내 직급 (이름 입력 + RankCard) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400">내 직급</p>
          {!editingName && (
            <button
              onClick={() => { setNameInput(userName); setEditingName(true); }}
              className="text-xs text-blue-400 active:scale-95 transition-all"
            >
              ✏️ 이름 변경
            </button>
          )}
        </div>

        {/* 이름 입력 필드 */}
        {editingName && (
          <div className="flex gap-2 mb-3">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              placeholder="이름을 입력하세요"
              maxLength={10}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold active:scale-95 transition-all"
            >
              확인
            </button>
          </div>
        )}

        <RankCard
          totalStamps={totalPoints}
          userName={userName}
          onWatchAd={handleStampAd}
          adState={adState}
        />
      </div>

      {/* 면책 문구 */}
      <div className="mt-auto pt-2 pb-1">
        <p className="text-center text-xs leading-relaxed text-gray-300">
          본 퀴즈는 학습 참고용 서비스입니다.{"\n"}
          내용에 오류가 있을 수 있으며, 법적 상담·조언·해석의{"\n"}
          근거로 사용할 수 없습니다.
        </p>
      </div>
    </div>
  );
}

// ── 오늘 도전 상태 카드 ──────────────────────────
interface TodayChallengeCardProps {
  status: TodayStatus;
  currentStep: number;
  totalQuestions: number;
  score: number;
  failedAtStep: number | null;
  sessionPoints: number;
  onStart: () => void;
  onContinue: () => void;
}

function TodayChallengeCard({
  status,
  currentStep,
  totalQuestions,
  score,
  failedAtStep,
  sessionPoints,
  onStart,
  onContinue,
}: TodayChallengeCardProps) {
  return (
    <div className="card">
      <p className="text-xs font-semibold mb-3 text-gray-400">오늘의 도전</p>

      {status === "not_started" && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="font-bold text-base text-gray-900">
                {new Date().toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }).replace(/\. /g, "-").replace(".", "")} {totalQuestions}문제 도전
              </p>
              <p className="text-sm text-gray-400">직장인 상식 퀴즈를 풀고 스탬프를 받아요</p>
            </div>
          </div>
          <button onClick={onStart} className="btn-primary">도전 시작하기</button>
        </>
      )}

      {status === "in_progress" && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚡</span>
            <div>
              <p className="font-bold text-base text-gray-900">
                진행 중 — {currentStep + 1}/{totalQuestions}번 문제
              </p>
              <p className="text-sm text-gray-400">
                {score}문제 맞힘 · {sessionPoints} 스탬프 획득
              </p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full mb-4 bg-gray-200">
            <div
              className="h-2 rounded-full transition-all bg-blue-500"
              style={{ width: `${(currentStep / totalQuestions) * 100}%` }}
            />
          </div>
          <button onClick={onContinue} className="btn-primary">이어하기</button>
        </>
      )}

      {status === "success" && (
        <div className="text-center py-3">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-bold text-lg text-gray-900">오늘 퀴즈 완료!</p>
          <p className="text-sm mt-1 text-gray-400">
            {score}/{totalQuestions} 정답 · +{sessionPoints} 스탬프 획득
          </p>
          <div className="mt-3 py-2 px-4 rounded-xl inline-block bg-blue-50">
            <span className="text-sm font-semibold text-blue-500">
              내일 또 도전하면 스트릭이 이어져요 🔥
            </span>
          </div>
        </div>
      )}

      {status === "failure" && (
        <div className="text-center py-3">
          <div className="text-4xl mb-2">😢</div>
          <p className="font-bold text-lg text-gray-900">
            {failedAtStep !== null ? `${failedAtStep}번 문제에서 멈췄어요` : "오늘 도전 종료"}
          </p>
          <p className="text-sm mt-1 text-gray-400">
            {score}문제 맞힘 · {sessionPoints} 스탬프 획득
          </p>
          <div className="mt-3 py-2 px-4 rounded-xl inline-block bg-rose-50">
            <span className="text-sm font-semibold text-rose-600">
              내일 다시 1번부터 도전할 수 있어요
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
