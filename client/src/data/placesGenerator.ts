import { ActivityItem } from '../types';

export interface GeneratedPlace {
  id: string;
  name: string;
  category: 'Sightseeing' | 'Food & Dining' | 'Beach' | 'Nature' | 'Activity';
  description: string;
  duration: string;
  estCost: string;
  rating: number;
  image: string;
  tags: string[];
  selected: boolean;
}

const imagePool = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
];

type PlaceTemplate = Omit<GeneratedPlace, 'id' | 'selected' | 'image'>;

const destinationProfiles: Array<{ match: string[]; places: PlaceTemplate[] }> = [
  {
    match: ['goa'],
    places: [
      { name: 'Sunrise kayak through the mangroves', category: 'Nature', description: 'A quiet early-morning paddle through Goa’s mangrove waterways before the beaches get busy.', duration: '2.0 hrs', estCost: '₹900', rating: 4.8, tags: ['Niche', 'Local', 'Nature'] },
      { name: 'Fontainhas heritage lane walk', category: 'Sightseeing', description: 'Explore Goa’s Latin Quarter through colourful balconies, old lanes and local stories.', duration: '1.5 hrs', estCost: '₹350', rating: 4.7, tags: ['Niche', 'Heritage', 'Local'] },
      { name: 'Traditional Goan home-style thali', category: 'Food & Dining', description: 'Try regional Goan flavours beyond the usual tourist restaurant menu.', duration: '1.5 hrs', estCost: '₹500', rating: 4.6, tags: ['Local Food', 'Niche'] },
      { name: 'Cabo de Rama sunset viewpoint', category: 'Nature', description: 'A dramatic coastal viewpoint for a quieter sunset away from the busiest beach strips.', duration: '2.0 hrs', estCost: 'Free', rating: 4.7, tags: ['Hidden Gem', 'Sunset'] },
      { name: 'Mandovi backwater cycling route', category: 'Activity', description: 'A relaxed cycling route through riverside neighbourhoods and quieter Goan roads.', duration: '2.5 hrs', estCost: '₹700', rating: 4.5, tags: ['Local', 'Cycling', 'Niche'] },
      { name: 'Spice plantation tasting', category: 'Food & Dining', description: 'Visit a plantation for local spices, traditional preparation and a regional meal.', duration: '3.0 hrs', estCost: '₹1,200', rating: 4.8, tags: ['Local Food', 'Culture'] },
    ],
  },
  {
    match: ['kochi', 'cochin'],
    places: [
      { name: 'Kumbalangi village canoe experience', category: 'Nature', description: 'Explore village waterways and traditional fishing life around Kumbalangi.', duration: '3.0 hrs', estCost: '₹900', rating: 4.8, tags: ['Niche', 'Village Life'] },
      { name: 'Fort Kochi art and spice lane walk', category: 'Sightseeing', description: 'A small-group walk through heritage streets, galleries, spice warehouses and local stories.', duration: '2.0 hrs', estCost: '₹500', rating: 4.7, tags: ['Heritage', 'Art', 'Niche'] },
      { name: 'Kerala sadya tasting', category: 'Food & Dining', description: 'Taste a traditional Kerala vegetarian feast served with regional accompaniments.', duration: '1.5 hrs', estCost: '₹450', rating: 4.7, tags: ['Local Food', 'Kerala'] },
      { name: 'Chinese fishing nets at golden hour', category: 'Sightseeing', description: 'Watch the fishing-net operators work along the Fort Kochi waterfront near sunset.', duration: '1.0 hrs', estCost: 'Free', rating: 4.6, tags: ['Local', 'Sunset'] },
      { name: 'Mattancherry antique and spice trail', category: 'Sightseeing', description: 'Discover old trading streets, spice shops and the multicultural history of Mattancherry.', duration: '2.0 hrs', estCost: '₹300', rating: 4.6, tags: ['Heritage', 'Niche'] },
      { name: 'Backwater sunset canoe ride', category: 'Activity', description: 'A slower alternative to large tourist boats through peaceful Kerala waterways.', duration: '2.0 hrs', estCost: '₹1,000', rating: 4.8, tags: ['Local', 'Backwaters'] },
    ],
  },
  {
    match: ['munnar'],
    places: [
      { name: 'Tea-estate sunrise walk', category: 'Nature', description: 'Walk through misty tea slopes early in the morning with expansive valley views.', duration: '2.0 hrs', estCost: '₹500', rating: 4.8, tags: ['Niche', 'Tea', 'Nature'] },
      { name: 'Tea tasting with a local guide', category: 'Food & Dining', description: 'Compare regional tea varieties and learn how Munnar tea is processed.', duration: '1.5 hrs', estCost: '₹450', rating: 4.7, tags: ['Local', 'Tea'] },
      { name: 'Kolukkumalai jeep sunrise trip', category: 'Activity', description: 'A rugged early-morning mountain ride to one of the region’s high-altitude tea areas.', duration: '5.0 hrs', estCost: '₹1,800', rating: 4.8, tags: ['Adventure', 'Niche'] },
      { name: 'Cardamom plantation trail', category: 'Nature', description: 'Discover how cardamom and other spices grow in the highland forests around Munnar.', duration: '2.5 hrs', estCost: '₹700', rating: 4.6, tags: ['Spices', 'Local'] },
      { name: 'Top Station cloud viewpoint', category: 'Nature', description: 'A highland viewpoint known for sweeping mountain layers and changing cloud cover.', duration: '2.0 hrs', estCost: '₹300', rating: 4.7, tags: ['Viewpoint', 'Nature'] },
      { name: 'Kerala highland cooking session', category: 'Food & Dining', description: 'Learn a few regional recipes using locally grown spices and produce.', duration: '2.5 hrs', estCost: '₹1,000', rating: 4.7, tags: ['Local Food', 'Hands-on'] },
    ],
  },
  {
    match: ['kyoto'],
    places: [
      { name: 'Fushimi sake brewery tasting', category: 'Food & Dining', description: 'Explore Kyoto’s historic sake district and learn about local brewing traditions.', duration: '2.0 hrs', estCost: '₹2,500', rating: 4.8, tags: ['Niche', 'Local Culture'] },
      { name: 'Philosopher’s Path dawn walk', category: 'Nature', description: 'A quieter early walk along the canal before the main sightseeing crowds arrive.', duration: '1.5 hrs', estCost: 'Free', rating: 4.7, tags: ['Quiet', 'Local'] },
      { name: 'Nishiki Market tasting trail', category: 'Food & Dining', description: 'Sample small local bites and seasonal ingredients across Kyoto’s famous market.', duration: '2.0 hrs', estCost: '₹1,500', rating: 4.7, tags: ['Food', 'Local'] },
      { name: 'Traditional machiya craft workshop', category: 'Activity', description: 'Try a hands-on craft experience in a traditional Kyoto townhouse setting.', duration: '2.0 hrs', estCost: '₹2,000', rating: 4.8, tags: ['Craft', 'Niche'] },
      { name: 'Arashiyama bamboo grove after sunrise', category: 'Nature', description: 'Visit the bamboo area early for a calmer atmosphere and softer light.', duration: '2.0 hrs', estCost: 'Free', rating: 4.7, tags: ['Nature', 'Early Morning'] },
      { name: 'Gion evening lantern walk', category: 'Sightseeing', description: 'Walk through historic Gion streets as traditional lanterns begin to glow.', duration: '1.5 hrs', estCost: 'Free', rating: 4.6, tags: ['Heritage', 'Evening'] },
    ],
  },
  {
    match: ['bali'],
    places: [
      { name: 'Sidemen village rice-field walk', category: 'Nature', description: 'Walk through quieter rice terraces and village lanes away from the busiest resort areas.', duration: '2.5 hrs', estCost: '₹800', rating: 4.8, tags: ['Niche', 'Local'] },
      { name: 'Balinese temple purification experience', category: 'Activity', description: 'Learn about Balinese water-temple traditions through a culturally respectful guided experience.', duration: '2.5 hrs', estCost: '₹1,500', rating: 4.7, tags: ['Culture', 'Niche'] },
      { name: 'Balinese market cooking class', category: 'Food & Dining', description: 'Shop for ingredients and prepare regional dishes with a local host.', duration: '3.0 hrs', estCost: '₹1,800', rating: 4.8, tags: ['Local Food', 'Hands-on'] },
      { name: 'Mount Batur sunrise viewpoint', category: 'Nature', description: 'A sunrise mountain experience with wide views over Bali’s volcanic landscape.', duration: '5.0 hrs', estCost: '₹2,000', rating: 4.7, tags: ['Adventure', 'Sunrise'] },
      { name: 'Ubud artisan village trail', category: 'Sightseeing', description: 'Explore small workshops and village crafts outside the busiest central streets.', duration: '2.5 hrs', estCost: '₹700', rating: 4.6, tags: ['Art', 'Local'] },
      { name: 'Jimbaran seafood sunset dinner', category: 'Food & Dining', description: 'A relaxed seaside meal featuring locally prepared seafood and regional flavours.', duration: '2.0 hrs', estCost: '₹1,600', rating: 4.7, tags: ['Food', 'Sunset'] },
    ],
  },
  {
    match: ['jaipur'],
    places: [
      { name: 'Pink City dawn heritage walk', category: 'Sightseeing', description: 'See old markets and historic streets before Jaipur becomes busy.', duration: '2.0 hrs', estCost: '₹500', rating: 4.8, tags: ['Niche', 'Heritage'] },
      { name: 'Blue pottery workshop', category: 'Activity', description: 'Try Jaipur’s distinctive blue-pottery craft with a local artisan.', duration: '2.0 hrs', estCost: '₹1,200', rating: 4.7, tags: ['Craft', 'Hands-on'] },
      { name: 'Rajasthani thali and spice tasting', category: 'Food & Dining', description: 'Explore regional flavours and traditional dishes in a local-style meal.', duration: '1.5 hrs', estCost: '₹600', rating: 4.7, tags: ['Local Food', 'Culture'] },
      { name: 'Stepwell photography trail', category: 'Sightseeing', description: 'Visit lesser-known stepwell architecture and learn how these structures worked.', duration: '2.5 hrs', estCost: '₹400', rating: 4.6, tags: ['Architecture', 'Niche'] },
      { name: 'Nahargarh sunset cycle', category: 'Activity', description: 'An active late-afternoon route with views over Jaipur’s old city.', duration: '2.5 hrs', estCost: '₹900', rating: 4.6, tags: ['Cycling', 'Sunset'] },
      { name: 'Block-printing studio visit', category: 'Activity', description: 'See traditional textile printing techniques and try a small hands-on piece.', duration: '2.0 hrs', estCost: '₹1,000', rating: 4.7, tags: ['Craft', 'Local'] },
    ],
  },
];

