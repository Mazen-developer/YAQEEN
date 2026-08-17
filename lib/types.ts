/** قيمة واحدة داخل Option (مثال: "أحمر" داخل Option "اللون") */
export type ProductOptionValue = {
  /** نص القيمة، لازم يكون فريد داخل نفس الـ Option */
  value: string;
  /** كود لون اختياري (لعرض دائرة اللون) — مفيد لأي Option، مش بس الألوان */
  hex?: string;
};

/** Option واحد قابل للتعريف من الأدمن (اللون، الحجم، النوع، أو أي اسم آخر) */
export type ProductOption = {
  /** اسم الـ Option، لازم يكون فريد داخل نفس المنتج */
  name: string;
  values: ProductOptionValue[];
};

/** تركيبة مختارة: اسم كل Option -> القيمة المختارة منه */
export type VariantCombination = Record<string, string>;

/** سعر خاص بتركيبة معينة من الـ Options (Variant) */
export type ProductVariant = {
  combination: VariantCombination;
  /** لو undefined أو null، السعر بيرجع لسعر المنتج الأساسي */
  price?: number;
};

export type ProductOptions = {
  list: ProductOption[];
  variants: ProductVariant[];
  minQuantity: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string; // data URL (base64)
  category?: string;
  description?: string;
  createdAt: number;
  options?: ProductOptions;
};

/** التركيبة اللي بيختارها العميل في صفحة المنتج */
export type SelectedVariant = VariantCombination;

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  variant?: SelectedVariant;
};

export type Order = {
  id: string;
  name: string;
  phone: string;
  governorate: string;
  address: string;
  items: OrderItem[];
  total: number;
  createdAt: number;
};

export type CartLine = {
  /** unique per product+variant combination */
  lineId: string;
  /** the underlying product id */
  id: string;
  qty: number;
  variant?: SelectedVariant;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: number;
};
