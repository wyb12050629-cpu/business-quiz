"use client";

interface StepIndicatorProps {
  currentStep: number; // 1, 2, 3
  totalSteps: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;

        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                isDone
                  ? "bg-blue-500 text-white"
                  : isActive
                  ? "bg-blue-500 text-white ring-4 ring-blue-100"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={`w-8 h-0.5 ${
                  isDone ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
      <span className="ml-3 text-sm text-gray-500 font-medium">
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
}
