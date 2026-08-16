import { NextRequest, NextResponse } from "next/server";
import { addReview, getProduct, getReviews } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const reviews = await getReviews(params.id);
  const average =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  return NextResponse.json({ reviews, average, count: reviews.length });
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
  const { rating, comment, name } = body ?? {};

  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return NextResponse.json({ error: "التقييم يجب أن يكون من 1 إلى 5 نجوم" }, { status: 400 });
  }
  if (!comment || typeof comment !== "string" || !comment.trim()) {
    return NextResponse.json({ error: "من فضلك اكتب تعليقك" }, { status: 400 });
  }

  const review = await addReview({
    productId: params.id,
    rating: parsedRating,
    comment: comment.trim().slice(0, 600),
    name: typeof name === "string" && name.trim() ? name.trim().slice(0, 60) : undefined,
  });

  return NextResponse.json({ review }, { status: 201 });
}
