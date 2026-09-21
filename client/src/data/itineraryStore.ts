import { SavedItinerary, TripData } from '../types';
import { apiRequest } from './api';

export type { SavedItinerary } from '../types';

export async function getSavedItineraries(_userId: string): Promise<SavedItinerary[]> {
  const res = await apiRequest<{ itineraries: SavedItinerary[] }>('/itineraries');
  return res.itineraries;
}


export async function getSavedItinerary(_userId: string, tripId: string): Promise<SavedItinerary> {
  const res = await apiRequest<{ itinerary: SavedItinerary }>(`/itineraries/${encodeURIComponent(tripId)}`);
  return res.itinerary;
}

export async function saveItinerary(_userId: string, trip: TripData): Promise<SavedItinerary> {
  const res = await apiRequest<{ itinerary: SavedItinerary }>('/itineraries', {
    method: 'POST', body: JSON.stringify({ trip }),
  });
  return res.itinerary;
}

export async function deleteItinerary(_userId: string, tripId: string): Promise<SavedItinerary[]> {
  await apiRequest(`/itineraries/${encodeURIComponent(tripId)}`, { method: 'DELETE' });
  return getSavedItineraries(_userId);
}

export async function isItinerarySaved(_userId: string, tripId: string): Promise<boolean> {
  const items = await getSavedItineraries(_userId);
  return items.some((item) => item.id === tripId);
}
