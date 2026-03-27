import type { Order, User } from "./types.js";

const orders = new Map<string, Order>();
const users = new Map<string, User>();

function seed(): void {
  orders.clear();
  users.clear();

  users.set("user-1", { id: "user-1", email: "alice@internal.example" });
  users.set("user-2", { id: "user-2", email: "bob@internal.example" });

  orders.set("order-1", {
    id: "order-1",
    userId: "user-1",
    status: "pending",
    totalCents: 4999,
  });

  orders.set("order-2", {
    id: "order-2",
    userId: "user-2",
    status: "paid",
    totalCents: 12000,
  });
}

seed();

/** Reset demo data (e.g. from tests). */
export function resetDemoData(): void {
  seed();
}

/** Tiny in-memory stand-in for a real database — demo only */
export const db = {
  orders: {
    listAll: async (): Promise<Order[]> => [...orders.values()],

    findById: async (orderId: string): Promise<Order | undefined> =>
      orders.get(orderId),

    update: async (
      orderId: string,
      patch: Partial<Omit<Order, "id">>
    ): Promise<Order> => {
      const existing = orders.get(orderId);
      if (!existing) {
        throw new Error(`Order not found: ${orderId}`);
      }
      const next: Order = { ...existing, ...patch };
      orders.set(orderId, next);
      return next;
    },
  },

  users: {
    findById: async (userId: string): Promise<User | undefined> =>
      users.get(userId),
  },
};
