import fs from "fs/promises";
import path from "path";
import type { Product, Order } from "./types";

type DB = {
  products: Product[];
  orders: Order[];
};

const DB_PATH = path.join(process.cwd(), "data", "db.json");

async function ensureDb(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    const empty: DB = { products: [], orders: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf-8");
  }
}

async function readDb(): Promise<DB> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return { products: [], orders: [] };
  }
}

async function writeDb(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

/* ---------- products ---------- */

export async function getProducts(): Promise<Product[]> {
  const db = await readDb();
  return db.products.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getProduct(id: string): Promise<Product | null> {
  const db = await readDb();
  return db.products.find((p) => p.id === id) ?? null;
}

export async function createProduct(
  input: Omit<Product, "id" | "createdAt">
): Promise<Product> {
  const db = await readDb();
  const product: Product = {
    id: cryptoRandomId(),
    createdAt: Date.now(),
    ...input,
  };
  db.products.push(product);
  await writeDb(db);
  return product;
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<Product, "id" | "createdAt">>
): Promise<Product | null> {
  const db = await readDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...input };
  await writeDb(db);
  return db.products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await readDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  await writeDb(db);
  return db.products.length < before;
}

/* ---------- orders ---------- */

export async function getOrders(): Promise<Order[]> {
  const db = await readDb();
  return db.orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt">
): Promise<Order> {
  const db = await readDb();
  const order: Order = {
    id: cryptoRandomId(),
    createdAt: Date.now(),
    ...input,
  };
  db.orders.push(order);
  await writeDb(db);
  return order;
}

function cryptoRandomId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
