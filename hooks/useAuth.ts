"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  createElement,
} from "react";
import type { ReactNode } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * 유저 식별 우선순위
 *
 * 1순위: 토스 SDK 유저 식별키
 *   - 게임 카테고리  → getUserKeyForGame()   (토스앱 5.232.0+)
 *   - 비게임 카테고리 → getAnonymousKey()     (SDK 2.4.5+)
 *   콘솔에 등록한 카테고리에 맞는 함수를 TOSS_USER_KEY_FN 에서 선택하세요.
 *
 * 2순위: Firebase 익명 로그인 (토스 SDK 미지원 환경 / 개발 환경 fallback)
 *
 * 두 경우 모두 userId → Firestore 문서 ID로 사용돼요.
 */

// ✏️ 콘솔에 등록한 미니앱 카테고리에 맞게 선택하세요
//   게임:   "game"
//   비게임: "non-game"
const MINI_APP_CATEGORY: "game" | "non-game" = "non-game";

const LS_KEY = "quiz_uid";

// ────────────────────────────────────────────────────────────
// 토스 SDK 유저 식별키 가져오기
// ────────────────────────────────────────────────────────────
async function getTossUserId(): Promise<string | null> {
  try {
    // @apps-in-toss/web-framework 동적 임포트 (서버 렌더링 방지)
    const sdk = await import("@apps-in-toss/web-framework");

    if (MINI_APP_CATEGORY === "game") {
      const key = await sdk.getUserKeyForGame();
      return key ?? null;
    } else {
      const key = await sdk.getAnonymousKey();
      return key ?? null;
    }
  } catch {
    // 패키지 미설치 / 미지원 환경 → null 반환 후 Firebase fallback
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────────────────
interface AuthContextType {
  userId: string | null;
  loading: boolean;
  /** "toss" | "firebase" | null — 어떤 방식으로 식별됐는지 */
  authSource: "toss" | "firebase" | null;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  loading: true,
  authSource: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

// ────────────────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => {
    // SSR 안전: 캐시된 ID 즉시 표시 (로딩 깜빡임 방지)
    if (typeof window !== "undefined") {
      return localStorage.getItem(LS_KEY);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [authSource, setAuthSource] = useState<"toss" | "firebase" | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function identify() {
      // 1순위: 토스 SDK 유저 식별키
      const tossKey = await getTossUserId();

      if (!cancelled && tossKey) {
        localStorage.setItem(LS_KEY, tossKey);
        setUserId(tossKey);
        setAuthSource("toss");
        setLoading(false);
        return;
      }

      if (cancelled) return;

      // 2순위: Firebase 익명 로그인 (개발 환경 / 토스 SDK 미지원)
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (cancelled) return;

        if (user) {
          localStorage.setItem(LS_KEY, user.uid);
          setUserId(user.uid);
          setAuthSource("firebase");
          setLoading(false);
        } else {
          try {
            const result = await signInAnonymously(auth);
            if (!cancelled) {
              localStorage.setItem(LS_KEY, result.user.uid);
              setUserId(result.user.uid);
              setAuthSource("firebase");
            }
          } catch (error) {
            console.error("[Auth] Firebase 익명 로그인 실패:", error);
          } finally {
            if (!cancelled) setLoading(false);
          }
        }
      });

      // 토스 SDK fallback 경로에서는 Firebase unsubscribe 정리
      return unsubscribe;
    }

    const cleanupPromise = identify();

    return () => {
      cancelled = true;
      // Firebase unsubscribe가 있다면 정리
      cleanupPromise.then((unsub) => unsub?.());
    };
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { userId, loading, authSource } },
    children
  );
}
