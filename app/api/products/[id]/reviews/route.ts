import { NextRequest, NextResponse } from "next/server";
import { addReview, getProduct, getReviews } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const reviews = await getReviews(params.id);
  return NextResponse.json({ reviews });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await getProduct(params.id);
  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  const body = await req.json();
  const { userId, userName, rating, comment } = body ?? {};

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "تعذر التعرف على المستخدم" }, { status: 400 });
  }
  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return NextResponse.json({ error: "من فضلك اختر تقييمًا من 1 إلى 5 نجوم" }, { status: 400 });
  }
  if (!comment || typeof comment !== "string" || !comment.trim()) {
    return NextResponse.json({ error: "من فضلك اكتب تعليقًا عن المنتج" }, { status: 400 });
  }
  if (comment.trim().length > 1000) {
    return NextResponse.json({ error: "التعليق طويل جدًا" }, { status: 400 });
  }

  const review = await addReview({
    productId: params.id,
    userId: userId.trim(),
    userName: typeof userName === "string" && userName.trim() ? userName.trim() : "مستخدم",
    rating: parsedRating,
    comment: comment.trim(),
  });

  return NextResponse.json({ review }, { status: 201 });
}
