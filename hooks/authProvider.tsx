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
  try {
    const sdk = await import("@apps-in-toss/web-framework");
    if (MINI_APP_CATEGORY === "game") {
      const key = await sdk.getUserKeyForGame();
      return key ?? null;
    } else {
      const key = await sdk.getAnonymousKey();
      return key ?? null;
    }
  } catch {
    return null;
  }
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
