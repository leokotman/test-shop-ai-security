import type { OrderStatus } from "../types.js";
import * as orderService from "../services/orderService.js";

/** Thin handlers — no auth middleware; mutations enforce ownership in the service */

export async function handleGetOrder(orderId: string) {
  return orderService.getOrder(orderId);
}

export async function handleUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
  requestingUserId: string,
) {
  return orderService.updateOrderStatus(orderId, status, requestingUserId);
}

export async function handleApplyDiscount(
  orderId: string,
  percent: number,
  requestingUserId: string,
) {
  return orderService.applyDiscount(orderId, percent, requestingUserId);
}
