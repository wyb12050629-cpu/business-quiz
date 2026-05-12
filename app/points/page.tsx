"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import { RANKS, getRankProgress } from "@/lib/ranks";

export default function CareerPage() {
  const router = useRouter();
  const { totalPoints, streak } = useGameState();

  const { current, next, progress, stampsToNext } = getRankProgress(totalPoints);

  return (
    <div className="flex flex-col min-h-screen px-5 pt-12 pb-10">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 active:scale-95 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#191f28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">내 커리어</h1>
      </div>

      {/* 현재 직급 대형 카드 */}
      <div className="rounded-3xl p-5 mb-4 bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="flex items-center gap-4">
          {/* 캐릭터 이미지 */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={current.image}
              alt={current.title}
              fill
              className="object-contain drop-shadow-lg"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            {/* 말풍선 */}
            <div className="relative bg-white/20 rounded-2xl px-3 py-2 mb-3">
              <div className="absolute -left-1.5 top-3 w-3 h-3 bg-white/20 rotate-45 rounded-sm" />
              <p className="text-xs text-white/90 leading-snug">{current.speech}</p>
            </div>
            {/* 직급명 */}
            <div className="flex items-center gap-2">
              <span className="text-white text-lg font-bold">{current.emoji} {current.title}</span>
            </div>
            <p className="text-white/70 text-xs mt-0.5">💼 {totalPoints.toLocaleString()} 스탬프 보유</p>
          </div>
        </div>

        {/* 다음 직급 프로그레스 */}
        {next ? (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/70 text-xs">다음: {next.emoji} {next.title}</span>
              <span className="text-white text-xs font-semibold">{stampsToNext} 스탬프 더 필요해요</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <span className="text-white/90 text-sm font-semibold">👑 최고 직급 달성!</span>
          </div>
        )}
      </div>

      {/* 스탯 카드 */}
      <div className="card mb-4">
        <div className="grid grid-cols-2 divide-x divide-gray-100 text-center">
          <div className="px-3 py-1">
            <p className="text-2xl font-bold text-amber-400">{totalPoints.toLocaleString()}</p>
            <p className="text-xs mt-1 text-gray-400">누적 스탬프</p>
          </div>
          <div className="px-3 py-1">
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl">🔥</span>
              <p className="text-2xl font-bold text-orange-500">{streak.count}</p>
            </div>
            <p className="text-xs mt-1 text-gray-400">연속 도전</p>
          </div>
        </div>
      </div>

      {/* 직급 사다리 */}
      <div className="card">
        <p className="text-xs font-semibold mb-4 text-gray-400">직급 사다리</p>
        <div className="relative">
          {/* 세로 연결선 */}
          <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gray-100" />

          <div className="space-y-0">
            {[...RANKS].reverse().map((rank) => {
              const isAchieved = totalPoints >= rank.minCoins;
              const isCurrent = rank.title === current.title;

              return (
                <div key={rank.title} className="flex items-center gap-3 py-2">
                  {/* 점 (타임라인) */}
                  <div className={[
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm transition-all",
                    isCurrent
                      ? "bg-blue-500 shadow-lg shadow-blue-200 scale-110"
                      : isAchieved
                      ? "bg-blue-100"
                      : "bg-gray-100",
                  ].join(" ")}>
                    {isCurrent ? (
                      <span className="text-white text-xs font-bold">●</span>
                    ) : isAchieved ? (
                      <span className="text-blue-500 text-xs">✓</span>
                    ) : (
                      <span className="text-gray-300 text-xs">○</span>
                    )}
                  </div>

                  {/* 직급 정보 */}
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className={[
                        "text-sm font-semibold",
                        isCurrent ? "text-blue-600" : isAchieved ? "text-gray-700" : "text-gray-300",
                      ].join(" ")}>
                        {rank.emoji} {rank.title}
                        {isCurrent && (
                          <span className="ml-2 text-xs font-normal bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                            현재
                          </span>
                        )}
                      </p>
                    </div>
                    <p className={[
                      "text-xs font-medium",
                      isCurrent ? "text-blue-500" : isAchieved ? "text-gray-400" : "text-gray-200",
                    ].join(" ")}>
                      {rank.minCoins.toLocaleString()}S
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div className="rounded-2xl p-4 mt-4 bg-gray-100">
        <p className="text-sm font-semibold mb-1 text-gray-900">💡 스탬프 안내</p>
        <ul className="text-xs space-y-1 text-slate-600">
          <li>• 퀴즈 정답 시 최대 5스탬프 지급</li>
          <li>• 매일 퀴즈를 풀수록 스탬프가 쌓여요</li>
          <li>• 스탬프가 쌓이면 직급이 올라가요 🚀</li>
        </ul>
      </div>
    </div>
  );
}
