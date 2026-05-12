// ────────────────────────────────────────────────────────────
// 직급 커리어 시스템
// 이미지 파일 5개 → /public/ranks/level1~5.png
//   level1.png : 인턴 / 사원
//   level2.png : 주임 / 대리 / 과장 / 차장
//   level3.png : 부장 / 이사
//   level4.png : 상무 / 전무
//   level5.png : 대표이사
// ────────────────────────────────────────────────────────────

export interface Rank {
  title: string;
  emoji: string;
  minCoins: number;
  image: string;
  speech: string;
  badgeBg: string;   // Tailwind bg class
  badgeText: string; // Tailwind text class
}

export const RANKS: Rank[] = [
  {
    title: "인턴",
    emoji: "🆕",
    minCoins: 0,
    image: "/ranks/level1.png",
    speech: "오늘도 커피 심부름... 퀴즈는 잘 풀었어요 😅",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-600",
  },
  {
    title: "사원",
    emoji: "💼",
    minCoins: 50,
    image: "/ranks/level1.png",
    speech: "드디어 정직원! 이제 진짜 시작이에요 💪",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
  {
    title: "주임",
    emoji: "📋",
    minCoins: 150,
    image: "/ranks/level2.png",
    speech: "이 정도면 좀 알겠죠? 선배처럼요 😎",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-700",
  },
  {
    title: "대리",
    emoji: "🖥️",
    minCoins: 300,
    image: "/ranks/level2.png",
    speech: "다음 보고서는 제가 맡겠습니다! ✊",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  {
    title: "과장",
    emoji: "📊",
    minCoins: 500,
    image: "/ranks/level2.png",
    speech: "팀원들, 나만 믿어요 📊",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
  },
  {
    title: "차장",
    emoji: "🗂️",
    minCoins: 750,
    image: "/ranks/level2.png",
    speech: "경험이 말해주죠. 다 겪어봤어요 🗂️",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
  },
  {
    title: "부장",
    emoji: "🏢",
    minCoins: 1050,
    image: "/ranks/level3.png",
    speech: "이 팀 전체가 내 책임입니다 🏢",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
  },
  {
    title: "이사",
    emoji: "🎯",
    minCoins: 1400,
    image: "/ranks/level3.png",
    speech: "전략적으로 접근해야죠 🎯",
    badgeBg: "bg-pink-100",
    badgeText: "text-pink-700",
  },
  {
    title: "상무",
    emoji: "✈️",
    minCoins: 1800,
    image: "/ranks/level4.png",
    speech: "큰 그림을 봐야 해, 글로벌하게 ✈️",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-600",
  },
  {
    title: "전무",
    emoji: "🏆",
    minCoins: 2300,
    image: "/ranks/level4.png",
    speech: "회사의 방향은 내가 잡습니다 🏆",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
  {
    title: "대표이사",
    emoji: "👑",
    minCoins: 3000,
    image: "/ranks/level5.png",
    speech: "이 회사... 내가 만들었습니다 👑",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-700",
  },
];

/** 코인 수에 맞는 현재 직급 반환 */
export function getRankByCoins(coins: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (coins >= rank.minCoins) current = rank;
  }
  return current;
}

/** 다음 직급 반환 (최고 직급이면 null) */
export function getNextRank(coins: number): Rank | null {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (coins >= RANKS[i].minCoins) {
      return i < RANKS.length - 1 ? RANKS[i + 1] : null;
    }
  }
  return RANKS[1];
}

/** 현재 직급 + 다음 직급 + 진행률(0~100) */
export function getRankProgress(coins: number): {
  current: Rank;
  next: Rank | null;
  progress: number;
  stampsToNext: number;
} {
  const current = getRankByCoins(coins);
  const currentIdx = RANKS.findIndex((r) => r.title === current.title);
  const next = currentIdx < RANKS.length - 1 ? RANKS[currentIdx + 1] : null;

  if (!next) {
    return { current, next: null, progress: 100, stampsToNext: 0 };
  }

  const range = next.minCoins - current.minCoins;
  const earned = coins - current.minCoins;
  const progress = Math.min(100, Math.round((earned / range) * 100));
  const stampsToNext = next.minCoins - coins;

  return { current, next, progress, stampsToNext };
}
