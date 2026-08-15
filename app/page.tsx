import { getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="">
      <div className="mb-8 text-center ">
        <h2 className="font-display text-4xl text-black">أهلاً بيك في YAQEEN</h2>
        <div className="mx-auto my-3.5 h-[3px] w-16 rounded bg-black" />
        <p className="text-sm text-neutral-600">
          منتجات مختارة بعناية — اطلب دلوقتي وهيوصلك
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-16 text-center text-neutral-600">
          <div className="mb-1 font-display text-2xl text-black">الرفوف لسه فاضية</div>

        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
