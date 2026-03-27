import path from "node:path";
import { fileURLToPath } from "node:url";

import express, { type Request, type Response } from "express";

import type { OrderStatus } from "./types.js";
import * as orderService from "./services/orderService.js";
import * as userService from "./services/userService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const app = express();
app.use(express.json());

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "shipped",
  "cancelled",
];

function isOrderStatus(v: unknown): v is OrderStatus {
  return typeof v === "string" && ORDER_STATUSES.includes(v as OrderStatus);
}

function oneParam(v: string | string[] | undefined): string {
  if (v == null) {
    return "";
  }
  return Array.isArray(v) ? v[0]! : v;
}

app.get("/api/orders", async (_req: Request, res: Response) => {
  try {
    const orders = await orderService.listOrders();
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/orders/:orderId", async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrder(oneParam(req.params.orderId));
    res.json(order);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(msg.includes("not found") ? 404 : 500).json({ error: msg });
  }
});

/** Insecure demo: no auth middleware — caller identity is never checked */
app.patch(
  "/api/orders/:orderId/status",
  async (req: Request, res: Response) => {
    try {
      const status = req.body?.status;
      if (!isOrderStatus(status)) {
        res.status(400).json({
          error: `Invalid status. Expected one of: ${ORDER_STATUSES.join(", ")}`,
        });
        return;
      }
      const order = await orderService.updateOrderStatus(
        oneParam(req.params.orderId),
        status,
      );
      res.json(order);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(msg.includes("not found") ? 404 : 500).json({ error: msg });
    }
  },
);

app.get("/api/users/:userId", async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(oneParam(req.params.userId));
    res.json(user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(msg.includes("not found") ? 404 : 500).json({ error: msg });
  }
});

app.use(express.static(publicDir));

const port = Number(process.env.PORT) || 3333;
app.listen(port, () => {
  console.log(`Demo UI: http://localhost:${port}`);
  console.log(
    "API has no auth — open DevTools Network to see bare PATCH bodies.",
  );
});
