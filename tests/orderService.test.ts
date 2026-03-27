import { beforeEach, describe, expect, it } from "vitest";
import { resetDemoData } from "../src/db.js";
import { UnauthorizedError } from "../src/errors.js";
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

  it("updates order status when the requesting user owns the order", async () => {
    const updated = await updateOrderStatus("order-1", "paid", "user-1");
    expect(updated.status).toBe("paid");
  });

  it("rejects status update when the requesting user does not own the order", async () => {
    await expect(
      updateOrderStatus("order-1", "paid", "user-2"),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("applies discount when the requesting user owns the order", async () => {
    const updated = await applyDiscount("order-1", 10, "user-1");
    expect(updated.discountPercent).toBe(10);
    expect(updated.totalCents).toBe(4499);
  });

  it("rejects discount when the requesting user does not own the order", async () => {
    await expect(applyDiscount("order-1", 10, "user-2")).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("rejects invalid discount percent", async () => {
    await expect(applyDiscount("order-1", -1, "user-1")).rejects.toThrow(
      "Invalid discount percent",
    );
    await expect(applyDiscount("order-1", 101, "user-1")).rejects.toThrow(
      "Invalid discount percent",
    );
  });
});
