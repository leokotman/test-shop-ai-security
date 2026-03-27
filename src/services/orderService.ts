import { db } from "../db.js";
import { UnauthorizedError } from "../errors.js";
import type { Order, OrderStatus } from "../types.js";

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

/**
 * Applies a percent discount to the order total (updates `totalCents` and `discountPercent`).
 * `percent` is the amount off (e.g. 10 = 10% off the current total).
 */
export async function applyDiscount(
  requestingUserId: string,
  orderId: string,
  percent: number,
): Promise<Order> {
  const order = await db.orders.findById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }
  if (order.userId !== requestingUserId) {
    throw new UnauthorizedError();
  }
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error("percent must be a number from 0 to 100");
  }
  const totalCents = Math.round((order.totalCents * (100 - percent)) / 100);
  return await db.orders.update(orderId, {
    totalCents,
    discountPercent: percent,
  });
}
