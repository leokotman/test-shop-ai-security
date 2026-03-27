import { beforeEach, describe, expect, it } from "vitest";
import { UnauthorizedError } from "../src/errors.js";
import { resetDemoData } from "../src/db.js";
import {
  applyDiscount,
  getOrder,
  updateOrderStatus,
} from "../src/services/orderService.js";

describe("orderService", () => {
  beforeEach(() => {
    resetDemoData();
  });

  it("returns an order by id (happy path)", async () => {
    const order = await getOrder("order-1");
    expect(order.id).toBe("order-1");
    expect(order.userId).toBe("user-1");
  });

  it("updates order status", async () => {
    const updated = await updateOrderStatus("order-1", "paid");
    expect(updated.status).toBe("paid");
  });

  it("applyDiscount updates total and discountPercent for owner", async () => {
    const updated = await applyDiscount("user-1", "order-1", 10);
    expect(updated.discountPercent).toBe(10);
    expect(updated.totalCents).toBe(Math.round(4999 * 0.9));
  });

  it("applyDiscount rejects non-owner", async () => {
    await expect(applyDiscount("user-1", "order-2", 5)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
