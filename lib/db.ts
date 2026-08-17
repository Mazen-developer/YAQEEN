import { Redis } from "@upstash/redis";
import fs from "fs/promises";
import path from "path";
import type { Order, Product, ProductOptions, Review } from "./types";
import { parseProductOptions } from "./productOptions";

/**
 * تخزين البيانات:
 * - لو متغيرات البيئة UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN موجودة،
 *   البيانات بتتخزن في Upstash Redis (سحابي، مشترك بين كل الأجهزة والزيارات).
 * - لو مش موجودة (زي أول تشغيل محلي على جهازك)، بيرجع تلقائيًا للتخزين في
 *   ملف data/db.json على السيرفر (يشتغل بس للتجربة المحلية، مش على Vercel).
 *
 * راجع README.md لخطوات تفعيل Redis (٥ دقائق، مجاني).
 */

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    })
  : null;

/* ---------- fallback: local JSON file (للتجربة المحلية فقط) ---------- */

const DB_PATH = path.join(process.cwd(), "data", "db.json");

type LocalDB = { products: Product[]; orders: Order[]; reviews: Review[] };

async function ensureLocalDb(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    const empty: LocalDB = { products: [], orders: [], reviews: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf-8");
  }
}

async function readLocalDb(): Promise<LocalDB> {
  await ensureLocalDb();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    };
  } catch {
    return { products: [], orders: [], reviews: [] };
  }
}

async function writeLocalDb(db: LocalDB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function cryptoRandomId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/* ---------- helpers ---------- */

export const DEFAULT_PRODUCT_OPTIONS: ProductOptions = {
  list: [],
  variants: [],
  minQuantity: 1,
};

/** بيتحقق من شكل الـ options ويهاجر أي شكل قديم (colors/sizes/types) تلقائيًا،
 *  وكمان بيضمن وجود مصفوفة images (بيهاجر المنتجات القديمة اللي كانت بصورة واحدة بس) */
function normalizeProduct(product: Product): Product {
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
  return {
    ...product,
    image: images[0] ?? product.image,
    images,
    options: parseProductOptions(product.options),
  };
}

/* ---------- products ---------- */

export async function getProducts(): Promise<Product[]> {
  if (redis) {
    const ids = (await redis.smembers("products:index")) as string[];
    if (!ids.length) return [];
    const products = await Promise.all(
      ids.map((id) => redis.get<Product>(`product:${id}`))
    );
    return products
      .filter((p): p is Product => !!p)
      .map(normalizeProduct)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  const db = await readLocalDb();
  return db.products.map(normalizeProduct).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getProduct(id: string): Promise<Product | null> {
  if (redis) {
    const product = (await redis.get<Product>(`product:${id}`)) ?? null;
    return product ? normalizeProduct(product) : null;
  }
  const db = await readLocalDb();
  const product = db.products.find((p) => p.id === id) ?? null;
  return product ? normalizeProduct(product) : null;
}

export async function createProduct(
  input: Omit<Product, "id" | "createdAt">
): Promise<Product> {
  const product: Product = normalizeProduct({
    id: cryptoRandomId(),
    createdAt: Date.now(),
    ...input,
  });

  if (redis) {
    await redis.set(`product:${product.id}`, product);
    await redis.sadd("products:index", product.id);
    return product;
  }

  const db = await readLocalDb();
  db.products.push(product);
  await writeLocalDb(db);
  return product;
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<Product, "id" | "createdAt">>
): Promise<Product | null> {
  if (redis) {
    const existing = await redis.get<Product>(`product:${id}`);
    if (!existing) return null;
    const updated = normalizeProduct({ ...existing, ...input });
    await redis.set(`product:${id}`, updated);
    return updated;
  }

  const db = await readLocalDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = normalizeProduct({ ...db.products[idx], ...input });
  await writeLocalDb(db);
  return db.products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (redis) {
    const existing = await redis.get<Product>(`product:${id}`);
    if (!existing) return false;
    await redis.del(`product:${id}`);
    await redis.srem("products:index", id);
    return true;
  }

  const db = await readLocalDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  await writeLocalDb(db);
  return db.products.length < before;
}

/* ---------- orders ---------- */

export async function getOrders(): Promise<Order[]> {
  if (redis) {
    const ids = (await redis.smembers("orders:index")) as string[];
    if (!ids.length) return [];
    const orders = await Promise.all(
      ids.map((id) => redis.get<Order>(`order:${id}`))
    );
    return orders
      .filter((o): o is Order => !!o)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  const db = await readLocalDb();
  return db.orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt">
): Promise<Order> {
  const order: Order = {
    id: cryptoRandomId(),
    createdAt: Date.now(),
    ...input,
  };

  if (redis) {
    await redis.set(`order:${order.id}`, order);
    await redis.sadd("orders:index", order.id);
    return order;
  }

  const db = await readLocalDb();
  db.orders.push(order);
  await writeLocalDb(db);
  return order;
}

/* ---------- reviews ---------- */

export async function getReviews(productId: string): Promise<Review[]> {
  if (redis) {
    const ids = (await redis.smembers(`reviews:index:${productId}`)) as string[];
    if (!ids.length) return [];
    const reviews = await Promise.all(
      ids.map((id) => redis.get<Review>(`review:${id}`))
    );
    return reviews
      .filter((r): r is Review => !!r)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  const db = await readLocalDb();
  return db.reviews
    .filter((r) => r.productId === productId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function addReview(
  input: Omit<Review, "id" | "createdAt">
): Promise<Review> {
  const review: Review = {
    id: cryptoRandomId(),
    createdAt: Date.now(),
    ...input,
  };

  if (redis) {
    await redis.set(`review:${review.id}`, review);
    await redis.sadd(`reviews:index:${review.productId}`, review.id);
    return review;
  }

  const db = await readLocalDb();
  db.reviews.push(review);
  await writeLocalDb(db);
  return review;
}
