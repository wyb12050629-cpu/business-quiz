"use client";

import { RotateCcw, X } from "lucide-react";

interface ChanceModalProps {
  open: boolean;
  onRetry: () => void;
  onGiveUp: () => void;
}

export default function ChanceModal({ open, onRetry, onGiveUp }: ChanceModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl">
        <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mx-auto mb-4">
          <RotateCcw className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
          재도전 기회!
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          한 번 더 도전할 수 있어요.
          <br />
          이번이 마지막 기회입니다!
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            다시 도전하기
          </button>
          <button
            onClick={onGiveUp}
            className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            포기하기
          </button>
        </div>
      </div>
    </div>
  );
}
