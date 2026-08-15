import Link from "next/link";
import { getProduct } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { categoryOf } from "@/lib/categories";
import ProductActions from "@/components/ProductActions";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-16 text-center text-neutral-600">
        <div className="mb-1 font-display text-2xl text-black">المنتج غير موجود</div>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-block text-sm font-bold text-neutral-600 transition hover:text-black"
      >
        → الرجوع للمنتجات
      </Link>

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-3.5">
          <span className="self-start rounded-full bg-black/[0.06] px-3 py-1 text-xs font-bold text-neutral-600">
            {categoryOf(product.category)}
          </span>

          <h1 className="font-display text-3xl text-black">{product.name}</h1>

          <span className="relative -rotate-2 self-start rounded-l-sm rounded-r-lg border-[1.5px] border-dashed border-black/55 bg-white px-4 py-2 text-lg font-black">
            {formatPrice(product.price)}
          </span>

          <div className="mt-2 border-t border-line pt-4">
            <h2 className="mb-2 text-sm font-bold text-black">الوصف</h2>
            {product.description ? (
              <p className="whitespace-pre-line leading-relaxed text-neutral-700">
                {product.description}
              </p>
            ) : (
              <p className="text-sm text-neutral-500">لا يوجد وصف لهذا المنتج حاليًا.</p>
            )}
          </div>

          <ProductActions productId={product.id} />
        </div>
      </div>
    </div>
  );
}
