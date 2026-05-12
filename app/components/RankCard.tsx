"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { getRankProgress } from "@/lib/ranks";

interface RankCardProps {
  totalStamps: number;
  userName?: string;
  onWatchAd?: () => void;
  adState?: "idle" | "loading" | "done";
}

export default function RankCard({ totalStamps, userName, onWatchAd, adState = "idle" }: RankCardProps) {
  const router = useRouter();
  const { current, next, progress, stampsToNext } = getRankProgress(totalStamps);

  return (
    <div className="card">
      {/* 캐릭터 + 말풍선 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-28 h-28 flex-shrink-0">
          <Image
            src={current.image}
            alt={current.title}
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        <div className="relative flex-1">
          {/* 이름 + 직급 */}
          {userName && (
            <p className="text-sm font-bold text-gray-900 mb-1.5">
              {userName} <span className="text-blue-500">{current.title}</span>
            </p>
          )}
          {/* 말풍선 */}
          <div className="absolute -left-1.5 top-4 w-3 h-3 bg-blue-50 rotate-45 rounded-sm z-0"
            style={userName ? { top: "3.5rem" } : {}} />
          <div className="relative z-10 bg-blue-50 rounded-2xl px-3 py-2.5">
            <p className="text-xs font-medium text-blue-800 leading-snug">
              {current.speech}
            </p>
          </div>
        </div>
      </div>

      {/* 직급 배지 — 클릭 시 내 직급 페이지 이동 */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => router.push("/points")}
          className={`text-xs font-bold px-2.5 py-1 rounded-full active:scale-95 transition-all ${current.badgeBg} ${current.badgeText}`}
        >
          {current.emoji} {current.title}
        </button>
        <span className="text-xs text-gray-400">💼 {totalStamps.toLocaleString()} 스탬프</span>
      </div>

      {/* 다음 직급 프로그레스 */}
      {next ? (
        <>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400">다음: {next.emoji} {next.title}</span>
            <span className="text-xs font-semibold text-blue-500">{stampsToNext} 스탬프 남음</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-1">
          <span className="text-xs font-semibold text-yellow-600">
            👑 최고 직급 달성! 전설이 됐어요
          </span>
        </div>
      )}

      {/* 광고 보고 스탬프 받기 */}
      {onWatchAd && (
        <button
          onClick={onWatchAd}
          disabled={adState !== "idle"}
          className={[
            "w-full mt-3 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all",
            adState === "done"
              ? "bg-green-50 text-green-600"
              : "bg-amber-50 text-amber-700",
          ].join(" ")}
        >
          {adState === "loading" ? (
            <>
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>광고 불러오는 중...</span>
            </>
          ) : adState === "done" ? (
            <span>✅ 스탬프 50개 받았어요!</span>
          ) : (
            <>
              <span>📺</span>
              <span>광고 보고 스탬프 50개 받기</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
