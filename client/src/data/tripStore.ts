import { UserProfile } from '../types';
import { apiRequest } from './api';

export interface TripMember extends UserProfile {
  membershipRole?: 'owner' | 'member';
}

export interface TripWorkspace {
  id: string;
  tripId: string;
  title: string;
  destination: string;
  dates: string;
  daysCount: number;
  travelersCount: number;
  budgetTotal: number;
  budgetPerPerson: number;
  budgetTier: string;
  tags: string[];
  days: any[];
  owner?: TripMember;
  members: TripMember[];
}

export interface TripMessageRecord {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  text: string;
  timestamp: number;
  timeFormatted: string;
  readBy?: string[];
  tag?: 'itinerary' | 'dining' | 'general' | 'urgent';
}

export async function getTrips(): Promise<TripWorkspace[]> {
  const res = await apiRequest<{ trips: TripWorkspace[] }>('/trips');
  return res.trips || [];
}

export async function getTrip(tripId: string): Promise<TripWorkspace> {
  const res = await apiRequest<{ trip: TripWorkspace }>(`/trips/${encodeURIComponent(tripId)}`);
  return res.trip;
}

export async function createOrUpdateTrip(trip: unknown): Promise<TripWorkspace> {
  const res = await apiRequest<{ trip: TripWorkspace }>('/trips', {
    method: 'POST',
    body: JSON.stringify({ trip }),
  });
  return res.trip;
}

export async function inviteTripMember(tripId: string, email: string): Promise<TripWorkspace> {
  const res = await apiRequest<{ trip: TripWorkspace }>(`/trips/${encodeURIComponent(tripId)}/members`, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });
  return res.trip;
}

export async function getTripMessages(tripId: string): Promise<TripMessageRecord[]> {
  const res = await apiRequest<{ messages: TripMessageRecord[] }>(`/trips/${encodeURIComponent(tripId)}/messages`);
  return res.messages || [];
}

export async function sendTripMessage(
  tripId: string,
  text: string,
  tag: 'general' | 'itinerary' | 'dining' | 'urgent' = 'general',
): Promise<TripMessageRecord> {
  const res = await apiRequest<{ message: TripMessageRecord }>(`/trips/${encodeURIComponent(tripId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text: text.trim(), tag }),
  });
  return res.message;
}
