import Itinerary from '../models/Itinerary.js';
import Trip from '../models/Trip.js';

function normalizeTrip(trip) {
  if (!trip?.id || !trip?.destination || !Array.isArray(trip?.days)) throw new Error('Invalid itinerary data.');
  return { tripId: String(trip.id), title: trip.title, destination: trip.destination, dates: trip.dates, daysCount: trip.daysCount, travelersCount: trip.travelersCount, budgetTotal: trip.budgetTotal, budgetPerPerson: trip.budgetPerPerson, budgetTier: trip.budgetTier, tags: trip.tags || [], days: trip.days };
}

export async function listItineraries(req, res) {
  const items = await Itinerary.find({ userId: req.user._id }).sort({ updatedAt: -1 }).lean();
  const mapped = items.map((x) => ({ id: x.tripId, title: x.title, destination: x.destination, dates: x.dates, daysCount: x.daysCount, travelersCount: x.travelersCount, budgetTotal: x.budgetTotal, budgetPerPerson: x.budgetPerPerson, budgetTier: x.budgetTier, tags: x.tags, days: x.days, userId: x.userId.toString(), savedAt: x.savedAt?.toISOString?.() || x.createdAt?.toISOString(), updatedAt: x.updatedAt?.toISOString() }));
  res.json({ itineraries: mapped });
}

export async function saveItinerary(req, res) {
  try {
    const data = normalizeTrip(req.body.trip);
    const item = await Itinerary.findOneAndUpdate({ userId: req.user._id, tripId: data.tripId }, { $set: data, $setOnInsert: { savedAt: new Date() } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    await Trip.findOneAndUpdate({ userId: req.user._id, tripId: data.tripId }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const result = { ...data, id: item.tripId, userId: req.user._id.toString(), savedAt: item.savedAt?.toISOString(), updatedAt: item.updatedAt?.toISOString() };
    res.json({ itinerary: result });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to save itinerary.' });
  }
}

export async function deleteItinerary(req, res) {
  const result = await Itinerary.deleteOne({ userId: req.user._id, tripId: req.params.tripId });
  if (!result.deletedCount) return res.status(404).json({ message: 'Itinerary not found.' });
  await Trip.deleteOne({ userId: req.user._id, tripId: req.params.tripId });
  res.json({ message: 'Itinerary deleted successfully.' });
}
