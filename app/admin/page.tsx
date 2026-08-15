"use client";

import AdminGate from "@/components/AdminGate";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return <AdminGate>{(password) => <AdminDashboard password={password} />}</AdminGate>;
}
