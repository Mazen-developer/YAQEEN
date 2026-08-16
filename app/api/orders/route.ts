import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders, getProducts } from "@/lib/db";
import { ADMIN_PASSWORD } from "@/lib/config";
import type { OrderItem, SelectedVariant } from "@/lib/types";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const orders = await getOrders();
  return NextResponse.json({ orders });
}

function parseVariant(raw: unknown): SelectedVariant | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const v = raw as Record<string, unknown>;
  const variant: SelectedVariant = {};
  if (typeof v.color === "string" && v.color.trim()) variant.color = v.color.trim();
  if (typeof v.size === "string" && v.size.trim()) variant.size = v.size.trim();
  if (typeof v.type === "string" && v.type.trim()) variant.type = v.type.trim();
  return Object.keys(variant).length ? variant : undefined;
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

  for (const line of cart as { id: string; qty: number }[]) {
    const product = products.find((p) => p.id === line.id);
    if (!product) continue;
    const minQuantity = Math.max(1, product.options?.minQuantity ?? 1);
    if (!line.qty || line.qty < minQuantity) {
      return NextResponse.json(
        { error: `أقل كمية مسموحة لمنتج "${product.name}" هي ${minQuantity}` },
        { status: 400 }
      );
    }
  }

  const items = cart
    .map((line: { id: string; qty: number; variant?: unknown }) => {
      const product = products.find((p) => p.id === line.id);
      if (!product || !line.qty || line.qty <= 0) return null;
      const item: OrderItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        qty: line.qty,
        variant: parseVariant(line.variant),
      };
      return item;
    })
    .filter(Boolean) as OrderItem[];

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
