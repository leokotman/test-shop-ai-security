import { db } from "../db.js";
import type { User } from "../types.js";

/** Basic lookup only — no roles, permissions, or session context */

export async function getUserById(userId: string): Promise<User> {
  const user = await db.users.findById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }
  return user;
}
