import { NextRequest, NextResponse } from "next/server";
import { createProduct, getProducts } from "@/lib/db";
import { ADMIN_PASSWORD } from "@/lib/config";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json();
  const { name, price, image, category, description } = body ?? {};

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
  if (!image || typeof image !== "string" || !image.startsWith("data:image")) {
    return NextResponse.json({ error: "صورة المنتج مطلوبة" }, { status: 400 });
  }

  const product = await createProduct({
    name: name.trim(),
    price: parsedPrice,
    category: category.trim(),
    description: typeof description === "string" ? description.trim() : "",
    image,
  });
  return NextResponse.json({ product }, { status: 201 });
}
