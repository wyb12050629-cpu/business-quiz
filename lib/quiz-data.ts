export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number; // 0-indexed
  explanation: string;
  points: number;
  category: string;
}

// Firestore 미연결 시 fallback으로 사용하는 로컬 데이터 (3문제)
// 실제 문제는 Firestore questions/{YYYY-MM-DD} 에서 가져와요.
export const quizData: QuizQuestion[] = [
  {
    id: 1,
    question: "스타트업에서 'MVP'가 의미하는 것은?",
    options: [
      "Most Valuable Player (가장 가치 있는 직원)",
      "Minimum Viable Product (최소 기능 제품)",
      "Maximum Value Proposition (최대 가치 제안)",
      "Market Validation Point (시장 검증 기점)",
    ],
    answer: 1,
    explanation: "MVP는 핵심 기능만 담은 최소한의 제품으로, 빠르게 시장 반응을 테스트하기 위해 출시해요.",
    points: 5,
    category: "스타트업",
  },
  {
    id: 2,
    question: "손익분기점(BEP)이란 무엇인가요?",
    options: [
      "매출이 최고점에 도달하는 시점",
      "총수익과 총비용이 같아지는 매출 수준",
      "투자 회수가 완료되는 시점",
      "영업이익이 순이익과 같아지는 시점",
    ],
    answer: 1,
    explanation: "손익분기점(Break-Even Point)은 총수익 = 총비용이 되는 매출 수준으로, 이 지점부터 이익이 발생해요.",
    points: 5,
    category: "재무",
  },
  {
    id: 3,
    question: "퍼포먼스 마케팅에서 'ROAS'란?",
    options: [
      "광고비 대비 매출 비율",
      "월간 활성 사용자 수",
      "고객 획득 비용",
      "광고 클릭률",
    ],
    answer: 0,
    explanation: "ROAS(Return On Ad Spend)는 광고비 1원당 발생한 매출을 나타내며, 높을수록 광고 효율이 좋아요.",
    points: 5,
    category: "마케팅",
  },
];

export const TOTAL_QUESTIONS = quizData.length;
export const MAX_POINTS = quizData.reduce((sum, q) => sum + q.points, 0);
