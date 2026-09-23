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

type Recommendation = {
  name: string;
  category: GeneratedPlace['category'];
  description: string;
  duration: string;
  estCost: string;
  image: string;
  tags: string[];
};

const recommendationProfiles: Array<{ matches: string[]; places: Recommendation[] }> = [
  {
    matches: ['goa'],
    places: [
      { name: 'Fort Aguada', category: 'Sightseeing', description: 'A 17th-century Portuguese fort with sea views over the Mandovi estuary.', duration: '1.5 hrs', estCost: '₹50', image: imagePool[0], tags: ['History', 'Sea views'] },
      { name: 'Baga Beach', category: 'Beach', description: 'Goa classic for a lively shoreline, water sports, and beach shacks.', duration: '2.0 hrs', estCost: 'Free', image: imagePool[1], tags: ['Beach', 'Water sports'] },
      { name: 'Basilica of Bom Jesus', category: 'Sightseeing', description: 'A UNESCO-listed Old Goa church known for Baroque architecture and sacred art.', duration: '1.5 hrs', estCost: 'Free', image: imagePool[2], tags: ['UNESCO', 'Heritage'] },
      { name: 'Dudhsagar Falls Jeep Safari', category: 'Activity', description: 'A monsoon-season adventure through forest trails to Goa’s dramatic waterfall.', duration: '6.0 hrs', estCost: '₹2,000', image: imagePool[0], tags: ['Adventure', 'Nature'] },
      { name: 'Goan Fish Curry & Rice', category: 'Food & Dining', description: 'Try coconut-based fish curry, red rice, and kokum at a local Goan kitchen.', duration: '1.5 hrs', estCost: '₹700', image: imagePool[3], tags: ['Goan cuisine', 'Local speciality'] },
      { name: 'Sunset at Chapora Fort', category: 'Nature', description: 'Clifftop sunset views over Vagator and the North Goa coastline.', duration: '1.5 hrs', estCost: 'Free', image: imagePool[1], tags: ['Sunset', 'Viewpoint'] },
      { name: 'Palolem Beach', category: 'Beach', description: 'A crescent-shaped South Goa beach with calm water and colourful shore huts.', duration: '2.5 hrs', estCost: 'Free', image: imagePool[1], tags: ['Beach', 'South Goa'] },
      { name: 'Prawn Balchao Tasting', category: 'Food & Dining', description: 'Sample Goa’s spicy, tangy prawn pickle-style speciality with local bread.', duration: '1.0 hr', estCost: '₹450', image: imagePool[3], tags: ['Goan cuisine', 'Seafood'] },
      { name: 'Fontainhas Latin Quarter', category: 'Sightseeing', description: 'Wander through Panaji’s colourful Portuguese quarter and its azulejo-lined streets.', duration: '2.0 hrs', estCost: 'Free', image: imagePool[2], tags: ['Panaji', 'Heritage'] },
      { name: 'Spice Plantation Tour', category: 'Nature', description: 'Explore a tropical spice farm and learn how cardamom, pepper, and vanilla are grown.', duration: '3.0 hrs', estCost: '₹1,200', image: imagePool[0], tags: ['Spices', 'Nature'] },
      { name: 'Goan Bebinca Dessert', category: 'Food & Dining', description: 'Taste bebinca, Goa’s layered coconut-and-egg dessert, with a cup of local coffee.', duration: '1.0 hr', estCost: '₹250', image: imagePool[3], tags: ['Goan cuisine', 'Dessert'] },
      { name: 'Kayaking in the Sal Backwaters', category: 'Activity', description: 'Paddle through quiet mangroves and backwaters away from the busiest beaches.', duration: '2.5 hrs', estCost: '₹1,500', image: imagePool[1], tags: ['Kayaking', 'Nature'] },
    ],
  },
  {
    matches: ['kyoto'],
    places: [
      { name: 'Fushimi Inari Taisha', category: 'Sightseeing', description: 'Walk through thousands of vermilion torii gates climbing Mount Inari.', duration: '2.5 hrs', estCost: 'Free', image: imagePool[0], tags: ['Shrine', 'Iconic'] },
      { name: 'Kiyomizu-dera', category: 'Sightseeing', description: 'Historic hillside temple with a wooden stage overlooking Kyoto’s old quarters.', duration: '2.0 hrs', estCost: '¥500', image: imagePool[2], tags: ['Temple', 'Heritage'] },
      { name: 'Arashiyama Bamboo Grove', category: 'Nature', description: 'A tranquil morning walk through Kyoto’s famous bamboo lanes.', duration: '1.5 hrs', estCost: 'Free', image: imagePool[0], tags: ['Nature', 'Morning'] },
      { name: 'Nishiki Market', category: 'Food & Dining', description: 'Taste Kyoto specialities including yuba, pickles, matcha sweets, and grilled seafood.', duration: '2.0 hrs', estCost: '¥2,000', image: imagePool[3], tags: ['Market', 'Local speciality'] },
      { name: 'Traditional Tea Ceremony', category: 'Activity', description: 'Learn the quiet rituals of matcha preparation in a traditional Kyoto setting.', duration: '1.5 hrs', estCost: '¥3,500', image: imagePool[3], tags: ['Tea', 'Culture'] },
      { name: 'Gion Evening Walk', category: 'Sightseeing', description: 'Explore lantern-lit lanes, machiya houses, and Kyoto’s geisha district.', duration: '2.0 hrs', estCost: 'Free', image: imagePool[2], tags: ['Gion', 'Evening'] },
      { name: 'Nijō Castle', category: 'Sightseeing', description: 'See shogun-era rooms, gardens, and the famous nightingale floors of Nijō Castle.', duration: '2.0 hrs', estCost: '¥1,300', image: imagePool[2], tags: ['Castle', 'History'] },
      { name: 'Philosopher’s Path', category: 'Nature', description: 'Follow a peaceful canal-side walk between temples and seasonal cherry trees.', duration: '2.0 hrs', estCost: 'Free', image: imagePool[0], tags: ['Walk', 'Seasonal'] },
      { name: 'Kaiseki Dinner', category: 'Food & Dining', description: 'Experience Kyoto’s refined multi-course cuisine built around seasonal ingredients.', duration: '2.5 hrs', estCost: '¥8,000', image: imagePool[3], tags: ['Japanese cuisine', 'Fine dining'] },
      { name: 'Nishijin Textile Workshop', category: 'Activity', description: 'Learn about Kyoto’s silk-weaving tradition and try a hands-on craft session.', duration: '2.0 hrs', estCost: '¥4,000', image: imagePool[2], tags: ['Craft', 'Culture'] },
    ],
  },
  {
    matches: ['bali', 'ubud', 'denpasar'],
    places: [
      { name: 'Tegallalang Rice Terraces', category: 'Nature', description: 'Walk through Ubud’s iconic emerald terraces and irrigation landscapes.', duration: '2.0 hrs', estCost: 'IDR 50,000', image: imagePool[0], tags: ['Ubud', 'Nature'] },
      { name: 'Uluwatu Temple Sunset', category: 'Sightseeing', description: 'Watch the sunset from a clifftop sea temple above Bali’s southern coast.', duration: '2.5 hrs', estCost: 'IDR 50,000', image: imagePool[1], tags: ['Temple', 'Sunset'] },
      { name: 'Mount Batur Sunrise Trek', category: 'Activity', description: 'Start before dawn for a guided sunrise hike above Bali’s volcanic caldera.', duration: '6.0 hrs', estCost: 'IDR 700,000', image: imagePool[0], tags: ['Trekking', 'Adventure'] },
      { name: 'Balinese Cooking Class', category: 'Food & Dining', description: 'Shop for herbs and learn to make sambal, satay, and lawar with a local chef.', duration: '4.0 hrs', estCost: 'IDR 650,000', image: imagePool[3], tags: ['Cooking', 'Local speciality'] },
      { name: 'Nusa Dua Beach', category: 'Beach', description: 'Calm turquoise water and an easy-going beach day on Bali’s southeast coast.', duration: '3.0 hrs', estCost: 'Free', image: imagePool[1], tags: ['Beach', 'Relaxed'] },
      { name: 'Babi Guling Tasting', category: 'Food & Dining', description: 'Try Bali’s celebrated suckling-pig dish with fragrant rice and spiced vegetables.', duration: '1.0 hr', estCost: 'IDR 90,000', image: imagePool[3], tags: ['Balinese cuisine', 'Local speciality'] },
      { name: 'Tirta Empul Water Temple', category: 'Sightseeing', description: 'Visit Bali’s sacred spring temple and its traditional purification pools.', duration: '2.0 hrs', estCost: 'IDR 50,000', image: imagePool[2], tags: ['Temple', 'Culture'] },
      { name: 'Seminyak Beach Sunset', category: 'Beach', description: 'Relax at a stylish west-coast beach with sunset views and beachfront cafés.', duration: '2.5 hrs', estCost: 'Free', image: imagePool[1], tags: ['Beach', 'Sunset'] },
      { name: 'Bali Swing & Jungle View', category: 'Activity', description: 'Take in the jungle canopy and rice-field views from Ubud’s famous swing sites.', duration: '2.0 hrs', estCost: 'IDR 300,000', image: imagePool[0], tags: ['Adventure', 'Ubud'] },
      { name: 'Nasi Goreng & Sate Lilit', category: 'Food & Dining', description: 'Try fragrant fried rice and Balinese minced-fish satay, two island staples.', duration: '1.0 hr', estCost: 'IDR 100,000', image: imagePool[3], tags: ['Balinese cuisine', 'Street food'] },
    ],
  },
  {
    matches: ['paris'],
    places: [
      { name: 'Eiffel Tower Summit', category: 'Sightseeing', description: 'Take in Paris rooftops and the Seine from the city’s defining landmark.', duration: '2.0 hrs', estCost: '€30', image: imagePool[0], tags: ['Iconic', 'City views'] },
      { name: 'Louvre Museum', category: 'Sightseeing', description: 'Explore world-famous collections from ancient civilisations to European masters.', duration: '3.0 hrs', estCost: '€22', image: imagePool[2], tags: ['Museum', 'Art'] },
      { name: 'Montmartre & Sacré-Cœur', category: 'Nature', description: 'Climb the village-like streets of Montmartre for artists, cafés, and city views.', duration: '2.5 hrs', estCost: 'Free', image: imagePool[0], tags: ['Neighbourhood', 'Viewpoint'] },
      { name: 'Seine River Cruise', category: 'Activity', description: 'See Notre-Dame, the Louvre, and the Eiffel Tower from the river.', duration: '1.5 hrs', estCost: '€18', image: imagePool[1], tags: ['River', 'City views'] },
      { name: 'French Bistro Dinner', category: 'Food & Dining', description: 'Enjoy steak frites, onion soup, and a seasonal tart in a classic neighbourhood bistro.', duration: '2.0 hrs', estCost: '€35', image: imagePool[3], tags: ['French cuisine', 'Local speciality'] },
      { name: 'Le Marais Food Walk', category: 'Food & Dining', description: 'Taste falafel, cheese, pastries, and chocolate through Paris’s historic Marais district.', duration: '2.5 hrs', estCost: '€28', image: imagePool[3], tags: ['Food walk', 'Local speciality'] },
      { name: 'Musée d’Orsay', category: 'Sightseeing', description: 'See Impressionist masterpieces inside a grand former railway station beside the Seine.', duration: '2.5 hrs', estCost: '€16', image: imagePool[2], tags: ['Museum', 'Art'] },
      { name: 'Luxembourg Gardens', category: 'Nature', description: 'Stroll through formal gardens, fountains, and tree-lined paths in the Left Bank.', duration: '1.5 hrs', estCost: 'Free', image: imagePool[0], tags: ['Gardens', 'Left Bank'] },
      { name: 'French Macaron Workshop', category: 'Activity', description: 'Learn the techniques behind Parisian macarons in a small pastry workshop.', duration: '2.5 hrs', estCost: '€70', image: imagePool[3], tags: ['Pastry', 'Hands-on'] },
      { name: 'Crêpe & Galette Stop', category: 'Food & Dining', description: 'Try a buttery sweet crêpe or savoury buckwheat galette in a traditional crêperie.', duration: '1.0 hr', estCost: '€18', image: imagePool[3], tags: ['French cuisine', 'Local speciality'] },
    ],
  },
  {
    matches: ['tokyo'],
    places: [
      { name: 'Senso-ji Temple', category: 'Sightseeing', description: 'Visit Tokyo’s oldest temple and browse the traditional Nakamise shopping street.', duration: '2.0 hrs', estCost: 'Free', image: imagePool[2], tags: ['Temple', 'Asakusa'] },
      { name: 'Shibuya Crossing', category: 'Sightseeing', description: 'Experience Tokyo’s famous scramble crossing and the energetic streets around it.', duration: '1.5 hrs', estCost: 'Free', image: imagePool[0], tags: ['City', 'Iconic'] },
      { name: 'Tsukiji Outer Market', category: 'Food & Dining', description: 'Start early with fresh sushi, tamagoyaki, and Japanese street-food bites.', duration: '2.0 hrs', estCost: '¥2,500', image: imagePool[3], tags: ['Market', 'Sushi'] },
      { name: 'TeamLab Borderless', category: 'Activity', description: 'Wander through immersive digital installations that shift around you.', duration: '2.5 hrs', estCost: '¥3,800', image: imagePool[2], tags: ['Art', 'Immersive'] },
      { name: 'Meiji Jingu Shrine', category: 'Nature', description: 'Take a forested walk to Tokyo’s serene Shinto shrine beside Harajuku.', duration: '1.5 hrs', estCost: 'Free', image: imagePool[0], tags: ['Shrine', 'Forest'] },
      { name: 'Ramen Alley Dinner', category: 'Food & Dining', description: 'Compare rich tonkotsu, shoyu, or miso ramen at a neighbourhood noodle counter.', duration: '1.0 hr', estCost: '¥1,200', image: imagePool[3], tags: ['Japanese cuisine', 'Local speciality'] },
      { name: 'Tokyo Skytree', category: 'Sightseeing', description: 'See the sprawling Tokyo skyline from Japan’s tallest tower.', duration: '2.0 hrs', estCost: '¥2,100', image: imagePool[0], tags: ['City views', 'Iconic'] },
      { name: 'Akihabara Arcade Crawl', category: 'Activity', description: 'Explore Tokyo’s electric town, retro arcades, and anime culture after dark.', duration: '2.5 hrs', estCost: '¥2,000', image: imagePool[2], tags: ['Pop culture', 'Evening'] },
      { name: 'Shinjuku Gyoen', category: 'Nature', description: 'Slow down among landscaped gardens, ponds, and seasonal blooms in Shinjuku.', duration: '2.0 hrs', estCost: '¥500', image: imagePool[0], tags: ['Gardens', 'Relaxed'] },
      { name: 'Yakitori at Omoide Yokocho', category: 'Food & Dining', description: 'Sample smoky chicken skewers and small plates in a lantern-lit alleyway.', duration: '1.5 hrs', estCost: '¥2,500', image: imagePool[3], tags: ['Japanese cuisine', 'Local speciality'] },
    ],
  },
];

