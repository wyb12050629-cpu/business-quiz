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
    if (todayStatus === "success" || todayStatus === "failure") {
      router.replace("/result");
    }
  }, [todayStatus, router]);

  // 문제 바뀔 때 초기화
  useEffect(() => {
    setAnswerState("unanswered");
    setSelectedIndex(null);
    setShowModal(false);
  }, [currentStepIndex]);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
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

  function handleRetry() {
    setShowModal(false);
    setAnswerState("unanswered");
    setSelectedIndex(null);
  }

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
            const revealed = answerState !== "unanswered";

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

      <BannerAd />

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
