// Database types — manually defined to match Supabase schema
// Run `supabase gen types typescript` to auto-generate when connected

export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "paid"
  | "preparing"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  published_date: string | null;
  isbn: string | null;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  cover_image_url: string | null;
  category_id: string | null;
  page_count: number | null;
  average_rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  phone: string;
  zip_code: string;
  address: string;
  address_detail: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_address_detail: string | null;
  zip_code: string;
  payment_key: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  order_id: string;
  rating: number;
  content: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewLike {
  id: string;
  user_id: string;
  review_id: string;
  created_at: string;
}

// ===== Extended types with relations =====

export interface CartItemWithBook extends CartItem {
  book: Book;
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { book: Book })[];
}

export interface ReviewWithUser extends Review {
  user: Pick<User, "id" | "name">;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}
