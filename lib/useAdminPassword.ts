"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "saffi-admin-pass";

export function useAdminPassword() {
  const [password, setPasswordState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPasswordState(window.localStorage.getItem(STORAGE_KEY));
    setHydrated(true);
  }, []);

  const setPassword = useCallback((value: string) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setPasswordState(value);
  }, []);

  const clearPassword = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setPasswordState(null);
  }, []);

  return { password, hydrated, setPassword, clearPassword };
}
