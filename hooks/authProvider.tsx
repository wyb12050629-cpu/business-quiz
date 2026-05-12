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

// ✏️ 콘솔에 등록한 미니앱 카테고리에 맞게 선택하세요
//   게임:   "game"
//   비게임: "non-game"
const MINI_APP_CATEGORY: "game" | "non-game" = "non-game";

const LS_KEY = "quiz_uid";

async function getTossUserId(): Promise<string | null> {
  // 타임아웃을 import 전에 시작 — 토스앱 외부 환경 무한 대기 방지
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 3000)
  );

  const keyPromise = import("@apps-in-toss/web-framework")
    .then(async (sdk) => {
      // 실제 패키지 반환 타입: string | GetAnonymousKeySuccessResponse | "INVALID_CATEGORY" | "ERROR" | undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await (MINI_APP_CATEGORY === "game"
        ? sdk.getUserKeyForGame()
        : sdk.getAnonymousKey());

      if (!response || response === "INVALID_CATEGORY" || response === "ERROR") return null;
      if (typeof response === "string") return response;
      // GetAnonymousKeySuccessResponse 객체인 경우 key 필드 추출
      return (response as Record<string, string>)?.key ?? null;
    })
    .catch((): null => null);

  return Promise.race([keyPromise, timeout]);
}

interface AuthContextType {
  userId: string | null;
  loading: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => {
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
      const tossKey = await getTossUserId();

      if (!cancelled && tossKey) {
        localStorage.setItem(LS_KEY, tossKey);
        setUserId(tossKey);
        setAuthSource("toss");
        setLoading(false);
        return;
      }

      if (cancelled) return;

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
            // Toss SDK, Firebase 모두 실패 → 로컬 UUID 폴백 (앱이 멈추지 않도록)
            if (!cancelled) {
              const existing = localStorage.getItem(LS_KEY);
              const fallbackId =
                existing ||
                `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
              localStorage.setItem(LS_KEY, fallbackId);
              setUserId(fallbackId);
              setAuthSource("firebase");
            }
          } finally {
            if (!cancelled) setLoading(false);
          }
        }
      });

      return unsubscribe;
    }

    const cleanupPromise = identify();

    return () => {
      cancelled = true;
      cleanupPromise.then((unsub) => unsub?.());
    };
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { userId, loading, authSource } },
    children
  );
}
