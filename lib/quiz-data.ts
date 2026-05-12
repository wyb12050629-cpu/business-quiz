export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number; // 0-indexed
  explanation: string;
  points: number;
  category: string;
}

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
    explanation:
      "MVP는 핵심 기능만 담은 최소한의 제품으로, 빠르게 시장 반응을 테스트하기 위해 출시해요.",
    points: 10,
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
    explanation:
      "손익분기점(Break-Even Point)은 총수익 = 총비용이 되는 매출 수준으로, 이 지점부터 이익이 발생해요.",
    points: 10,
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
    explanation:
      "ROAS(Return On Ad Spend)는 광고비 1원당 발생한 매출을 나타내며, 높을수록 광고 효율이 좋아요.",
    points: 10,
    category: "마케팅",
  },
  {
    id: 4,
    question: "고객 생애 가치(LTV)를 높이는 가장 효과적인 전략은?",
    options: [
      "신규 고객 획득 비용 절감",
      "기존 고객 재구매율과 객단가 향상",
      "광고비 증액",
      "제품 가격 인하",
    ],
    answer: 1,
    explanation:
      "LTV(Lifetime Value)는 재구매율·구매 주기·객단가를 높여야 극대화돼요. 신규 고객 유치보다 기존 고객 유지가 비용 효율이 높아요.",
    points: 15,
    category: "마케팅",
  },
  {
    id: 5,
    question: "애자일(Agile) 방법론의 핵심 원칙이 아닌 것은?",
    options: [
      "짧은 스프린트 단위로 반복 개발",
      "고객과의 지속적인 협업",
      "처음부터 완벽한 계획 수립",
      "변화에 빠르게 대응",
    ],
    answer: 2,
    explanation:
      "애자일은 완벽한 사전 계획보다 변화에 유연하게 대응하는 것을 중시해요. 짧은 주기로 피드백을 반영하며 개선해요.",
    points: 10,
    category: "경영",
  },
  {
    id: 6,
    question: "SaaS(Software as a Service) 비즈니스의 핵심 지표가 아닌 것은?",
    options: ["MRR (월간 반복 수익)", "Churn Rate (이탈률)", "NPS (순추천고객지수)", "SKU (재고 관리 단위)"],
    answer: 3,
    explanation:
      "SKU는 재고를 관리하는 단위로 실물 제품에 해당해요. SaaS의 핵심 지표는 MRR, Churn Rate, NPS 등 구독 기반 지표예요.",
    points: 15,
    category: "SaaS",
  },
  {
    id: 7,
    question: "린 스타트업(Lean Startup)에서 '피벗(Pivot)'의 의미는?",
    options: [
      "기존 전략을 완전히 폐기하는 것",
      "핵심 가설을 유지하며 비즈니스 방향을 전환하는 것",
      "회사를 매각하는 것",
      "제품 가격을 조정하는 것",
    ],
    answer: 1,
    explanation:
      "피벗은 실험 결과를 바탕으로 핵심 학습은 유지하면서 전략·제품·타겟을 변경하는 방향 전환이에요.",
    points: 10,
    category: "스타트업",
  },
  {
    id: 8,
    question: "OKR(Objectives and Key Results)에서 'Key Results'의 특징은?",
    options: [
      "정성적이고 주관적인 목표",
      "측정 가능한 수치로 표현된 성과 지표",
      "팀장만 설정하는 목표",
      "분기가 아닌 연간 단위로만 설정",
    ],
    answer: 1,
    explanation:
      "Key Results는 반드시 측정 가능한 수치로 표현돼야 해요. '성장한다'가 아니라 'MAU 20% 증가'처럼 명확한 수치를 써요.",
    points: 10,
    category: "경영",
  },
  {
    id: 9,
    question: "PMF(Product-Market Fit)를 확인하는 대표적인 방법은?",
    options: [
      "직원 만족도 조사",
      '"이 제품이 없어지면 얼마나 실망하겠습니까?" 설문에서 40% 이상이 "매우 실망"',
      "투자자 IR 발표 통과",
      "앱스토어 별점 4.5 이상 달성",
    ],
    answer: 1,
    explanation:
      "Sean Ellis Test로, 40% 이상의 사용자가 '매우 실망'이라 응답하면 PMF를 달성했다고 판단해요.",
    points: 15,
    category: "스타트업",
  },
  {
    id: 10,
    question: "네트워크 효과(Network Effect)란?",
    options: [
      "인터넷 속도가 서비스 품질에 미치는 영향",
      "사용자가 늘어날수록 제품의 가치가 증가하는 현상",
      "소셜미디어 광고의 바이럴 효과",
      "B2B 파트너십을 통한 성장 전략",
    ],
    answer: 1,
    explanation:
      "네트워크 효과는 사용자가 늘수록 가치가 기하급수적으로 증가하는 현상이에요. 카카오톡, 배달의민족 등이 대표적이에요.",
    points: 15,
    category: "경영",
  },
];

export const TOTAL_QUESTIONS = quizData.length;
export const MAX_POINTS = quizData.reduce((sum, q) => sum + q.points, 0);
