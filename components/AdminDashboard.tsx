"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { categoryOf } from "@/lib/categories";
import { useAdminPassword } from "@/lib/useAdminPassword";
import type { Order, Product } from "@/lib/types";

export default function AdminDashboard({ password }: { password: string }) {
  const { clearPassword } = useAdminPassword();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  async function loadAll() {
    const [ordersRes, productsRes] = await Promise.all([
      fetch("/api/orders", { headers: { "x-admin-password": password } }),
      fetch("/api/products"),
    ]);
    if (ordersRes.status === 401) {
      clearPassword();
      return;
    }
    const ordersData = await ordersRes.json();
    const productsData = await productsRes.json();
    setOrders(ordersData.orders ?? []);
    setProducts(productsData.products ?? []);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج نهائيًا؟")) return;
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setProducts((prev) => prev?.filter((p) => p.id !== id) ?? null);
    }
  }

  if (orders === null || products === null) {
    return <div className="py-16 text-center text-neutral-500">جارٍ تحميل بيانات الإدارة...</div>;
  }

  return (
    <div>
      <div className="mb-2 text-center">
        <h2 className="font-display text-4xl text-black">لوحة الإدارة</h2>
        <div className="mx-auto my-3.5 h-[3px] w-16 rounded bg-black" />
      </div>

      <div className="mt-8 mb-3.5 flex items-center justify-between">
        <h2 className="font-display text-2xl text-black">الطلبات</h2>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-10 text-center text-neutral-600">
          لا يوجد طلبات حتى الآن
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line shadow-sm">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-3.5 py-3 text-right font-bold">اسم العميل</th>
                <th className="px-3.5 py-3 text-right font-bold">رقم الهاتف</th>
                <th className="px-3.5 py-3 text-right font-bold">المحافظة</th>
                <th className="px-3.5 py-3 text-right font-bold">العنوان</th>
                <th className="px-3.5 py-3 text-right font-bold">المنتجات المشتراة</th>
                <th className="px-3.5 py-3 text-right font-bold">تاريخ الطلب</th>
                <th className="px-3.5 py-3 text-right font-bold">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-black/[0.04]">
                  <td className="px-3.5 py-3 align-top">{o.name}</td>
                  <td className="px-3.5 py-3 align-top">{o.phone}</td>
                  <td className="px-3.5 py-3 align-top">{o.governorate}</td>
                  <td className="px-3.5 py-3 align-top">{o.address}</td>
                  <td className="px-3.5 py-3 align-top">
                    {o.items.map((it) => (
                      <span
                        key={it.id}
                        className="mb-1 ml-1 inline-block rounded-full bg-black/[0.06] px-2.5 py-0.5 text-xs"
                      >
                        {it.name} × {it.qty}
                      </span>
                    ))}
                  </td>
                  <td className="px-3.5 py-3 align-top">
                    {new Date(o.createdAt).toLocaleString("ar-EG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-3.5 py-3 align-top font-black">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 mb-3.5 flex items-center justify-between">
        <h2 className="font-display text-2xl text-black">المنتجات</h2>
        <Link
          href="/admin/add"
          className="rounded-lg bg-black px-4.5 py-2 text-sm font-bold text-white transition hover:bg-neutral-800"
        >
          + إضافة منتج
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-10 text-center text-neutral-600">
          لا يوجد منتجات، ابدأ بإضافة منتج جديد
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {products.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
              <div className="p-2.5">
                <h4 className="mb-1 text-sm font-bold">{p.name}</h4>
                <span className="mb-1.5 mr-1 inline-block rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-bold text-neutral-600">
                  {categoryOf(p.category)}
                </span>
                <span className="-rotate-2 inline-block rounded-l-sm rounded-r-lg border-[1.5px] border-dashed border-black/55 bg-white px-3 py-1 text-xs font-black">
                  {formatPrice(p.price)}
                </span>
                <div className="mt-2 flex gap-1.5">
                  <Link
                    href={`/admin/edit/${p.id}`}
                    className="flex-1 rounded-lg border-[1.5px] border-line px-2 py-1.5 text-center text-xs font-bold transition hover:border-black"
                  >
                    تعديل
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex-1 rounded-lg border-[1.5px] border-black px-2 py-1.5 text-xs font-bold transition hover:bg-black hover:text-white"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
