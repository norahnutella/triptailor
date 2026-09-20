import { ActivityItem } from '../types';

export interface GeneratedPlace {
  id: string; name: string; category: 'Sightseeing' | 'Food & Dining' | 'Beach' | 'Nature' | 'Activity';
  description: string; duration: string; estCost: string; rating: number; image: string; tags: string[]; selected: boolean;
}

const imagePool = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&auto=format&fit=crop&q=80',
];

const templates = [
  ['Top landmark', 'Sightseeing'], ['Local food experience', 'Food & Dining'], ['Scenic viewpoint', 'Nature'],
  ['Relaxing beach stop', 'Beach'], ['Adventure experience', 'Activity'], ['Neighbourhood walk', 'Sightseeing'],
] as const;

export function generatePlacesForDestination(destination: string, count = 12): GeneratedPlace[] {
  const base = destination.split(',')[0].trim() || 'Your destination';
  return Array.from({ length: Math.max(3, count) }, (_, i) => {
    const [label, category] = templates[i % templates.length];
    return {
      id: `${base.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
      name: `${base} ${label}`,
      category,
      description: `A suggested ${label.toLowerCase()} to consider while exploring ${base}.`,
      duration: `${1 + (i % 3)}.0 hrs`, estCost: i % 3 === 0 ? 'Free' : `₹${300 + i * 100}`,
      rating: Number((4.2 + (i % 7) / 10).toFixed(1)), image: imagePool[i % imagePool.length],
      tags: [category, 'Suggested'], selected: i < Math.min(6, count),
    };
  });
}

export function buildItineraryFromPlaces(destination: string, places: GeneratedPlace[]): ActivityItem[] {
  return places.map((p, index) => ({
    id: p.id, orderNumber: index + 1, time: `${9 + (index * 2) % 10}:00 ${index % 5 < 3 ? 'AM' : 'PM'}`,
    duration: p.duration, title: p.name, type: p.category === 'Food & Dining' ? 'dining' : p.category === 'Beach' ? 'beach' : p.category === 'Activity' ? 'activity' : 'visit',
    categoryTag: p.category, description: p.description, costInfo: p.estCost, rating: p.rating, reviewCount: '500+',
    highlightNote: `Suggested for ${destination}`, tags: p.tags, image: p.image, status: 'pending',
  }));
}
