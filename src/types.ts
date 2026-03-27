export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  /** Order total in cents (after `applyDiscount`, reflects the discount) */
  totalCents: number;
  discountPercent?: number;
}

export interface User {
  id: string;
  email: string;
}
