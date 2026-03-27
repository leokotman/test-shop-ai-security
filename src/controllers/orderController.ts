import type { Order, OrderStatus } from "../types.js";
import * as orderService from "../services/orderService.js";

/** Thin handlers — no auth middleware; applyDiscount enforces ownership */

export async function handleGetOrder(orderId: string) {
  return orderService.getOrder(orderId);
}

export async function handleUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
) {
  return orderService.updateOrderStatus(orderId, status);
}

export async function handleApplyDiscount(
  requestingUserId: string,
  orderId: string,
  percent: number,
): Promise<Order> {
  return orderService.applyDiscount(requestingUserId, orderId, percent);
}
