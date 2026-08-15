"use client";

import AdminGate from "@/components/AdminGate";
import ProductForm from "@/components/ProductForm";

export default function AddProductPage() {
  return <AdminGate>{(password) => <ProductForm mode="add" password={password} />}</AdminGate>;
}
