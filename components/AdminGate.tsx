"use client";

import { useState } from "react";
import { useAdminPassword } from "@/lib/useAdminPassword";

export default function AdminGate({
  children,
}: {
  children: (password: string) => React.ReactNode;
}) {
  const { password, hydrated, setPassword } = useAdminPassword();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setChecking(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input }),
      });
      if (res.ok) {
        setPassword(input);
      } else {
        setError("كلمة المرور غير صحيحة");
        setInput("");
      }
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setChecking(false);
    }
  }

  if (!hydrated) {
    return <div className="py-16 text-center text-neutral-500">جارٍ التحميل...</div>;
  }

  if (!password) {
    return (
      <div className="mx-auto max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-2xl text-black">دخول الإدارة</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-1.5 text-sm font-bold">كلمة المرور</label>
          <input
            type="password"
            required
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="••••••"
            className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
          />
          {error && <div className="mt-1.5 text-xs font-bold text-black">{error}</div>}
          <button
            type="submit"
            disabled={checking}
            className="mt-5 rounded-lg bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {checking ? "جارٍ التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    );
  }

  return <>{children(password)}</>;
}
