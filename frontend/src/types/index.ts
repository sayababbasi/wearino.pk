export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color?: string;
  sku?: string;
  stock: number;
  priceAdjustment?: number;
  isActive: boolean;
}

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images: string[];
  category_id: string;
  category_name: string;
  rating: number;
  tags: string[];
  stock?: number;
  discount?: number;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  sizes?: string[];
  colors?: string[];
}

export interface Category {
  category_id: string;
  name: string;
  description: string;
  image?: string;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

export interface Favorite {
  fav_id: string;
  user_id: string;
  product_id: string;
  product?: Product;
}

export interface Inquiry {
  inquiry_id: string;
  user_id: string;
  product_id?: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  inquiry_id: string;
  chat_id: string;
  user_id?: string;
  product_id?: string;
  message: string;
  bot_reply: string;
  timestamp: string;
}

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  search?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}