const genericTemplates: PlaceTemplate[] = [
  { name: 'Local neighbourhood walking trail', category: 'Sightseeing', description: 'A slower route through local streets, small shops and everyday neighbourhood life.', duration: '1.5 hrs', estCost: 'Free', rating: 4.5, tags: ['Local', 'Niche'] },
  { name: 'Regional food tasting', category: 'Food & Dining', description: 'Try a regional dish or small local food experience associated with the destination.', duration: '1.5 hrs', estCost: '₹500', rating: 4.5, tags: ['Local Food', 'Niche'] },
  { name: 'Hidden viewpoint', category: 'Nature', description: 'A scenic stop selected for atmosphere and views rather than the standard landmark circuit.', duration: '2.0 hrs', estCost: 'Free', rating: 4.5, tags: ['Hidden Gem', 'Nature'] },
  { name: 'Hands-on local craft experience', category: 'Activity', description: 'A small workshop inspired by a craft tradition from the destination.', duration: '2.0 hrs', estCost: '₹900', rating: 4.5, tags: ['Craft', 'Local'] },
  { name: 'Sunset local experience', category: 'Nature', description: 'A calmer evening experience built around the destination’s landscape and local character.', duration: '1.5 hrs', estCost: '₹300', rating: 4.4, tags: ['Sunset', 'Niche'] },
  { name: 'Traditional cooking experience', category: 'Food & Dining', description: 'Learn about local ingredients and prepare a destination-inspired dish.', duration: '2.5 hrs', estCost: '₹1,000', rating: 4.6, tags: ['Food', 'Hands-on'] },
];

