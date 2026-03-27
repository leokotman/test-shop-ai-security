import { db } from "../db.js";
import type { Order, OrderStatus } from "../types.js";

// Existing functions — no ownership or caller checks, just CRUD-style access.

export async function listOrders(): Promise<Order[]> {
  return await db.orders.listAll();
}

export async function getOrder(orderId: string): Promise<Order> {
  const order = await db.orders.findById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  return await db.orders.update(orderId, { status });
}
