"use client";

interface ExplanationCardProps {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  points: number;
  onNext: () => void;
  isLast: boolean;
}

export default function ExplanationCard({
  isCorrect,
  correctAnswer,
  explanation,
  points,
  onNext,
  isLast,
}: ExplanationCardProps) {
  return (
    <div className={`rounded-2xl p-5 mt-4 border-l-4 ${isCorrect ? "bg-green-50 border-green-400" : "bg-rose-50 border-rose-400"}`}>
      {/* 정답/오답 헤더 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{isCorrect ? "✅" : "❌"}</span>
        <span className={`font-bold text-base ${isCorrect ? "text-green-600" : "text-rose-500"}`}>
          {isCorrect ? `정답! +${points}P` : "오답"}
        </span>
      </div>

      {/* 정답 표시 (오답인 경우) */}
      {!isCorrect && (
        <p className="text-sm font-semibold mb-1 text-rose-500">
          정답: {correctAnswer}
        </p>
      )}

      {/* 해설 */}
      <p className="text-sm leading-relaxed text-slate-600">
        {explanation}
      </p>

      {/* 다음 버튼 (정답인 경우만) */}
      {isCorrect && (
        <button
          onClick={onNext}
          className="w-full mt-4 py-3 rounded-xl font-semibold text-white text-sm active:scale-95 transition-all bg-blue-500"
        >
          {isLast ? "결과 보기 🎉" : "다음 문제 →"}
        </button>
      )}
    </div>
  );
}
