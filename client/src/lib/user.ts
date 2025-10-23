import { apiRequest } from "./queryClient";

const USER_ID_KEY = 'chh_user_id';

export function getCurrentUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setCurrentUserId(userId: string) {
  localStorage.setItem(USER_ID_KEY, userId);
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_ID_KEY);
}
