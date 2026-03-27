import { beforeEach, describe, expect, it } from "vitest";
import { resetDemoData } from "../src/db.js";
import { getOrder, updateOrderStatus } from "../src/services/orderService.js";

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
});
