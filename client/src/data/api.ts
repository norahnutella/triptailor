import type { TripData, TripMember, TripSummary, TripChatMessage } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export function getAuthToken(): string | null { if (typeof window === 'undefined') return null; return window.localStorage.getItem('triptailor_auth_token'); }
export function setAuthToken(token: string) { window.localStorage.setItem('triptailor_auth_token', token); }
export function clearAuthToken() { window.localStorage.removeItem('triptailor_auth_token'); }

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Request failed. Please try again.');
  return body as T;
}

export async function searchTripTailorUsers(query: string): Promise<TripMember[]> { const res = await apiRequest<{ users: TripMember[] }>(`/trips/users/search?q=${encodeURIComponent(query)}`); return res.users; }
export async function createTripChat(title: string, memberIds: string[] = []): Promise<TripData> { const res = await apiRequest<{ trip: TripData }>('/trips', { method: 'POST', body: JSON.stringify({ title, memberIds }) }); return res.trip; }
export async function updateTrip(tripId: string, trip: Partial<TripData>): Promise<TripData> { const res = await apiRequest<{ trip: TripData }>(`/trips/${encodeURIComponent(tripId)}`, { method: 'PUT', body: JSON.stringify(trip) }); return res.trip; }
export async function addTripMember(tripId: string, userId: string): Promise<TripData> { const res = await apiRequest<{ trip: TripData }>(`/trips/${encodeURIComponent(tripId)}/members`, { method: 'POST', body: JSON.stringify({ userId }) }); return res.trip; }
export async function removeTripMember(tripId: string, userId: string): Promise<TripData> { const res = await apiRequest<{ trip: TripData }>(`/trips/${encodeURIComponent(tripId)}/members/${encodeURIComponent(userId)}`, { method: 'DELETE' }); return res.trip; }
export async function getTrip(tripId: string): Promise<TripData> { const res = await apiRequest<{ trip: TripData }>(`/trips/${encodeURIComponent(tripId)}`); return res.trip; }
export async function getTrips(): Promise<TripSummary[]> { const res = await apiRequest<{ trips: TripSummary[] }>('/trips'); return res.trips; }
export async function getTripMessages(tripId: string): Promise<TripChatMessage[]> { const res = await apiRequest<{ messages: TripChatMessage[] }>(`/trips/${encodeURIComponent(tripId)}/messages`); return res.messages; }
export async function sendTripMessage(tripId: string, text: string): Promise<TripChatMessage> { const res = await apiRequest<{ message: TripChatMessage }>(`/trips/${encodeURIComponent(tripId)}/messages`, { method: 'POST', body: JSON.stringify({ text }) }); return res.message; }

export async function deleteTrip(tripId: string): Promise<void> {
  await apiRequest(`/trips/${encodeURIComponent(tripId)}`, { method: 'DELETE' });
}

export async function sendTripFile(tripId: string, attachment: { name: string; type: string; size: number; dataUrl: string }): Promise<TripChatMessage> {
  const res = await apiRequest<{ message: TripChatMessage }>(`/trips/${encodeURIComponent(tripId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ kind: 'file', attachment }),
  });
  return res.message;
}

export async function createTripPoll(tripId: string, question: string, options: string[]): Promise<TripChatMessage> {
  const res = await apiRequest<{ message: TripChatMessage }>(`/trips/${encodeURIComponent(tripId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ kind: 'poll', poll: { question, options } }),
  });
  return res.message;
}

export async function voteTripPoll(tripId: string, messageId: string, optionIndex: number): Promise<TripChatMessage> {
  const res = await apiRequest<{ message: TripChatMessage }>(`/trips/${encodeURIComponent(tripId)}/messages/${encodeURIComponent(messageId)}/vote`, {
    method: 'POST',
    body: JSON.stringify({ optionIndex }),
  });
  return res.message;
}
