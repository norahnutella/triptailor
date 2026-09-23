import { ActivityItem, Collaborator, DayItinerary, TripData } from '../types';

const img = (id: string) => `https://images.unsplash.com/${id}?w=900&auto=format&fit=crop&q=80`;

export const RECENT_DESTINATIONS = [
  { id: 'dest-1', name: 'Goa, India', image: img('photo-1512343879784-a960bf40e7f2') },
  { id: 'dest-2', name: 'Kyoto, Japan', image: img('photo-1493976040374-85c8e12f0c0e') },
  { id: 'dest-3', name: 'Bali, Indonesia', image: img('photo-1537996194471-e657df975ab4') },
  { id: 'dest-4', name: 'Paris, France', image: img('photo-1502602898657-3e91760cbb34') },
];

export const SAVED_PLACES = [
  { id: 'sp-1', name: 'Baga Beach', location: 'Goa, India', category: 'Beach', image: img('photo-1512343879784-a960bf40e7f2') },
  { id: 'sp-2', name: 'Fushimi Inari Shrine', location: 'Kyoto, Japan', category: 'Culture', image: img('photo-1493976040374-85c8e12f0c0e') },
  { id: 'sp-3', name: 'Ubud Rice Terraces', location: 'Bali, Indonesia', category: 'Nature', image: img('photo-1537996194471-e657df975ab4') },
];

const activity = (id: string, title: string, type: ActivityItem['type'], image: string, time: string, costInfo: string): ActivityItem => ({
  id, orderNumber: Number(id.replace(/\D/g, '')) || 1, time, duration: '2 hrs', title, type,
  categoryTag: type.toUpperCase(), description: `A curated stop for your trip to explore ${title.toLowerCase()}.`,
  costInfo, rating: 4.6, reviewCount: '1.2k', highlightNote: 'Recommended for your itinerary',
  tags: [type, 'Recommended'], image, status: 'pending',
});

export const INITIAL_DAY1_ACTIVITIES: ActivityItem[] = [
  activity('a1', 'Fort Aguada', 'visit', img('photo-1500530855697-b586d89ba3ee'), '09:00 AM', '₹50'),
  activity('a2', 'Candolim Beach', 'beach', img('photo-1512343879784-a960bf40e7f2'), '12:00 PM', 'Free'),
  activity('a3', 'Local Coastal Dinner', 'dining', img('photo-1515003197210-e0cd71810b5f'), '07:30 PM', '₹700'),
];

export const INITIAL_DAYS: DayItinerary[] = [
  { dayNumber: 1, dateStr: 'Day 1 • Goa Highlights', title: 'Goa Highlights', activities: INITIAL_DAY1_ACTIVITIES },
  { dayNumber: 2, dateStr: 'Day 2 • Beach & Dining', title: 'Beach & Dining', activities: [activity('a4', 'Palolem Beach', 'beach', img('photo-1512343879784-a960bf40e7f2'), '09:30 AM', 'Free'), activity('a5', 'Spice Garden', 'visit', img('photo-1518509562904-e7ef99cdcc86'), '02:00 PM', '₹250')] },
  { dayNumber: 3, dateStr: 'Day 3 • Culture & Nature', title: 'Culture & Nature', activities: [activity('a6', 'Old Goa Churches', 'visit', img('photo-1609347740092-3f6d7c3f9d5d'), '10:00 AM', 'Free'), activity('a7', 'Sunset Point', 'activity', img('photo-1500530855697-b586d89ba3ee'), '05:30 PM', 'Free')] },
];

export const POD_MEMBERS: Collaborator[] = [];

export const GOA_TRIP: TripData = {
  id: 'starter-goa-template', title: 'Goa Trip Template', destination: 'Goa, India', dates: 'Choose your dates', daysCount: 3,
  travelersCount: 2, budgetTotal: 0, budgetPerPerson: 0, budgetTier: 'Moderate',
  tags: ['STARTER TEMPLATE', 'EDITABLE'], days: INITIAL_DAYS,
};

export const EMPTY_TRIP: TripData = {
  id: '', title: '', destination: '', dates: '', daysCount: 0,
  travelersCount: 1, budgetTotal: 0, budgetPerPerson: 0, budgetTier: 'Moderate',
  tags: [], days: [],
};
