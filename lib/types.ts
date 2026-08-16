export type Product = {
  id: string;
  name: string;
  price: number;
  image: string; // data URL (base64)
  category?: string;
  description?: string;
  createdAt: number;
  colors?: string[];
  sizes?: string[];
  types?: string[];
  stock?: number; // العدد المتاح
  minOrderQty?: number; // أقل عدد يمكن طلبه
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  color?: string;
  size?: string;
  type?: string;
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
  lineKey: string;
  id: string;
  qty: number;
  color?: string;
  size?: string;
  type?: string;
};

export type Review = {
  id: string;
  productId: string;
  rating: number; // 1 - 5
  comment: string;
  name?: string;
  createdAt: number;
};
