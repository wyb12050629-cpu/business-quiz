import * as admin from "firebase-admin";
import dayjs from "dayjs";

// ─── Admin SDK 초기화 ────────────────────────────────────

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── 타입 ────────────────────────────────────────────────

interface QuestionItem {
  category: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

type Difficulty = "easy" | "medium" | "hard";

// ─── 문제 풀 (카테고리 × 난이도) ─────────────────────────

const questionPool: Record<string, Record<Difficulty, QuestionItem[]>> = {
  노동법: {
    easy: [
      {
        category: "노동법",
        question: "입사 첫 해 연차는 언제부터 발생하나요?",
        options: [
          "입사 즉시",
          "입사 후 1개월 개근 시 1일씩",
          "입사 후 1년이 지난 후",
          "회사 규정에 따라 다름",
        ],
        answerIndex: 1,
        explanation:
          "근로기준법 제60조에 따라 1개월 개근 시 1일의 유급휴가가 발생합니다. 1년 미만 근로자도 최대 11일까지 연차를 사용할 수 있어요.",
      },
      {
        category: "노동법",
        question: "법정 주 최대 근로시간은 몇 시간인가요?",
        options: ["40시간", "44시간", "48시간", "52시간"],
        answerIndex: 3,
        explanation:
          "근로기준법 제53조에 따라 기본 40시간 + 연장 12시간 = 최대 52시간입니다.",
      },
      {
        category: "노동법",
        question:
          "사용자가 근로자를 해고하려면 최소 며칠 전에 통보해야 하나요?",
        options: ["7일 전", "14일 전", "30일 전", "60일 전"],
        answerIndex: 2,
        explanation:
          "근로기준법 제26조에 따라 해고 예고는 최소 30일 전에 해야 하며, 그렇지 않으면 30일분의 통상임금을 지급해야 합니다.",
      },
      {
        category: "노동법",
        question: "수습 기간은 법적으로 최대 몇 개월까지 가능한가요?",
        options: ["1개월", "3개월", "6개월", "제한 없음"],
        answerIndex: 1,
        explanation:
          "근로기준법 제35조에 따라 수습 기간은 3개월을 초과할 수 없습니다. 수습 중에는 최저임금의 90%까지 지급이 가능합니다.",
      },
      {
        category: "노동법",
        question: "근로계약서를 작성하지 않으면 어떻게 되나요?",
        options: [
          "별다른 제재 없음",
          "500만원 이하 벌금",
          "근로계약이 무효",
          "자동으로 정규직 전환",
        ],
        answerIndex: 1,
        explanation:
          "근로기준법 제17조 위반으로 500만원 이하의 벌금에 처해질 수 있습니다. 근로계약서 미교부는 사용자의 의무 위반입니다.",
      },
      {
        category: "노동법",
        question: "야간근로 수당은 통상임금의 몇 %를 가산해야 하나요?",
        options: ["25%", "50%", "75%", "100%"],
        answerIndex: 1,
        explanation:
          "근로기준법 제56조에 따라 야간근로(오후 10시~오전 6시)에 대해 통상임금의 50%를 가산하여 지급해야 합니다.",
      },
      {
        category: "노동법",
        question: "1년 이상 근무 후 발생하는 연차 유급휴가는 며칠인가요?",
        options: ["10일", "12일", "15일", "20일"],
        answerIndex: 2,
        explanation:
          "근로기준법 제60조에 따라 1년간 80% 이상 출근한 근로자에게 15일의 유급휴가가 주어집니다.",
      },
      {
        category: "노동법",
        question: "주휴일은 어떤 조건에서 발생하나요?",
        options: [
          "주 15시간 이상 근무 시",
          "주 20시간 이상 근무 시",
          "주 30시간 이상 근무 시",
          "주 40시간 근무 시에만",
        ],
        answerIndex: 0,
        explanation:
          "근로기준법 제55조에 따라 1주 소정근로일을 개근한 자에게 주휴일이 주어지며, 주 15시간 이상 근무해야 합니다.",
      },
    ],
    medium: [
      {
        category: "노동법",
        question:
          "연장근로 수당은 통상임금의 몇 %를 가산하여 지급해야 하나요?",
        options: ["25%", "50%", "75%", "100%"],
        answerIndex: 1,
        explanation:
          "근로기준법 제56조에 따라 연장근로에 대해 통상임금의 50%를 가산 지급합니다.",
      },
      {
        category: "노동법",
        question:
          "퇴직금 지급 의무가 발생하는 최소 근무 기간은 얼마인가요?",
        options: ["6개월", "1년", "2년", "3년"],
        answerIndex: 1,
        explanation:
          "근로자퇴직급여 보장법 제4조에 따라 1년 이상 계속 근로한 근로자에게 퇴직금을 지급해야 합니다.",
      },
      {
        category: "노동법",
        question:
          "휴일근로 수당(8시간 이내)은 통상임금의 몇 %를 가산해야 하나요?",
        options: ["25%", "50%", "100%", "150%"],
        answerIndex: 2,
        explanation:
          "근로기준법 제56조 제2항에 따라 8시간 이내의 휴일근로는 통상임금의 50%를, 8시간 초과분은 100%를 가산합니다.",
      },
      {
        category: "노동법",
        question: "연차 유급휴가는 최대 며칠까지 늘어날 수 있나요?",
        options: ["20일", "25일", "30일", "제한 없음"],
        answerIndex: 1,
        explanation:
          "근로기준법 제60조에 따라 3년 이상 근무 시 2년마다 1일씩 추가되어 최대 25일까지 부여됩니다.",
      },
      {
        category: "노동법",
        question: "사용하지 않은 연차에 대한 수당은 언제 지급해야 하나요?",
        options: [
          "연차 발생일로부터 1년 내",
          "퇴직 시에만",
          "연차 사용 촉진 후 소멸",
          "사용 기간 만료 후 즉시",
        ],
        answerIndex: 3,
        explanation:
          "미사용 연차에 대해서는 사용 기간 만료 후 연차수당으로 지급해야 합니다. 단, 연차 사용 촉진 제도를 시행한 경우 사용자의 보상 의무가 면제됩니다.",
      },
      {
        category: "노동법",
        question:
          "근로시간 중 대기시간(예: 경비원 야간 수면시간)은 근로시간에 해당하나요?",
        options: [
          "항상 근로시간",
          "항상 휴게시간",
          "사용자 지휘 감독 하에 있으면 근로시간",
          "근로계약서에 따라 다름",
        ],
        answerIndex: 2,
        explanation:
          "판례에 따라 사용자의 지휘·감독 아래 있는 대기시간은 근로시간에 해당합니다. 자유롭게 이용할 수 있는 시간만 휴게시간입니다.",
      },
      {
        category: "노동법",
        question:
          "5인 미만 사업장에서 적용되지 않는 근로기준법 규정은?",
        options: [
          "최저임금",
          "퇴직금",
          "부당해고 구제신청",
          "근로계약서 작성",
        ],
        answerIndex: 2,
        explanation:
          "5인 미만 사업장은 부당해고 구제신청, 연장·야간·휴일 가산수당 등 일부 조항이 적용되지 않습니다. 최저임금, 퇴직금, 근로계약서는 적용됩니다.",
      },
      {
        category: "노동법",
        question:
          "포괄임금제 약정이 있어도 실제 연장근로가 약정 시간을 초과하면?",
        options: [
          "추가 수당 불필요",
          "초과분 수당 지급 의무 있음",
          "약정에 따라 다름",
          "근로자가 동의하면 불필요",
        ],
        answerIndex: 1,
        explanation:
          "대법원 판례에 따라 포괄임금 약정 시간을 초과한 실제 근로에 대해서는 추가 수당을 지급해야 합니다.",
      },
    ],
    hard: [
      {
        category: "노동법",
        question:
          "근로기준법상 '통상임금'에 해당하지 않는 것은?",
        options: [
          "기본급",
          "직무수당",
          "매월 정기적으로 지급되는 상여금",
          "실적에 따라 변동하는 성과급",
        ],
        answerIndex: 3,
        explanation:
          "통상임금은 정기적·일률적·고정적으로 지급되는 임금입니다. 실적에 따라 변동하는 성과급은 고정성이 없어 통상임금에 해당하지 않습니다.",
      },
      {
        category: "노동법",
        question:
          "근로자가 부당해고를 당했을 때, 노동위원회에 구제 신청할 수 있는 기한은?",
        options: [
          "해고일로부터 1개월 이내",
          "해고일로부터 3개월 이내",
          "해고일로부터 6개월 이내",
          "해고일로부터 1년 이내",
        ],
        answerIndex: 1,
        explanation:
          "근로기준법 제28조에 따라 부당해고를 당한 근로자는 해고일로부터 3개월 이내에 노동위원회에 구제 신청을 해야 합니다.",
      },
      {
        category: "노동법",
        question:
          "경영상 해고(정리해고)의 요건이 아닌 것은?",
        options: [
          "긴박한 경영상의 필요",
          "해고 회피 노력",
          "합리적이고 공정한 기준",
          "근로자 과반수의 동의",
        ],
        answerIndex: 3,
        explanation:
          "근로기준법 제24조에 따라 정리해고는 ①긴박한 경영상 필요, ②해고 회피 노력, ③합리적 기준, ④노동조합 또는 근로자 대표와 '성실한 협의'가 요건입니다. 과반수 동의는 요건이 아닙니다.",
      },
      {
        category: "노동법",
        question:
          "근로기준법상 휴게시간에 대한 설명 중 틀린 것은?",
        options: [
          "4시간 근무 시 30분 이상",
          "8시간 근무 시 1시간 이상",
          "휴게시간은 유급이다",
          "근로자가 자유롭게 이용할 수 있어야 한다",
        ],
        answerIndex: 2,
        explanation:
          "휴게시간은 무급이 원칙입니다. 근로기준법 제54조에 따라 근로시간 4시간당 30분, 8시간당 1시간 이상의 휴게시간을 근로시간 도중에 주어야 합니다.",
      },
      {
        category: "노동법",
        question:
          "선택적 근로시간제에서 정산 기간은 최대 얼마인가요?",
        options: ["1개월", "3개월", "6개월", "1년"],
        answerIndex: 1,
        explanation:
          "근로기준법 제52조에 따라 선택적 근로시간제의 정산 기간은 최대 3개월입니다. 신상품·연구개발 업무는 서면 합의 시 3개월까지 가능합니다.",
      },
      {
        category: "노동법",
        question:
          "단시간 근로자의 연차 유급휴가 산정 방식으로 맞는 것은?",
        options: [
          "통상 근로자와 동일하게 15일",
          "근무시간 비례로 산정",
          "연차 대상에서 제외",
          "사업주 재량",
        ],
        answerIndex: 1,
        explanation:
          "근로기준법 제18조에 따라 단시간 근로자의 연차는 통상 근로자의 근로시간에 비례하여 산정합니다.",
      },
      {
        category: "노동법",
        question:
          "퇴직금 중간정산이 가능한 사유가 아닌 것은?",
        options: [
          "무주택자의 주택 구입",
          "본인 또는 배우자의 6개월 이상 요양",
          "자녀의 대학 등록금 납부",
          "해외 여행 경비 마련",
        ],
        answerIndex: 3,
        explanation:
          "근로자퇴직급여 보장법 시행령에 따라 주택 구입, 장기 요양, 파산·회생 등 법정 사유에 해당하는 경우에만 중간정산이 가능합니다.",
      },
      {
        category: "노동법",
        question:
          "탄력적 근로시간제(3개월 단위)에서 특정 주의 근로시간이 최대 몇 시간까지 가능한가요?",
        options: ["48시간", "52시간", "56시간", "60시간"],
        answerIndex: 1,
        explanation:
          "근로기준법 제51조에 따라 3개월 단위 탄력적 근로시간제에서 특정 주의 근로시간은 52시간을 초과할 수 없습니다.",
      },
    ],
  },

  급여세금: {
    easy: [
      {
        category: "급여세금",
        question: "4대 보험에 해당하지 않는 것은?",
        options: ["국민연금", "건강보험", "고용보험", "생명보험"],
        answerIndex: 3,
        explanation:
          "4대 보험은 국민연금, 건강보험, 고용보험, 산재보험입니다. 생명보험은 민간 보험으로 4대 보험에 포함되지 않습니다.",
      },
      {
        category: "급여세금",
        question: "월급에서 자동으로 세금을 빼고 지급하는 것을 무엇이라 하나요?",
        options: ["연말정산", "원천징수", "종합소득세", "부가가치세"],
        answerIndex: 1,
        explanation:
          "원천징수란 소득을 지급할 때 소득세를 미리 떼고 납부하는 제도입니다. 매월 급여에서 소득세와 지방소득세를 공제합니다.",
      },
      {
        category: "급여세금",
        question: "실수령액이란 무엇인가요?",
        options: [
          "세전 총 급여",
          "4대 보험 + 세금 공제 후 받는 금액",
          "기본급만을 의미",
          "상여금 포함 연봉",
        ],
        answerIndex: 1,
        explanation:
          "실수령액은 총 급여에서 4대 보험료와 소득세, 지방소득세를 공제한 후 실제로 통장에 입금되는 금액입니다.",
      },
      {
        category: "급여세금",
        question: "연말정산은 무엇을 위한 절차인가요?",
        options: [
          "보너스를 계산하는 절차",
          "연간 소득세를 정산하는 절차",
          "퇴직금을 계산하는 절차",
          "4대 보험료를 환급하는 절차",
        ],
        answerIndex: 1,
        explanation:
          "연말정산은 1년간 원천징수한 소득세와 실제 부담해야 할 세금을 비교해 과부족을 정산하는 절차입니다.",
      },
      {
        category: "급여세금",
        question: "국민연금 보험료는 사용자와 근로자가 어떻게 부담하나요?",
        options: [
          "사용자 전액 부담",
          "근로자 전액 부담",
          "각각 50%씩 부담",
          "사용자 70%, 근로자 30%",
        ],
        answerIndex: 2,
        explanation:
          "국민연금 보험료율 9%를 사용자와 근로자가 각각 4.5%씩 부담합니다.",
      },
      {
        category: "급여세금",
        question: "식대 비과세 한도는 월 얼마인가요?",
        options: ["10만원", "20만원", "30만원", "50만원"],
        answerIndex: 1,
        explanation:
          "소득세법에 따라 월 20만원 이하의 식대는 비과세 소득으로 세금이 부과되지 않습니다.",
      },
      {
        category: "급여세금",
        question: "지방소득세는 소득세의 몇 %인가요?",
        options: ["5%", "10%", "15%", "20%"],
        answerIndex: 1,
        explanation:
          "지방소득세는 소득세의 10%를 추가로 납부하는 세금입니다. 급여에서 소득세와 함께 원천징수됩니다.",
      },
    ],
    medium: [
      {
        category: "급여세금",
        question: "건강보험료율(2024년 기준)은 약 몇 %인가요?",
        options: ["3.545%", "5.09%", "7.09%", "9.0%"],
        answerIndex: 2,
        explanation:
          "2024년 건강보험료율은 7.09%이며, 사용자와 근로자가 각각 3.545%씩 부담합니다. 여기에 장기요양보험료가 추가됩니다.",
      },
      {
        category: "급여세금",
        question: "연말정산에서 '소득공제'와 '세액공제'의 차이는?",
        options: [
          "같은 의미이다",
          "소득공제는 소득에서, 세액공제는 세금에서 차감",
          "세액공제가 항상 유리하다",
          "소득이 적을수록 소득공제가 유리",
        ],
        answerIndex: 1,
        explanation:
          "소득공제는 과세표준(세금 부과 기준 소득)을 줄여주고, 세액공제는 계산된 세금 자체를 직접 줄여줍니다.",
      },
      {
        category: "급여세금",
        question:
          "퇴직소득세 계산 시 적용되는 특별한 세제 혜택은?",
        options: [
          "전액 비과세",
          "분류과세 + 연분연승법 적용",
          "일률 10% 세율 적용",
          "종합소득에 합산",
        ],
        answerIndex: 1,
        explanation:
          "퇴직소득은 종합소득에 합산하지 않고 분류과세하며, 근속연수에 따라 세 부담을 분산하는 연분연승법을 적용합니다.",
      },
      {
        category: "급여세금",
        question: "자가운전 보조금의 비과세 한도는 월 얼마인가요?",
        options: ["10만원", "20만원", "30만원", "50만원"],
        answerIndex: 1,
        explanation:
          "소득세법 시행령에 따라 본인 명의 차량을 업무에 사용하는 경우 월 20만원까지 비과세됩니다.",
      },
      {
        category: "급여세금",
        question:
          "고용보험료 중 근로자가 부담하는 비율은 얼마인가요?",
        options: ["0.65%", "0.9%", "1.0%", "1.8%"],
        answerIndex: 1,
        explanation:
          "고용보험 실업급여 보험료율은 1.8%이며, 사용자와 근로자가 각각 0.9%씩 부담합니다.",
      },
      {
        category: "급여세금",
        question: "산재보험료는 누가 전액 부담하나요?",
        options: [
          "근로자",
          "사용자",
          "근로자와 사용자 반반",
          "정부",
        ],
        answerIndex: 1,
        explanation:
          "산재보험료는 사용자가 전액 부담합니다. 근로자의 급여에서 공제되지 않습니다.",
      },
      {
        category: "급여세금",
        question: "연봉 5,000만원 직장인의 근로소득공제율로 맞는 구간은?",
        options: [
          "총급여 전액의 70%",
          "구간별로 다른 공제율 적용",
          "일률 15% 공제",
          "공제 없음",
        ],
        answerIndex: 1,
        explanation:
          "근로소득공제는 총급여액에 따라 구간별로 차등 적용됩니다. 500만원 이하 70%, 1,500만원 이하 40% 등 누진 방식입니다.",
      },
    ],
    hard: [
      {
        category: "급여세금",
        question:
          "2024년 기준 종합소득세 최고 세율(과세표준 10억 초과)은?",
        options: ["38%", "40%", "42%", "45%"],
        answerIndex: 3,
        explanation:
          "소득세법에 따라 과세표준 10억원 초과 시 45%의 최고세율이 적용됩니다. 지방소득세 포함 시 실효세율은 49.5%입니다.",
      },
      {
        category: "급여세금",
        question:
          "비과세 근로소득에 해당하지 않는 것은?",
        options: [
          "월 20만원 이하 식대",
          "월 20만원 이하 자가운전 보조금",
          "연 240만원 이하 자녀 학자금",
          "월 50만원 상당의 복리후생비",
        ],
        answerIndex: 3,
        explanation:
          "비과세 근로소득은 법률에 정해진 항목과 한도 내에서만 인정됩니다. 일반적인 복리후생비는 과세 대상입니다.",
      },
      {
        category: "급여세금",
        question:
          "중소기업 취업 청년 소득세 감면 비율은 얼마인가요?",
        options: ["50%", "70%", "90%", "100%"],
        answerIndex: 2,
        explanation:
          "조세특례제한법에 따라 중소기업에 취업한 청년(15~34세)은 5년간 소득세의 90%를 감면받을 수 있습니다(연 200만원 한도).",
      },
      {
        category: "급여세금",
        question:
          "연말정산 시 신용카드 소득공제율(일반 사용분)은?",
        options: ["15%", "25%", "30%", "40%"],
        answerIndex: 0,
        explanation:
          "신용카드 사용액 중 총급여의 25%를 초과하는 금액에 대해 15%의 소득공제율이 적용됩니다. 체크카드·현금영수증은 30%입니다.",
      },
      {
        category: "급여세금",
        question:
          "퇴직연금 DB형에서 퇴직급여는 어떻게 산정되나요?",
        options: [
          "납입한 부담금 + 운용수익",
          "퇴직 전 3개월 평균임금 × 근속연수",
          "기본급 × 근속연수",
          "연봉 ÷ 12 × 근속연수",
        ],
        answerIndex: 1,
        explanation:
          "DB(확정급여)형은 퇴직 시 평균임금 × 근속연수로 퇴직급여가 확정됩니다. 운용 위험은 사용자가 부담합니다.",
      },
      {
        category: "급여세금",
        question:
          "주택청약저축 소득공제를 받기 위한 총급여 요건은?",
        options: [
          "총급여 3,600만원 이하",
          "총급여 5,000만원 이하",
          "총급여 7,000만원 이하",
          "총급여 제한 없음",
        ],
        answerIndex: 2,
        explanation:
          "총급여 7,000만원 이하인 무주택 세대주가 주택청약저축 납입액(연 300만원 한도)의 40%를 소득공제받을 수 있습니다.",
      },
      {
        category: "급여세금",
        question:
          "해외 주재원의 월 300만원 이하 비과세 항목은?",
        options: [
          "기본급",
          "국외근로소득",
          "상여금",
          "성과급",
        ],
        answerIndex: 1,
        explanation:
          "소득세법에 따라 국외에서 근로를 제공하고 받는 급여 중 월 300만원(원양어업 등은 500만원)까지 비과세됩니다.",
      },
    ],
  },

  직장에티켓: {
    easy: [
      {
        category: "직장에티켓",
        question: "이메일에서 CC와 BCC의 차이는 무엇인가요?",
        options: [
          "CC는 참조, BCC는 숨은 참조",
          "CC는 숨은 참조, BCC는 참조",
          "둘 다 같은 기능",
          "CC는 답장, BCC는 전달",
        ],
        answerIndex: 0,
        explanation:
          "CC(Carbon Copy)는 수신자에게 참조인이 보이고, BCC(Blind Carbon Copy)는 다른 수신자에게 참조인이 보이지 않습니다.",
      },
      {
        category: "직장에티켓",
        question: "명함을 교환할 때 올바른 방법은?",
        options: [
          "한 손으로 건네기",
          "두 손으로 건네고 두 손으로 받기",
          "테이블 위에 놓아두기",
          "주머니에서 바로 꺼내 주기",
        ],
        answerIndex: 1,
        explanation:
          "비즈니스 매너에서 명함은 두 손으로 건네고, 상대방의 명함도 두 손으로 받는 것이 기본 예절입니다.",
      },
      {
        category: "직장에티켓",
        question: "업무 전화를 받을 때 가장 적절한 인사는?",
        options: [
          "'네, 여보세요'",
          "'안녕하세요, OO팀 OOO입니다'",
          "'누구세요?'",
          "'무슨 일이세요?'",
        ],
        answerIndex: 1,
        explanation:
          "업무 전화에서는 소속과 이름을 밝히는 것이 기본 예절입니다. 상대방이 누구인지 확인하기 쉽고 전문적인 인상을 줍니다.",
      },
      {
        category: "직장에티켓",
        question: "회의 중 지켜야 할 기본 예절이 아닌 것은?",
        options: [
          "발언자의 말을 경청한다",
          "핸드폰을 무음으로 설정한다",
          "관련 없는 업무를 병행한다",
          "회의 자료를 사전에 검토한다",
        ],
        answerIndex: 2,
        explanation:
          "회의 중 관련 없는 업무를 병행하는 것은 발언자에 대한 예의에 어긋나며, 회의 효율을 떨어뜨립니다.",
      },
      {
        category: "직장에티켓",
        question: "업무 보고 시 가장 효과적인 방법은?",
        options: [
          "배경부터 상세히 설명",
          "결론부터 말하고 근거를 덧붙이기",
          "구두로만 보고",
          "이메일만으로 보고",
        ],
        answerIndex: 1,
        explanation:
          "비즈니스 보고에서는 '결론 → 근거 → 배경' 순으로 전달하는 역피라미드 구조가 가장 효과적입니다.",
      },
      {
        category: "직장에티켓",
        question: "엘리베이터에서 상사와 함께할 때 올바른 위치는?",
        options: [
          "조작 패널 앞",
          "상사 앞에 서기",
          "먼저 내리기",
          "가장 안쪽",
        ],
        answerIndex: 0,
        explanation:
          "직급이 낮은 사람이 조작 패널 앞에 서서 층 버튼을 누르고, 문을 잡아주는 것이 기본 예절입니다.",
      },
    ],
    medium: [
      {
        category: "직장에티켓",
        question: "이메일에서 '전체 답장(Reply All)'을 사용해야 하는 경우는?",
        options: [
          "항상 사용",
          "모든 수신자가 내용을 알아야 할 때",
          "개인적인 의견을 보낼 때",
          "첨부파일이 있을 때",
        ],
        answerIndex: 1,
        explanation:
          "전체 답장은 모든 수신자가 정보를 공유해야 할 때만 사용합니다. 불필요한 전체 답장은 업무 방해가 됩니다.",
      },
      {
        category: "직장에티켓",
        question: "비즈니스 이메일 제목 작성법으로 적절한 것은?",
        options: [
          "'안녕하세요'",
          "'[요청] 5/12 회의 자료 검토 부탁드립니다'",
          "'긴급!!!'",
          "'문의'",
        ],
        answerIndex: 1,
        explanation:
          "이메일 제목은 [카테고리]와 핵심 내용을 포함하여 수신자가 내용을 즉시 파악할 수 있게 작성해야 합니다.",
      },
      {
        category: "직장에티켓",
        question: "화상회의 예절로 적절하지 않은 것은?",
        options: [
          "카메라를 켜고 참여한다",
          "발언하지 않을 때 마이크를 끈다",
          "배경을 정리하거나 가상 배경을 사용한다",
          "다른 업무를 하면서 듣기만 한다",
        ],
        answerIndex: 3,
        explanation:
          "화상회의에서도 집중하여 참여하는 것이 기본입니다. 다른 업무를 병행하면 발언 요청에 대응하지 못하고, 비언어적 소통도 어렵습니다.",
      },
      {
        category: "직장에티켓",
        question: "상사에게 보고할 때 '두괄식'과 '미괄식' 중 어떤 방식이 적합한가요?",
        options: [
          "항상 미괄식",
          "두괄식(결론 먼저)",
          "상황에 따라 다르지만 기본은 두괄식",
          "형식은 상관없음",
        ],
        answerIndex: 2,
        explanation:
          "업무 보고에서는 두괄식이 기본입니다. 다만 부정적 결과 보고 시에는 배경 설명 후 결론을 전달하는 것이 적절할 수 있습니다.",
      },
      {
        category: "직장에티켓",
        question: "비즈니스 점심 자리에서 상석(윗자리)은 어디인가요?",
        options: [
          "입구에서 가장 가까운 자리",
          "입구에서 가장 먼 안쪽 자리",
          "창가 자리",
          "계산대 근처 자리",
        ],
        answerIndex: 1,
        explanation:
          "한국 비즈니스 매너에서 상석은 입구에서 가장 먼 안쪽 자리입니다. 상사나 손님에게 상석을 권하는 것이 예절입니다.",
      },
      {
        category: "직장에티켓",
        question: "업무 메신저(슬랙, 팀즈 등) 사용 시 적절한 행동은?",
        options: [
          "모든 대화에 이모티콘으로 반응",
          "긴 내용은 스레드로 정리",
          "퇴근 후에도 즉시 답변",
          "중요한 사항도 DM으로만 전달",
        ],
        answerIndex: 1,
        explanation:
          "채널의 가독성을 위해 긴 논의는 스레드를 활용하는 것이 좋습니다. 중요 사항은 적절한 채널에 공유해야 합니다.",
      },
    ],
    hard: [
      {
        category: "직장에티켓",
        question:
          "비즈니스 이메일에서 'FYI'의 의미와 적절한 사용 맥락은?",
        options: [
          "'빠른 답장 요망'의 뜻, 긴급 요청 시 사용",
          "'참고로 알려드립니다'의 뜻, 정보 공유 시 사용",
          "'확인 부탁드립니다'의 뜻, 승인 요청 시 사용",
          "'후속 조치 필요'의 뜻, 업무 지시 시 사용",
        ],
        answerIndex: 1,
        explanation:
          "FYI(For Your Information)는 '참고로 알려드립니다'라는 뜻으로, 별도의 회신이 필요 없는 정보 공유 시 사용합니다.",
      },
      {
        category: "직장에티켓",
        question:
          "해외 거래처와의 화상회의 일정을 잡을 때 가장 중요한 고려 사항은?",
        options: [
          "우리 측 업무시간에 맞추기",
          "시차를 고려하여 양측 업무시간이 겹치는 시간 제안",
          "주말에 잡아 평일 업무에 방해되지 않게 하기",
          "시차 없이 자정에 잡기",
        ],
        answerIndex: 1,
        explanation:
          "글로벌 비즈니스에서는 양측의 업무시간이 겹치는 시간대를 찾아 제안하는 것이 기본 매너입니다.",
      },
      {
        category: "직장에티켓",
        question:
          "거래처에 사과 이메일을 보낼 때 가장 적절한 구성은?",
        options: [
          "변명 → 사과 → 재발 방지",
          "사과 → 원인 설명 → 재발 방지 대책",
          "사과만 간략히",
          "원인 → 책임 전가 → 향후 계획",
        ],
        answerIndex: 1,
        explanation:
          "비즈니스 사과문은 '즉각 사과 → 원인 설명(변명X) → 구체적 재발 방지 대책' 순서가 가장 효과적이고 신뢰를 회복할 수 있습니다.",
      },
      {
        category: "직장에티켓",
        question:
          "다수가 참석하는 회의에서 의견 충돌 시 가장 적절한 대응은?",
        options: [
          "상대 의견을 즉시 반박한다",
          "감정적으로 대응하여 열정을 보여준다",
          "상대 의견을 요약·인정한 뒤 대안을 제시한다",
          "침묵으로 불만을 표시한다",
        ],
        answerIndex: 2,
        explanation:
          "상대 의견을 먼저 인정(acknowledge)한 후 자신의 대안을 제시하는 것이 건설적 토론의 기본입니다. 'Yes, and...' 또는 'I see your point, however...' 방식이 효과적입니다.",
      },
      {
        category: "직장에티켓",
        question:
          "프레젠테이션에서 '3의 법칙(Rule of Three)'이란?",
        options: [
          "슬라이드를 3장 이내로 만드는 것",
          "핵심 메시지를 3가지로 구성하는 것",
          "3분 이내로 발표하는 것",
          "3명 이상에게 피드백 받는 것",
        ],
        answerIndex: 1,
        explanation:
          "3의 법칙은 핵심 메시지를 3가지로 구성하면 청중이 기억하기 쉽고 설득력이 높아진다는 커뮤니케이션 원칙입니다.",
      },
      {
        category: "직장에티켓",
        question:
          "업무 피드백을 줄 때 'SBI 모델'의 구성 요소는?",
        options: [
          "Summary, Background, Impact",
          "Situation, Behavior, Impact",
          "Scope, Benchmark, Improvement",
          "Subject, Body, Intent",
        ],
        answerIndex: 1,
        explanation:
          "SBI 모델은 Situation(상황), Behavior(행동), Impact(영향)으로 구성된 피드백 프레임워크로, 구체적이고 객관적인 피드백을 가능하게 합니다.",
      },
    ],
  },

  비즈니스용어: {
    easy: [
      {
        category: "비즈니스용어",
        question: "ROI는 무엇의 약자인가요?",
        options: [
          "Rate of Income",
          "Return on Investment",
          "Risk of Inflation",
          "Report on Issues",
        ],
        answerIndex: 1,
        explanation:
          "ROI(Return on Investment)는 투자 대비 수익률을 의미합니다. 투자한 비용 대비 얼마나 이익을 얻었는지를 나타내는 지표입니다.",
      },
      {
        category: "비즈니스용어",
        question: "B2B와 B2C의 차이는 무엇인가요?",
        options: [
          "B2B는 기업 간, B2C는 기업과 소비자 간 거래",
          "B2B는 소규모, B2C는 대규모 거래",
          "B2B는 온라인, B2C는 오프라인 거래",
          "둘 다 같은 뜻",
        ],
        answerIndex: 0,
        explanation:
          "B2B(Business to Business)는 기업 간 거래, B2C(Business to Consumer)는 기업이 최종 소비자에게 직접 판매하는 거래입니다.",
      },
      {
        category: "비즈니스용어",
        question: "KPI는 무엇을 의미하나요?",
        options: [
          "Key Performance Indicator",
          "Knowledge Process Integration",
          "Korean Product Index",
          "Key Profit Increase",
        ],
        answerIndex: 0,
        explanation:
          "KPI(Key Performance Indicator)는 핵심 성과 지표로, 목표 달성도를 측정하는 데 사용되는 정량적 지표입니다.",
      },
      {
        category: "비즈니스용어",
        question: "YoY는 무엇의 약자인가요?",
        options: [
          "Year of Yield",
          "Year over Year",
          "Yield on Year",
          "Young or Younger",
        ],
        answerIndex: 1,
        explanation:
          "YoY(Year over Year)는 전년 동기 대비 비교를 뜻합니다. 예: '매출이 YoY 20% 증가' = 작년 같은 기간보다 20% 증가.",
      },
      {
        category: "비즈니스용어",
        question: "MoM은 어떤 비교를 의미하나요?",
        options: [
          "월별 비교(Month over Month)",
          "관리 방식(Method of Management)",
          "수익 모델(Model of Money)",
          "시장 점유율(Market of Market)",
        ],
        answerIndex: 0,
        explanation:
          "MoM(Month over Month)은 전월 대비 비교를 의미합니다. 월간 성장률이나 변동을 측정할 때 사용합니다.",
      },
    ],
    medium: [
      {
        category: "비즈니스용어",
        question: "BEP(Break Even Point)란 무엇인가요?",
        options: [
          "최대 이익 지점",
          "손익분기점",
          "투자 회수 기간",
          "시장 진입 시점",
        ],
        answerIndex: 1,
        explanation:
          "BEP(Break Even Point)는 손익분기점으로, 총수익과 총비용이 같아져 이익도 손실도 없는 지점을 의미합니다.",
      },
      {
        category: "비즈니스용어",
        question: "OKR의 구성 요소는?",
        options: [
          "Objective와 Key Result",
          "Operation과 Key Resource",
          "Output과 Knowledge Rate",
          "Opportunity와 Key Revenue",
        ],
        answerIndex: 0,
        explanation:
          "OKR은 Objective(목표)와 Key Results(핵심 결과)로 구성됩니다. 구글, 인텔 등에서 사용하는 목표 관리 프레임워크입니다.",
      },
      {
        category: "비즈니스용어",
        question: "IR(Investor Relations)의 주된 목적은?",
        options: [
          "내부 직원 교육",
          "투자자와의 소통 및 기업 가치 전달",
          "고객 불만 처리",
          "경쟁사 분석",
        ],
        answerIndex: 1,
        explanation:
          "IR(Investor Relations)은 투자자 관계를 의미하며, 기업이 투자자에게 재무 상태와 경영 현황을 투명하게 전달하는 활동입니다.",
      },
      {
        category: "비즈니스용어",
        question: "SWOT 분석에서 'O'는 무엇을 의미하나요?",
        options: [
          "Organization",
          "Opportunity",
          "Operation",
          "Output",
        ],
        answerIndex: 1,
        explanation:
          "SWOT 분석은 Strengths(강점), Weaknesses(약점), Opportunities(기회), Threats(위협)의 약자입니다.",
      },
      {
        category: "비즈니스용어",
        question: "MVP(Minimum Viable Product)는 무엇인가요?",
        options: [
          "최고 성과를 낸 제품",
          "핵심 기능만 갖춘 최소 실행 가능 제품",
          "가장 비싼 프리미엄 제품",
          "시장 점유율 1위 제품",
        ],
        answerIndex: 1,
        explanation:
          "MVP는 핵심 기능만 갖춘 최소 실행 가능 제품입니다. 빠르게 출시하여 고객 반응을 검증하는 린 스타트업 방법론의 핵심 개념입니다.",
      },
    ],
    hard: [
      {
        category: "비즈니스용어",
        question: "EBITDA는 무엇을 의미하나요?",
        options: [
          "세전 영업이익",
          "이자, 세금, 감가상각비 차감 전 영업이익",
          "순이익",
          "매출총이익",
        ],
        answerIndex: 1,
        explanation:
          "EBITDA(Earnings Before Interest, Taxes, Depreciation and Amortization)는 이자, 세금, 감가상각비 차감 전 영업이익으로, 기업의 순수 영업 수익력을 측정합니다.",
      },
      {
        category: "비즈니스용어",
        question: "CAC와 LTV의 관계에서 건전한 비즈니스의 기준은?",
        options: [
          "CAC > LTV",
          "CAC = LTV",
          "LTV가 CAC의 3배 이상",
          "CAC가 LTV의 3배 이상",
        ],
        answerIndex: 2,
        explanation:
          "LTV(고객 생애 가치)가 CAC(고객 획득 비용)의 3배 이상이면 건전한 비즈니스로 봅니다. 이 비율이 낮으면 수익성에 문제가 있습니다.",
      },
      {
        category: "비즈니스용어",
        question: "아래 중 'Burn Rate'에 대한 설명으로 맞는 것은?",
        options: [
          "매출 성장률",
          "스타트업이 월간 소진하는 현금",
          "직원 이직률",
          "제품 불량률",
        ],
        answerIndex: 1,
        explanation:
          "Burn Rate는 스타트업이 수익 없이 월간 소진하는 현금을 의미합니다. 보유 현금을 Burn Rate로 나누면 Runway(생존 가능 기간)를 구할 수 있습니다.",
      },
      {
        category: "비즈니스용어",
        question: "피벗(Pivot)과 이터레이션(Iteration)의 차이는?",
        options: [
          "같은 의미이다",
          "피벗은 방향 전환, 이터레이션은 기존 방향에서 개선·반복",
          "이터레이션이 더 큰 변화",
          "피벗은 제품, 이터레이션은 마케팅에만 해당",
        ],
        answerIndex: 1,
        explanation:
          "피벗은 사업 모델이나 전략 방향 자체를 바꾸는 것이고, 이터레이션은 기존 방향을 유지하며 점진적으로 개선·반복하는 과정입니다.",
      },
      {
        category: "비즈니스용어",
        question: "TAM, SAM, SOM 중 실제 단기 매출 목표에 해당하는 것은?",
        options: ["TAM", "SAM", "SOM", "세 가지 모두"],
        answerIndex: 2,
        explanation:
          "TAM(전체 시장), SAM(유효 시장), SOM(수익 가능 시장) 중 SOM(Serviceable Obtainable Market)이 실제로 단기간에 확보 가능한 시장 규모입니다.",
      },
    ],
  },

  복지혜택: {
    easy: [
      {
        category: "복지혜택",
        question: "출산 전후 휴가(출산휴가)는 총 며칠인가요?",
        options: ["60일", "90일", "120일", "180일"],
        answerIndex: 1,
        explanation:
          "근로기준법 제74조에 따라 출산 전후 휴가는 총 90일이며, 출산 후 45일 이상을 확보해야 합니다.",
      },
      {
        category: "복지혜택",
        question: "육아휴직은 자녀가 몇 세까지 사용할 수 있나요?",
        options: [
          "만 6세 이하",
          "만 8세 이하",
          "만 12세 이하",
          "만 15세 이하",
        ],
        answerIndex: 1,
        explanation:
          "남녀고용평등법에 따라 만 8세 이하 또는 초등학교 2학년 이하의 자녀가 있는 근로자는 육아휴직을 사용할 수 있습니다.",
      },
      {
        category: "복지혜택",
        question: "실업급여를 받으려면 최소 얼마 이상 고용보험에 가입해야 하나요?",
        options: ["90일", "180일", "270일", "365일"],
        answerIndex: 1,
        explanation:
          "고용보험법에 따라 이직 전 18개월 중 180일 이상 고용보험에 가입한 경우 실업급여를 받을 수 있습니다.",
      },
      {
        category: "복지혜택",
        question: "배우자 출산휴가는 며칠인가요?",
        options: ["3일", "5일", "10일", "20일"],
        answerIndex: 2,
        explanation:
          "남녀고용평등법에 따라 배우자 출산휴가는 10일이며, 유급으로 보장됩니다. 출산일로부터 90일 이내에 사용해야 합니다.",
      },
    ],
    medium: [
      {
        category: "복지혜택",
        question: "육아휴직 급여는 통상임금의 몇 %인가요?",
        options: [
          "50%",
          "80%(상한 150만원)",
          "100%",
          "정액 100만원",
        ],
        answerIndex: 1,
        explanation:
          "고용보험법에 따라 육아휴직 급여는 통상임금의 80%(상한 150만원, 하한 70만원)입니다. 첫 3개월은 통상임금의 80%가 지급됩니다.",
      },
      {
        category: "복지혜택",
        question: "산재보험 적용 대상은 누구인가요?",
        options: [
          "정규직만",
          "5인 이상 사업장 근로자만",
          "1인 이상 사업장의 모든 근로자",
          "고용보험 가입자만",
        ],
        answerIndex: 2,
        explanation:
          "산업재해보상보험법에 따라 근로자를 사용하는 모든 사업장(1인 이상)에 적용됩니다. 비정규직, 일용직도 포함됩니다.",
      },
      {
        category: "복지혜택",
        question: "실업급여 수급 중 재취업하면 받을 수 있는 수당은?",
        options: [
          "없음",
          "조기재취업수당",
          "취업축하금",
          "이직수당",
        ],
        answerIndex: 1,
        explanation:
          "실업급여 수급 기간의 1/2 이상을 남기고 재취업하면 잔여 급여의 1/2을 조기재취업수당으로 일시 지급받을 수 있습니다.",
      },
      {
        category: "복지혜택",
        question: "육아기 근로시간 단축 제도의 최소 근로시간은?",
        options: [
          "주 10시간",
          "주 15시간",
          "주 20시간",
          "주 25시간",
        ],
        answerIndex: 1,
        explanation:
          "남녀고용평등법에 따라 육아기 근로시간 단축 시 주당 근로시간은 15시간 이상 35시간 이하로 해야 합니다.",
      },
    ],
    hard: [
      {
        category: "복지혜택",
        question:
          "3+3 부모육아휴직제에서 부모 모두 육아휴직 시 첫 3개월 급여 상한은?",
        options: [
          "각각 월 150만원",
          "각각 월 200만원",
          "각각 월 300만원",
          "각각 월 450만원",
        ],
        answerIndex: 2,
        explanation:
          "3+3 부모육아휴직제는 생후 12개월 내 자녀에 대해 부모가 모두 육아휴직 사용 시, 첫 3개월은 통상임금의 100%(각각 월 300만원 상한)를 지급합니다.",
      },
      {
        category: "복지혜택",
        question:
          "산재보험에서 '출퇴근 재해'가 인정되지 않는 경우는?",
        options: [
          "대중교통 이용 중 사고",
          "통상적 경로에서의 교통사고",
          "퇴근 후 개인 용무를 위해 우회한 구간에서 사고",
          "도보 출근 중 교통사고",
        ],
        answerIndex: 2,
        explanation:
          "산업재해보상보험법에 따라 합리적 경로와 방법에 의한 출퇴근 중 사고만 인정됩니다. 개인 용무를 위한 우회 구간은 인정되지 않습니다.",
      },
      {
        category: "복지혜택",
        question:
          "실업급여 수급 기간은 고용보험 가입 기간에 따라 다릅니다. 50세 미만, 가입 기간 10년 이상의 수급 기간은?",
        options: ["120일", "150일", "180일", "210일"],
        answerIndex: 2,
        explanation:
          "50세 미만이고 고용보험 가입 기간이 10년 이상인 경우 실업급여 수급 기간은 180일입니다. 50세 이상 또는 장애인은 더 긴 기간이 적용됩니다.",
      },
      {
        category: "복지혜택",
        question:
          "국민연금 노령연금의 수급 개시 연령(1969년 이후 출생자)은?",
        options: ["60세", "62세", "65세", "67세"],
        answerIndex: 2,
        explanation:
          "국민연금법에 따라 1969년 이후 출생자의 노령연금 수급 개시 연령은 65세입니다. 출생 연도에 따라 단계적으로 상향 조정되었습니다.",
      },
    ],
  },
};

// ─── 문제 배분 알고리즘 ──────────────────────────────────

interface DayAssignment {
  date: string;
  questions: QuestionItem[];
}

function distributeQuestions(): DayAssignment[] {
  const categories = ["노동법", "급여세금", "직장에티켓", "비즈니스용어", "복지혜택"];
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  // 카테고리별 난이도별 문제 복사
  const pools: Record<string, Record<Difficulty, QuestionItem[]>> = {};
  for (const cat of categories) {
    pools[cat] = {
      easy: [...questionPool[cat].easy],
      medium: [...questionPool[cat].medium],
      hard: [...questionPool[cat].hard],
    };
  }

  // 각 카테고리별 총 문제 수 (난이도별로 뽑아야 하는 수)
  // 노동법:24 (easy8, medium8, hard8)
  // 급여세금:21 (easy7, medium7, hard7)
  // 직장에티켓:18 (easy6, medium6, hard6)
  // 비즈니스용어:15 (easy5, medium5, hard5)
  // 복지혜택:12 (easy4, medium4, hard4)

  const today = dayjs();
  const days: DayAssignment[] = [];

  // 카테고리별 사용 카운터
  const used: Record<string, number> = {};
  for (const cat of categories) {
    used[cat] = 0;
  }

  const totalPerCategory: Record<string, number> = {
    노동법: 24,
    급여세금: 21,
    직장에티켓: 18,
    비즈니스용어: 15,
    복지혜택: 12,
  };

  for (let d = 0; d < 30; d++) {
    const date = today.add(d, "day").format("YYYY-MM-DD");

    // 남은 문제 수가 많은 카테고리 우선 선택 (서로 다른 3개)
    const remaining = categories
      .map((cat) => ({ cat, left: totalPerCategory[cat] - used[cat] }))
      .filter((x) => x.left > 0)
      .sort((a, b) => b.left - a.left);

    const selectedCats = remaining.slice(0, 3).map((x) => x.cat);

    const questions: QuestionItem[] = [];

    for (let i = 0; i < 3; i++) {
      const cat = selectedCats[i];
      const diff = difficulties[i]; // easy, medium, hard 순
      const pool = pools[cat][diff];
      const q = pool.shift()!;
      questions.push(q);
      used[cat]++;
    }

    days.push({ date, questions });
  }

  return days;
}

// ─── 시딩 실행 ───────────────────────────────────────────

async function seed() {
  const assignments = distributeQuestions();
  const batch = db.batch();

  for (const { date, questions } of assignments) {
    const ref = db.collection("questions").doc(date);
    batch.set(ref, {
      questions,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✅ ${assignments.length}일치 문서 시딩 완료 (총 ${assignments.length * 3}문제)`);

  // 날짜별 카테고리 배분 요약
  for (const { date, questions } of assignments) {
    const cats = questions.map((q) => q.category).join(" / ");
    console.log(`  ${date}: ${cats}`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ 시딩 실패:", err);
  process.exit(1);
});
