"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import StepIndicator from "@/app/components/StepIndicator";
import ExplanationCard from "@/app/components/ExplanationCard";
import WrongAnswerModal from "@/app/components/WrongAnswerModal";
import { preloadRewardedAd, AD_GROUP_IDS } from "@/lib/toss-sdk";
import BannerAd from "@/app/components/BannerAd";

type AnswerState = "unanswered" | "correct" | "wrong";

export default function QuizPage() {
  const router = useRouter();
  const {
    todayStatus,
    handleCorrect,
    handleFailure,
    questions,
    totalQuestions,
    currentStepIndex, // Firestore 기준 초기 스텝 (초기화 용도)
    progress,         // null = Firestore 아직 로드 중
  } = useGameState();

  // ── 로컬 스텝: Firestore 타이밍과 완전히 분리 ──────────
  // null = 아직 Firestore 초기값 대기 중
  const [localStep, setLocalStep] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  // 하루 무료 재도전 기회: 최대 3번. 틀릴 때마다 1 감소, 0이 되면 광고/공유 필요
  const [freeRetries, setFreeRetries] = useState(3);
  // 마지막 문제 정답 후 Firestore 저장 대기 중 오버레이
  const [awaitingResult, setAwaitingResult] = useState(false);

  useEffect(() => { preloadRewardedAd(); }, []);

  // Firestore progress가 실제로 로드된 후에만 localStep 초기화
  // progress === null 일 때 초기화하면 currentStepIndex=0으로 설정되어
  // 이미 푼 문제를 처음부터 다시 보는 버그 발생
  useEffect(() => {
    if (progress !== null && localStep === null) {
      setLocalStep(currentStepIndex);
    }
  }, [progress, currentStepIndex, localStep]);

  // 완료(성공/실패) 시 결과로 이동 — handleCorrect 완료 후 Firestore 쓰기 보장
  useEffect(() => {
    if (todayStatus === "success" || todayStatus === "failure") {
      router.replace("/result");
    }
  }, [todayStatus, router]);

  // 안전 장치: awaitingResult 상태에서 5초 초과 시 강제 이동
  useEffect(() => {
    if (!awaitingResult) return;
    const timer = setTimeout(() => router.replace("/result"), 5000);
    return () => clearTimeout(timer);
  }, [awaitingResult, router]);

  // ── 현재 문제 계산 ──────────────────────────────────────
  const shownStep = localStep ?? currentStepIndex;
  const clampedStep = Math.min(shownStep, totalQuestions - 1);
  const currentQuestion = questions[clampedStep] ?? null;
  const isLastQuestion = shownStep >= totalQuestions - 1;

  // progress 로드 전 or localStep 미초기화 → 스피너
  if (progress === null || localStep === null || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  function handleOptionSelect(index: number) {
    if (answerState !== "unanswered") return;
    setSelectedIndex(index);
    if (index === currentQuestion!.answer) {
      setAnswerState("correct");
      handleCorrect(currentQuestion!.points);
    } else {
      setAnswerState("wrong");
      setFreeRetries((prev) => Math.max(0, prev - 1)); // 무료 기회 1 차감
      setShowModal(true);
    }
  }

  // 다음 문제로: Firestore 응답 기다리지 않고 즉시 UI 전환
  function handleNextQuestion() {
    setLocalStep((prev) => (prev ?? 0) + 1); // 함수형 업데이트 — 항상 최신 값 기준
    setAnswerState("unanswered");
    setSelectedIndex(null);
    setShowModal(false);
  }

  function handleRetry() {
    setShowModal(false);
    setAnswerState("unanswered");
    setSelectedIndex(null);
  }

  // 오늘 도전 포기 — modal이 열려있을 때 호출 (백드롭·포기버튼·헤더 뒤로가기)
  // handleFailure가 Firestore에 isFailed=true를 쓰면 todayStatus → "failure" →
  // useEffect가 /result로 자동 이동
  function handleGiveUp() {
    setShowModal(false);
    handleFailure();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        {/* 모달 열려있을 때 뒤로가기 = 포기 */}
        <button
          onClick={() => showModal ? handleGiveUp() : router.push("/")}
          className="p-2 -ml-2 active:scale-95 transition-all"
          aria-label="홈으로"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#191f28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <StepIndicator current={shownStep} total={totalQuestions} />
        <div className="w-8" />
      </div>

      {/* 문제 */}
      <div className="flex-1 px-5">
        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4 bg-blue-50 text-blue-500">
          {currentQuestion.category}
        </span>

        <h2 className="text-xl font-bold leading-snug mb-6 text-gray-900">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrectOption = index === currentQuestion.answer;
            // 모달이 열려있을 때는 정답 표시 안 함
            const revealed = answerState !== "unanswered" && !showModal;

            const btnClass = [
              "w-full text-left px-4 py-4 rounded-2xl border-2 font-medium text-sm transition-all active:scale-95",
              revealed && isCorrectOption
                ? "bg-green-50 border-green-400 text-green-600"
                : revealed && isSelected
                ? "bg-rose-50 border-rose-400 text-rose-500"
                : !revealed && isSelected
                ? "bg-blue-50 border-blue-500 text-blue-500"
                : "bg-white border-gray-200 text-gray-900",
            ].join(" ");

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={answerState !== "unanswered"}
                className={btnClass}
              >
                <span className="font-bold mr-2">{["①", "②", "③", "④"][index]}</span>
                {option}
              </button>
            );
          })}
        </div>

        {answerState === "correct" && (
          <ExplanationCard
            isCorrect={true}
            explanation={currentQuestion.explanation}
            points={currentQuestion.points}
            onNext={isLastQuestion
              ? () => setAwaitingResult(true)  // Firestore 저장 완료 대기
              : handleNextQuestion}
            isLast={isLastQuestion}
          />
        )}

        {answerState === "wrong" && !showModal && (
          <ExplanationCard
            isCorrect={false}
            explanation={currentQuestion.explanation}
            points={currentQuestion.points}
            onNext={() => {}}
            isLast={isLastQuestion}
          />
        )}
      </div>

      {showModal && (
        <WrongAnswerModal
          onRetry={handleRetry}
          onGiveUp={handleGiveUp}
          retriesLeft={freeRetries}
        />
      )}

      {/* 퀴즈 하단 배너 광고 (리스트형) */}
      {answerState === "unanswered" && !showModal && (
        <BannerAd variant="card" adGroupId={AD_GROUP_IDS.BANNER_QUIZ} />
      )}

      {/* 마지막 문제 저장 대기 오버레이 */}
      {awaitingResult && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-500">결과를 저장하고 있어요...</p>
        </div>
      )}
    </div>
  );
}