const fallbackTemplates = [
  ['Historic landmark', 'Sightseeing'], ['Regional speciality tasting', 'Food & Dining'], ['Scenic viewpoint', 'Nature'],
  ['Local outdoor stop', 'Beach'], ['Signature local experience', 'Activity'], ['Historic neighbourhood walk', 'Sightseeing'],
] as const;

export function generatePlacesForDestination(destination: string, count = 12): GeneratedPlace[] {
  const base = destination.split(',')[0].trim() || 'Your destination';
  const normalized = destination.toLowerCase();
  const profile = recommendationProfiles.find((candidate) => candidate.matches.some((match) => normalized.includes(match)));
  const recommendations = profile?.places || Array.from({ length: 6 }, (_, index) => {
    const [label, category] = fallbackTemplates[index];
    return {
      name: `${base} ${label}`,
      category,
      description: `A recommended ${label.toLowerCase()} to explore in ${destination}.`,
      duration: `${1 + (index % 3)}.0 hrs`,
      estCost: index % 3 === 0 ? 'Free' : `₹${300 + index * 100}`,
      image: imagePool[index % imagePool.length],
      tags: [category, 'Recommended'],
    } as Recommendation;
  });

  return Array.from({ length: Math.max(3, count) }, (_, i) => {
    const recommendation = recommendations[i % recommendations.length];
    return {
      id: `${base.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
      ...recommendation,
      rating: Number((4.2 + (i % 7) / 10).toFixed(1)),
      selected: i < Math.min(6, count),
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
