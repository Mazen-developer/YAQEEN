"use client";

import { useCallback, useEffect, useState } from "react";

const ID_KEY = "saffi-reviewer-id";
const NAME_KEY = "saffi-reviewer-name";

function randomId(): string {
  return "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/** يربط كل تقييم بمستخدم ثابت (id مخزّن في المتصفح) حتى بدون نظام تسجيل دخول */
export function useReviewer() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserNameState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let id = window.localStorage.getItem(ID_KEY);
    if (!id) {
      id = randomId();
      window.localStorage.setItem(ID_KEY, id);
    }
    setUserId(id);
    setUserNameState(window.localStorage.getItem(NAME_KEY) ?? "");
    setHydrated(true);
  }, []);

  const setUserName = useCallback((name: string) => {
    window.localStorage.setItem(NAME_KEY, name);
    setUserNameState(name);
  }, []);

  return { userId, userName, setUserName, hydrated };
}
