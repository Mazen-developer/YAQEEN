"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminGate from "@/components/AdminGate";
import ProductForm from "@/components/ProductForm";
import type { Product } from "@/lib/types";

function EditLoader({ password }: { password: string }) {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProduct(d?.product ?? null));
  }, [params.id]);

  if (product === undefined) {
    return <div className="py-16 text-center text-neutral-500">جارٍ التحميل...</div>;
  }
  if (product === null) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-16 text-center text-neutral-600">
        المنتج غير موجود
      </div>
    );
  }
  return <ProductForm mode="edit" password={password} product={product} />;
}

export default function EditProductPage() {
  return <AdminGate>{(password) => <EditLoader password={password} />}</AdminGate>;
}
