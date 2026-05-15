import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import dayjs from "dayjs";
import { db } from "./firebase";

// ─── Types ───────────────────────────────────────────────

export interface QuestionItem {
  category: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty?: "easy" | "medium" | "hard"; // 쉬움=5, 보통=10, 어려움=15
  points?: number; // difficulty 없을 때 직접 지정
}

export interface QuestionsDoc {
  questions: QuestionItem[];
  createdAt: Timestamp;
}

export interface StepResult {
  step: number;
  isCorrect: boolean;
  usedChance: boolean;
  pointsEarned: number;
}

export interface DailyProgress {
  userId: string;
  date: string;
  currentStep: number;
  stepResults: StepResult[];
  isCompleted: boolean;
  isSuccess: boolean;
  isFailed: boolean;
  failedAtStep: number | null;
  totalPointsToday: number;
  updatedAt: Timestamp;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  streak: number;
  maxStreak: number;
  lastSuccessDate: string;
  lastPlayedDate: string;
  updatedAt: Timestamp;
}

// ─── Helpers ─────────────────────────────────────────────

function getToday(): string {
  return dayjs().format("YYYY-MM-DD");
}

function getYesterday(): string {
  return dayjs().subtract(1, "day").format("YYYY-MM-DD");
}

function progressDocId(userId: string, date: string): string {
  return `${userId}_${date}`;
}

// ─── getTodayQuestion ────────────────────────────────────

export async function getTodayQuestion(): Promise<QuestionsDoc | null> {
  const today = getToday();
  const snap = await getDoc(doc(db, "questions", today));
  return snap.exists() ? (snap.data() as QuestionsDoc) : null;
}

// ─── getDailyProgress ───────────────────────────────────

export async function getDailyProgress(
  userId: string
): Promise<DailyProgress> {
  const today = getToday();
  const docId = progressDocId(userId, today);
  const ref = doc(db, "userDailyProgress", docId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as DailyProgress;
  }

  const newProgress: DailyProgress = {
    userId,
    date: today,
    currentStep: 1,
    stepResults: [],
    isCompleted: false,
    isSuccess: false,
    isFailed: false,
    failedAtStep: null,
    totalPointsToday: 0,
    updatedAt: Timestamp.now(),
  };

  await setDoc(ref, newProgress);
  return newProgress;
}

// ─── saveStepResult ─────────────────────────────────────

export async function saveStepResult(
  userId: string,
  step: number,
  isCorrect: boolean,
  usedChance: boolean,
  pointsEarned: number,
  totalSteps: number = 3
): Promise<DailyProgress> {
  const today = getToday();
  const docId = progressDocId(userId, today);
  const ref = doc(db, "userDailyProgress", docId);

  const progress = await getDailyProgress(userId);

  // 이미 처리된 step이면 재저장 방지
  // (뒤로가기 후 같은 문제 재풀기, 네트워크 중복 요청 등 방어)
  if (progress.currentStep > step) {
    return progress;
  }

  const newStepResult: StepResult = {
    step,
    isCorrect,
    usedChance,
    pointsEarned,
  };

  const stepResults = [...progress.stepResults, newStepResult];
  const totalPointsToday = progress.totalPointsToday + pointsEarned;

  let currentStep = progress.currentStep;
  let isCompleted = false;
  let isSuccess = false;
  let isFailed = false;
  let failedAtStep: number | null = null;

  if (isCorrect && step >= totalSteps) {
    // 마지막 문제 정답 → 완전 성공
    currentStep = totalSteps + 1;
    isCompleted = true;
    isSuccess = true;
  } else if (!isCorrect && usedChance) {
    // 재도전에서도 오답 → 탈락
    currentStep = totalSteps + 1;
    isCompleted = true;
    isFailed = true;
    failedAtStep = step;
  } else if (!isCorrect && !usedChance) {
    // 첫 오답 → 아직 종료 안 함 (ChanceModal 처리 중)
    // currentStep 유지
  } else if (isCorrect && step < totalSteps) {
    // 정답 + 다음 문제로
    currentStep = step + 1;
  }

  const updated: Partial<DailyProgress> = {
    stepResults,
    totalPointsToday,
    currentStep,
    isCompleted,
    isSuccess,
    isFailed,
    failedAtStep,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(ref, updated);

  return { ...progress, ...updated };
}

// ─── updateUserPoints ───────────────────────────────────

export async function updateUserPoints(
  userId: string,
  pointsToAdd: number,
  isSuccess: boolean
): Promise<UserPoints> {
  const ref = doc(db, "userPoints", userId);
  const snap = await getDoc(ref);
  const today = getToday();
  const yesterday = getYesterday();

  let data: UserPoints;

  if (snap.exists()) {
    data = snap.data() as UserPoints;
  } else {
    data = {
      userId,
      totalPoints: 0,
      streak: 0,
      maxStreak: 0,
      lastSuccessDate: "",
      lastPlayedDate: "",
      updatedAt: Timestamp.now(),
    };
  }

  data.totalPoints += pointsToAdd;
  data.lastPlayedDate = today;

  if (isSuccess) {
    if (data.lastSuccessDate === yesterday) {
      data.streak += 1;
    } else {
      data.streak = 1;
    }
    data.lastSuccessDate = today;
    data.maxStreak = Math.max(data.maxStreak, data.streak);

    // 7일마다 보너스 10스탬프
    if (data.streak % 7 === 0) {
      data.totalPoints += 10;
    }
  } else {
    data.streak = 0;
  }

  data.updatedAt = Timestamp.now();

  await setDoc(ref, data);
  return data;
}

// ─── getUserPoints ──────────────────────────────────────

export async function getUserPoints(
  userId: string
): Promise<UserPoints | null> {
  const snap = await getDoc(doc(db, "userPoints", userId));
  return snap.exists() ? (snap.data() as UserPoints) : null;
}

// ─── getUserHistory ─────────────────────────────────────

export async function getUserHistory(
  userId: string,
  limitCount: number = 10
): Promise<DailyProgress[]> {
  const q = query(
    collection(db, "userDailyProgress"),
    where("userId", "==", userId),
    orderBy("date", "desc"),
    firestoreLimit(limitCount)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyProgress);
}
