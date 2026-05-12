"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import StepIndicator from "@/app/components/StepIndicator";
import ExplanationCard from "@/app/components/ExplanationCard";
import WrongAnswerModal from "@/app/components/WrongAnswerModal";
import BannerAd from "@/app/components/BannerAd";
import { preloadRewardedAd } from "@/lib/toss-sdk";

type AnswerState = "unanswered" | "correct" | "wrong";

export default function QuizPage() {
  const router = useRouter();
  const {
    todayStatus,
    progress,
    hydrated,
    handleCorrect,
    handleFailure,
    currentQuestion,
    totalQuestions,
    currentStepIndex,
  } = useGameState();

  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { preloadRewardedAd(); }, []);

  // 완료 시 결과로 이동
  useEffect(() => {
    if (!hydrated) return;
    if (todayStatus === "success" || todayStatus === "failure") {
      router.replace("/result");
    }
  }, [todayStatus, hydrated, router]);

  // 문제 바뀔 때 초기화
  useEffect(() => {
    setAnswerState("unanswered");
    setSelectedIndex(null);
    setShowModal(false);
  }, [currentStepIndex]);

  if (!hydrated || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isLastQuestion = currentStepIndex >= totalQuestions - 1;

  function handleOptionSelect(index: number) {
    if (answerState !== "unanswered") return;
    setSelectedIndex(index);
    if (index === currentQuestion.answer) {
      setAnswerState("correct");
      handleCorrect(currentQuestion.points);
    } else {
      setAnswerState("wrong");
      setShowModal(true);
    }
  }

  function handleNextQuestion() {
    setAnswerState("unanswered");
    setSelectedIndex(null);
  }

  // 광고/공유 후 재도전
  function handleRetry() {
    setShowModal(false);
    setAnswerState("unanswered");
    setSelectedIndex(null);
  }

  // 기회 사용 안 하고 종료
  function handleCloseModal() {
    setShowModal(false);
    handleFailure();
  }

  return (
    <div className="flex flex-col min-h-screen pb-28">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={() => router.push("/")} className="p-2 -ml-2 active:scale-95 transition-all" aria-label="홈으로">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#191f28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <StepIndicator current={currentStepIndex} total={totalQuestions} />
        <div className="w-8" />
      </div>

      {/* 문제 */}
      <div className="flex-1 px-5">
        <span
          className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
          style={{ backgroundColor: "#ebf3ff", color: "#3182f6" }}
        >
          {currentQuestion.category}
        </span>

        <h2 className="text-xl font-bold leading-snug mb-6" style={{ color: "#191f28" }}>
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrectOption = index === currentQuestion.answer;
            const revealed = answerState !== "unanswered";

            let bg = "#ffffff", border = "#e5e8eb", textColor = "#191f28";
            if (revealed) {
              if (isCorrectOption) { bg = "#f0fdf4"; border = "#22c55e"; textColor = "#16a34a"; }
              else if (isSelected) { bg = "#fff1f2"; border = "#f43f5e"; textColor = "#e11d48"; }
            } else if (isSelected) {
              bg = "#ebf3ff"; border = "#3182f6"; textColor = "#3182f6";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={answerState !== "unanswered"}
                className="w-full text-left px-4 py-4 rounded-2xl border-2 font-medium text-sm transition-all active:scale-95"
                style={{ backgroundColor: bg, borderColor: border, color: textColor }}
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
            correctAnswer={currentQuestion.options[currentQuestion.answer]}
            explanation={currentQuestion.explanation}
            points={currentQuestion.points}
            onNext={handleNextQuestion}
            isLast={isLastQuestion}
          />
        )}

        {answerState === "wrong" && !showModal && (
          <ExplanationCard
            isCorrect={false}
            correctAnswer={currentQuestion.options[currentQuestion.answer]}
            explanation={currentQuestion.explanation}
            points={currentQuestion.points}
            onNext={() => {}}
            isLast={isLastQuestion}
          />
        )}
      </div>

      {/* 배너 광고 */}
      <BannerAd />

      {/* ChanceModal */}
      {showModal && (
        <WrongAnswerModal
          correctAnswer={currentQuestion.options[currentQuestion.answer]}
          explanation={currentQuestion.explanation}
          onRetry={handleRetry}
          onNext={handleCloseModal}
        />
      )}
    </div>
  );
}
