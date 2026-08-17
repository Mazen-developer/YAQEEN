import { getProducts } from "@/lib/db";
import ProductsSection from "@/components/ProductsSection";
import TestimonialsSwiper from "@/components/TestimonialsSwiper";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div>
      <section className="relative left-1/2 right-1/2 -mx-[50vw] -mt-8 h-screen w-screen overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.jpg"
          alt="ركن هادئ في البيت بديكور دافئ"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="font-display text-5xl drop-shadow-md sm:text-6xl">أهلاً بيك في YAQEEN</h2>
          <div className="my-4 h-[3px] w-16 rounded bg-white" />
          <p className="max-w-md text-sm text-white/90 sm:text-base">
            منتجات مختارة بعناية — اطلب دلوقتي وهيوصلك لحد باب البيت
          </p>
          <a
            href="#products"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-black text-brand-700 transition hover:bg-brand-50"
          >
            ابدأ التسوق 🛍️
          </a>
        </div>
      </section>

      <div id="products" className="scroll-mt-24 pt-10">
        <ProductsSection products={products} />
      </div>

      <TestimonialsSwiper />
    </div>
  );
}
