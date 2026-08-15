// تصنيفات مقترحة تظهر كاقتراحات عند إضافة منتج جديد
// (الأدمن ممكن يكتب أي تصنيف تاني برضو)
export const SUGGESTED_CATEGORIES = [
  "إلكترونيات",
  "أدوات منزلية",
  "مطبخ",
  "إكسسوارات",
  "ملابس",
  "عناية شخصية",
  "ألعاب",
  "أخرى",
];

export const DEFAULT_CATEGORY = "عام";

export function categoryOf(category?: string | null): string {
  const trimmed = (category ?? "").trim();
  return trimmed || DEFAULT_CATEGORY;
}
