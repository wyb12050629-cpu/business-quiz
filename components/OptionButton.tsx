"use client";

interface OptionButtonProps {
  index: number;
  text: string;
  selected: boolean;
  correct: boolean | null; // null = 아직 채점 전
  disabled: boolean;
  onClick: () => void;
}

export default function OptionButton({
  index,
  text,
  selected,
  correct,
  disabled,
  onClick,
}: OptionButtonProps) {
  const labels = ["A", "B", "C", "D"];

  let bgClass = "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50";
  if (selected && correct === null) {
    bgClass = "bg-blue-100 border-blue-500";
  } else if (selected && correct === true) {
    bgClass = "bg-green-100 border-green-500";
  } else if (selected && correct === false) {
    bgClass = "bg-red-100 border-red-500";
  } else if (correct === true) {
    bgClass = "bg-green-50 border-green-400";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${bgClass} ${
        disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer active:scale-[0.98]"
      }`}
    >
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          selected
            ? correct === true
              ? "bg-green-500 text-white"
              : correct === false
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {labels[index]}
      </span>
      <span className="text-gray-800 text-[15px] leading-snug">{text}</span>
    </button>
  );
}
