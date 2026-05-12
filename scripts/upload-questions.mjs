/**
 * Firestore 오늘의 퀴즈 문제 업로드 스크립트
 *
 * 사용법:
 *   node scripts/upload-questions.mjs
 *   node scripts/upload-questions.mjs 2026-05-15   (날짜 지정)
 *
 * 사전 준비:
 *   1. Firebase Console → 프로젝트 설정 → 서비스 계정
 *      → "새 비공개 키 생성" 클릭 → serviceAccountKey.json 다운로드
 *   2. 다운받은 파일을 프로젝트 루트에 serviceAccountKey.json 으로 저장
 *      (절대 Git에 올리지 마세요! .gitignore에 이미 포함돼 있어요)
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

// ── 서비스 계정 키 로드 ───────────────────────────────────
const keyPath = resolve(rootDir, "serviceAccountKey.json");
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
} catch {
  console.error("❌ serviceAccountKey.json 파일을 찾을 수 없어요.");
  console.error("   Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성");
  console.error(`   다운로드 후 이 경로에 저장하세요: ${keyPath}`);
  process.exit(1);
}

// ── Firebase Admin 초기화 ─────────────────────────────────
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── 업로드할 날짜 결정 ────────────────────────────────────
const dateArg = process.argv[2]; // ex) 2026-05-15
const today = dateArg ?? new Date().toISOString().slice(0, 10);

console.log(`\n📅 업로드 날짜: ${today}\n`);

// ── 퀴즈 문제 데이터 ─────────────────────────────────────
// lib/quiz-data.ts 의 내용을 여기에 유지하거나,
// 아래 questions 배열을 직접 수정해 사용하세요.
const questions = [
  {
    category: "스타트업",
    question: "스타트업에서 'MVP'가 의미하는 것은?",
    options: [
      "Most Valuable Player (가장 가치 있는 직원)",
      "Minimum Viable Product (최소 기능 제품)",
      "Maximum Value Proposition (최대 가치 제안)",
      "Market Validation Point (시장 검증 기점)",
    ],
    answerIndex: 1,
    explanation:
      "MVP는 핵심 기능만 담은 최소한의 제품으로, 빠르게 시장 반응을 테스트하기 위해 출시해요.",
  },
  {
    category: "재무",
    question: "손익분기점(BEP)이란 무엇인가요?",
    options: [
      "매출이 최고점에 도달하는 시점",
      "총수익과 총비용이 같아지는 매출 수준",
      "투자 회수가 완료되는 시점",
      "영업이익이 순이익과 같아지는 시점",
    ],
    answerIndex: 1,
    explanation:
      "손익분기점(Break-Even Point)은 총수익 = 총비용이 되는 매출 수준으로, 이 지점부터 이익이 발생해요.",
  },
  {
    category: "마케팅",
    question: "퍼포먼스 마케팅에서 'ROAS'란?",
    options: [
      "광고비 대비 매출 비율",
      "월간 활성 사용자 수",
      "고객 획득 비용",
      "광고 클릭률",
    ],
    answerIndex: 0,
    explanation:
      "ROAS(Return On Ad Spend)는 광고비 1원당 발생한 매출을 나타내며, 높을수록 광고 효율이 좋아요.",
  },
  {
    category: "마케팅",
    question: "고객 생애 가치(LTV)를 높이는 가장 효과적인 전략은?",
    options: [
      "신규 고객 획득 비용 절감",
      "기존 고객 재구매율과 객단가 향상",
      "광고비 증액",
      "제품 가격 인하",
    ],
    answerIndex: 1,
    explanation:
      "LTV(Lifetime Value)는 재구매율·구매 주기·객단가를 높여야 극대화돼요. 신규 고객 유치보다 기존 고객 유지가 비용 효율이 높아요.",
  },
  {
    category: "경영",
    question: "애자일(Agile) 방법론의 핵심 원칙이 아닌 것은?",
    options: [
      "짧은 스프린트 단위로 반복 개발",
      "고객과의 지속적인 협업",
      "처음부터 완벽한 계획 수립",
      "변화에 빠르게 대응",
    ],
    answerIndex: 2,
    explanation:
      "애자일은 완벽한 사전 계획보다 변화에 유연하게 대응하는 것을 중시해요.",
  },
  {
    category: "SaaS",
    question: "SaaS 비즈니스의 핵심 지표가 아닌 것은?",
    options: [
      "MRR (월간 반복 수익)",
      "Churn Rate (이탈률)",
      "NPS (순추천고객지수)",
      "SKU (재고 관리 단위)",
    ],
    answerIndex: 3,
    explanation:
      "SKU는 실물 제품의 재고 단위예요. SaaS의 핵심 지표는 MRR, Churn Rate, NPS 등 구독 기반 지표예요.",
  },
  {
    category: "스타트업",
    question: "린 스타트업(Lean Startup)에서 '피벗(Pivot)'의 의미는?",
    options: [
      "기존 전략을 완전히 폐기하는 것",
      "핵심 가설을 유지하며 비즈니스 방향을 전환하는 것",
      "회사를 매각하는 것",
      "제품 가격을 조정하는 것",
    ],
    answerIndex: 1,
    explanation:
      "피벗은 실험 결과를 바탕으로 핵심 학습은 유지하면서 전략·제품·타겟을 변경하는 방향 전환이에요.",
  },
  {
    category: "경영",
    question: "OKR에서 'Key Results'의 특징은?",
    options: [
      "정성적이고 주관적인 목표",
      "측정 가능한 수치로 표현된 성과 지표",
      "팀장만 설정하는 목표",
      "연간 단위로만 설정",
    ],
    answerIndex: 1,
    explanation:
      "Key Results는 반드시 측정 가능한 수치로 표현돼야 해요. '성장한다'가 아니라 'MAU 20% 증가'처럼요.",
  },
  {
    category: "스타트업",
    question: "PMF(Product-Market Fit) 달성 여부를 확인하는 대표적인 방법은?",
    options: [
      "직원 만족도 조사",
      '"이 제품이 없어지면 매우 실망" 응답이 40% 이상',
      "투자자 IR 발표 통과",
      "앱스토어 별점 4.5 이상",
    ],
    answerIndex: 1,
    explanation:
      "Sean Ellis Test로, 40% 이상이 '매우 실망'이라 응답하면 PMF를 달성했다고 판단해요.",
  },
  {
    category: "경영",
    question: "네트워크 효과(Network Effect)란?",
    options: [
      "인터넷 속도가 서비스 품질에 미치는 영향",
      "사용자가 늘어날수록 제품의 가치가 증가하는 현상",
      "소셜미디어 광고의 바이럴 효과",
      "B2B 파트너십을 통한 성장 전략",
    ],
    answerIndex: 1,
    explanation:
      "네트워크 효과는 사용자가 늘수록 가치가 기하급수적으로 증가하는 현상이에요. 카카오톡이 대표적이에요.",
  },
];

// ── Firestore 업로드 ──────────────────────────────────────
async function upload() {
  const docRef = db.collection("questions").doc(today);

  // 이미 존재하는지 확인
  const existing = await docRef.get();
  if (existing.exists) {
    console.log(`⚠️  questions/${today} 문서가 이미 존재해요.`);
    const answer = process.argv[3]; // --force 플래그
    if (answer !== "--force") {
      console.log("   덮어쓰려면: node scripts/upload-questions.mjs [날짜] --force");
      process.exit(0);
    }
    console.log("   --force 플래그 감지 → 덮어씁니다.\n");
  }

  await docRef.set({
    questions,
    createdAt: Timestamp.now(),
  });

  console.log(`✅ questions/${today} 업로드 완료!`);
  console.log(`   문제 수: ${questions.length}개`);
  console.log(`   카테고리: ${[...new Set(questions.map((q) => q.category))].join(", ")}`);
  console.log("\n🔗 Firebase Console에서 확인:");
  console.log(`   https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore`);
}

upload().catch((err) => {
  console.error("❌ 업로드 실패:", err.message);
  process.exit(1);
});