function getProfile(destination: string): PlaceTemplate[] {
  const normalized = destination.toLowerCase();
  const profile = destinationProfiles.find(({ match }) => match.some((term) => normalized.includes(term)));
  return profile?.places || genericTemplates;
}

export function generatePlacesForDestination(destination: string, count = 12): GeneratedPlace[] {
  const base = destination.split(',')[0].trim() || 'Your destination';
  const profile = getProfile(destination);
  return Array.from({ length: Math.max(3, count) }, (_, i) => {
    const template = profile[i % profile.length];
    return {
      ...template,
      id: `${base.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
      name: template.name,
      description: template.description,
      image: imagePool[i % imagePool.length],
      selected: i < Math.min(6, count),
    };
  });
}

export function buildItineraryFromPlaces(destination: string, places: GeneratedPlace[], daysCount = 1): ActivityItem[] {
  const safeDays = Math.max(1, daysCount);
  const sorted = [...places];
  return sorted.map((p, index) => ({
    id: p.id,
    orderNumber: index + 1,
    time: `${9 + (index % 5) * 2}:00 ${index % 5 < 3 ? 'AM' : 'PM'}`,
    duration: p.duration,
    title: p.name,
    type: p.category === 'Food & Dining' ? 'dining' : p.category === 'Beach' ? 'beach' : p.category === 'Activity' ? 'activity' : 'visit',
    categoryTag: p.category,
    description: p.description,
    costInfo: p.estCost,
    rating: p.rating,
    reviewCount: '500+',
    highlightNote: `${p.tags.includes('Niche') ? 'Niche local experience' : 'Destination-specific experience'} for ${destination}`,
    tags: p.tags,
    image: p.image,
    status: 'pending',
  }));
}
