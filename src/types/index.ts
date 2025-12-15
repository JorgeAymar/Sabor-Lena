export type Role = 'ADMIN' | 'WAITER' | 'KITCHEN';
export type OrderStatus = 'PENDING' | 'COOKING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  createdAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  image?: string | null;
  description?: string | null;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  tableNumber: number;
  status: OrderStatus;
  total: number;
  items?: OrderItem[];
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unit: string;
  minStock: number;
}
