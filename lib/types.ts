export type Product = {
  id: string;
  name: string;
  price: number;
  image: string; // data URL (base64)
  category?: string;
  createdAt: number;
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
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
  id: string;
  qty: number;
};
