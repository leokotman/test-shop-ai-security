import * as userService from "../services/userService.js";

export async function handleGetUser(userId: string) {
  return userService.getUserById(userId);
}
