import { db } from "../db.js";
import { UnauthorizedError } from "../errors.js";
import type { Order, OrderStatus } from "../types.js";

// Reads are open; status/discount mutations require the caller to own the order.

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

async function requireOrderOwnership(
  orderId: string,
  requestingUserId: string,
): Promise<Order> {
  const order = await getOrder(orderId);
  if (order.userId !== requestingUserId) {
    throw new UnauthorizedError();
  }
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  requestingUserId: string,
): Promise<Order> {
  await requireOrderOwnership(orderId, requestingUserId);
  return await db.orders.update(orderId, { status });
}

export async function applyDiscount(
  orderId: string,
  percent: number,
  requestingUserId: string,
): Promise<Order> {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error(
      `Invalid discount percent: expected 0–100, got ${String(percent)}`,
    );
  }
  const order = await requireOrderOwnership(orderId, requestingUserId);
  const newTotalCents = Math.round(order.totalCents * (1 - percent / 100));
  return await db.orders.update(orderId, {
    totalCents: newTotalCents,
    discountPercent: percent,
  });
}
