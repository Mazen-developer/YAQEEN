export type ColorOption = {
  name: string;
  hex?: string;
};

export type ProductOptions = {
  colors: ColorOption[];
  sizes: string[];
  types: string[];
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

export type SelectedVariant = {
  color?: string;
  size?: string;
  type?: string;
};

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
