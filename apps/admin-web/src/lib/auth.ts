import { clearToken, getUser } from './api';

export function isAuthed(): boolean {
  return !!localStorage.getItem('access_token');
}

export function logout() {
  clearToken();
}

export function currentUser() {
  return getUser();
}
