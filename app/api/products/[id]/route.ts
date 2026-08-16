import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, getProduct, updateProduct } from "@/lib/db";
import { ADMIN_PASSWORD } from "@/lib/config";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await getProduct(params.id);
  if (!product) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json();
  const { name, price, image, category, description, colors, sizes, types, stock, minOrderQty } =
    body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
  }
  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return NextResponse.json({ error: "سعر غير صالح" }, { status: 400 });
  }
  if (!category || typeof category !== "string" || !category.trim()) {
    return NextResponse.json({ error: "تصنيف المنتج مطلوب" }, { status: 400 });
  }
  if (!image || typeof image !== "string") {
    return NextResponse.json({ error: "صورة المنتج مطلوبة" }, { status: 400 });
  }

  const parsedStock = stock === undefined || stock === null || stock === "" ? undefined : Number(stock);
  const parsedMinQty =
    minOrderQty === undefined || minOrderQty === null || minOrderQty === ""
      ? undefined
      : Number(minOrderQty);

  const product = await updateProduct(params.id, {
    name: name.trim(),
    price: parsedPrice,
    category: category.trim(),
    description: typeof description === "string" ? description.trim() : "",
    image,
    colors: Array.isArray(colors) ? colors.filter(Boolean) : undefined,
    sizes: Array.isArray(sizes) ? sizes.filter(Boolean) : undefined,
    types: Array.isArray(types) ? types.filter(Boolean) : undefined,
    stock: Number.isFinite(parsedStock) ? parsedStock : undefined,
    minOrderQty: Number.isFinite(parsedMinQty) && parsedMinQty! > 0 ? parsedMinQty : 1,
  });
  if (!product) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const ok = await deleteProduct(params.id);
  if (!ok) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
