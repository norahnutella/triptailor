import { UserProfile, NotificationItem } from '../types';
import { apiRequest, clearAuthToken, getAuthToken, setAuthToken } from './api';

const ACTIVE_USER_KEY = 'triptailor_active_user_v2';
const NOTIF_STORAGE_KEY = 'triptailor_notifications_v1';

export const AVATAR_PRESETS = [
  { label: 'Explorer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { label: 'Traveler', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { label: 'Adventurer', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' },
  { label: 'Wanderer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
  { label: 'Voyager', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
];

interface AuthResponse { token: string; user: UserProfile; message?: string; }
interface SignupPayload { name: string; email: string; password: string; avatar: string; travelPace: UserProfile['travelPace']; }

function persistUser(user: UserProfile) {
  window.localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
}

export function getActiveUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  if (!getAuthToken()) return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_USER_KEY);
    return raw ? JSON.parse(raw) as UserProfile : null;
  } catch { return null; }
}

export function setActiveUser(user: UserProfile) { persistUser(user); }

export function logoutUser() {
  clearAuthToken();
  window.localStorage.removeItem(ACTIVE_USER_KEY);
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) });
    setAuthToken(res.token);
    persistUser(res.user);
    return { success: true, user: res.user };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to sign in.' };
  }
}

export async function signupUser(payload: SignupPayload): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    setAuthToken(res.token);
    persistUser(res.user);
    return { success: true, user: res.user };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to create account.' };
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const current = getActiveUser();
  if (!current) throw new Error('You must be signed in to update your profile.');
  const res = await apiRequest<{ user: UserProfile }>('/auth/me', { method: 'PUT', body: JSON.stringify(updates) });
  persistUser(res.user);
  return res.user;
}

export async function deleteUserAccount(): Promise<void> {
  await apiRequest('/auth/me', { method: 'DELETE' });
  logoutUser();
}

export async function restoreSession(): Promise<UserProfile | null> {
  if (!getAuthToken()) return null;
  try {
    const res = await apiRequest<{ user: UserProfile }>('/auth/me');
    persistUser(res.user);
    return res.user;
  } catch {
    logoutUser();
    return null;
  }
}

export function getNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function markNotificationsAsRead(): NotificationItem[] {
  const updated = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearAllNotifications(): NotificationItem[] {
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify([]));
  return [];
}
