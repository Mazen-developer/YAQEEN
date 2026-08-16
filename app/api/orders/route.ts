import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders, getProducts } from "@/lib/db";
import { ADMIN_PASSWORD } from "@/lib/config";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const orders = await getOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, governorate, address, cart } = body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  }
  if (!phone || typeof phone !== "string" || !/^01[0125][0-9]{8}$/.test(phone)) {
    return NextResponse.json({ error: "رقم هاتف غير صالح" }, { status: 400 });
  }
  if (!governorate || typeof governorate !== "string") {
    return NextResponse.json({ error: "المحافظة مطلوبة" }, { status: 400 });
  }
  if (!address || typeof address !== "string" || !address.trim()) {
    return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
  }
  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
  }

  const products = await getProducts();
  const items = cart
    .map((line: { id: string; qty: number; color?: string; size?: string; type?: string }) => {
      const product = products.find((p) => p.id === line.id);
      if (!product || !line.qty || line.qty <= 0) return null;
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        qty: line.qty,
        color: line.color || undefined,
        size: line.size || undefined,
        type: line.type || undefined,
      };
    })
    .filter(Boolean) as {
    id: string;
    name: string;
    price: number;
    qty: number;
    color?: string;
    size?: string;
    type?: string;
  }[];

  if (items.length === 0) {
    return NextResponse.json({ error: "لا توجد منتجات صالحة في السلة" }, { status: 400 });
  }

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const order = await createOrder({
    name: name.trim(),
    phone: phone.trim(),
    governorate,
    address: address.trim(),
    items,
    total,
  });

  return NextResponse.json({ order }, { status: 201 });
}
