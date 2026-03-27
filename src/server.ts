import path from "node:path";
import { fileURLToPath } from "node:url";

import express, { type Request, type Response } from "express";

import type { OrderStatus } from "./types.js";
import { UnauthorizedError } from "./errors.js";
import * as orderController from "./controllers/orderController.js";
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

/** Demo: identity is client-supplied in the body — not verified like real auth */
app.patch("/api/orders/:orderId/status", async (req: Request, res: Response) => {
  try {
    const status = req.body?.status;
    if (!isOrderStatus(status)) {
      res.status(400).json({
        error: `Invalid status. Expected one of: ${ORDER_STATUSES.join(", ")}`,
      });
      return;
    }
    const requestingUserId = req.body?.requestingUserId;
    if (typeof requestingUserId !== "string" || requestingUserId.trim() === "") {
      res.status(400).json({ error: "Body must include requestingUserId" });
      return;
    }
    const order = await orderController.handleUpdateOrderStatus(
      oneParam(req.params.orderId),
      status,
      requestingUserId.trim(),
    );
    res.json(order);
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      res.status(401).json({ error: e.message });
      return;
    }
    const msg = e instanceof Error ? e.message : String(e);
    res.status(msg.includes("not found") ? 404 : 500).json({ error: msg });
  }
});

app.patch("/api/orders/:orderId/discount", async (req: Request, res: Response) => {
  try {
    const raw = req.body?.percent;
    const percent =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? Number(raw)
          : NaN;
    if (!Number.isFinite(percent)) {
      res.status(400).json({ error: "Body must include numeric percent" });
      return;
    }
    const requestingUserId = req.body?.requestingUserId;
    if (
      typeof requestingUserId !== "string" ||
      requestingUserId.trim() === ""
    ) {
      res.status(400).json({ error: "Body must include requestingUserId" });
      return;
    }
    const order = await orderController.handleApplyDiscount(
      oneParam(req.params.orderId),
      percent,
      requestingUserId.trim(),
    );
    res.json(order);
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      res.status(401).json({ error: e.message });
      return;
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Invalid discount percent")) {
      res.status(400).json({ error: msg });
      return;
    }
    res.status(msg.includes("not found") ? 404 : 500).json({ error: msg });
  }
});

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
