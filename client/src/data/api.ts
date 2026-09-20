const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('triptailor_auth_token');
}

export function setAuthToken(token: string) {
  window.localStorage.setItem('triptailor_auth_token', token);
}

export function clearAuthToken() {
  window.localStorage.removeItem('triptailor_auth_token');
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || 'Request failed. Please try again.');
  }
  return body as T;
}
