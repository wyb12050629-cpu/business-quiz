"use client";

import { CheckCircle, XCircle, Lightbulb } from "lucide-react";

interface ExplanationCardProps {
  isCorrect: boolean;
  explanation: string;
}

export default function ExplanationCard({
  isCorrect,
  explanation,
}: ExplanationCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 mt-4 ${
        isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {isCorrect ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
        <span
          className={`font-bold text-sm ${
            isCorrect ? "text-green-700" : "text-red-700"
          }`}
        >
          {isCorrect ? "정답입니다!" : "오답입니다"}
        </span>
      </div>
      <div className="flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
      </div>
    </div>
  );
}
