import Itinerary from '../models/Itinerary.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';

function normalizeTrip(trip) {
  if (!trip?.id || !trip?.destination || !Array.isArray(trip?.days)) {
    throw new Error('Invalid itinerary data.');
  }

  const title = String(trip.title || '').trim();
  if (!title) throw new Error('Trip name is required.');

  return {
    tripId: String(trip.id),
    title,
    destination: String(trip.destination),
    dates: trip.dates,
    daysCount: trip.daysCount,
    travelersCount: trip.travelersCount,
    budgetTotal: trip.budgetTotal,
    budgetPerPerson: trip.budgetPerPerson,
    budgetTier: trip.budgetTier,
    tags: Array.isArray(trip.tags) ? trip.tags : [],
    days: trip.days,
  };
}

function userSummary(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };
}

function tripResponse(trip, itinerary) {
  return {
    id: trip.tripId,
    tripMongoId: trip._id.toString(),
    title: trip.title,
    destination: trip.destination,
    dates: trip.dates,
    daysCount: trip.daysCount,
    travelersCount: trip.travelersCount,
    budgetTotal: trip.budgetTotal,
    budgetPerPerson: trip.budgetPerPerson,
    budgetTier: trip.budgetTier,
    tags: trip.tags || [],
    days: itinerary?.days || trip.days || [],
    owner: trip.owner,
    members: trip.members || [],
    savedAt: itinerary?.savedAt?.toISOString?.() || trip.createdAt?.toISOString?.(),
    updatedAt: itinerary?.updatedAt?.toISOString?.() || trip.updatedAt?.toISOString?.(),
  };
}

async function getAccessibleTrip(tripId, userId) {
  return Trip.findOne({
    tripId,
    $or: [{ owner: userId }, { members: userId }],
  }).populate('owner', 'name email avatar').populate('members', 'name email avatar');
}

export async function listItineraries(req, res) {
  try {
    const trips = await Trip.find({ owner: req.user._id })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 })
      .lean();

    const tripIds = trips.map((trip) => trip._id);
    const itineraries = await Itinerary.find({ tripRef: { $in: tripIds } }).sort({ updatedAt: -1 }).lean();
    const byTrip = new Map(itineraries.map((item) => [item.tripRef.toString(), item]));

    res.json({
      itineraries: trips
        .filter((trip) => byTrip.has(trip._id.toString()))
        .map((trip) => tripResponse(trip, byTrip.get(trip._id.toString()))),
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load saved itineraries.' });
  }
}

export async function getItinerary(req, res) {
  try {
    const trip = await getAccessibleTrip(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found or you are not a member.' });

    const itinerary = await Itinerary.findOne({ tripRef: trip._id }).lean();
    if (!itinerary) return res.status(404).json({ message: 'Saved itinerary not found.' });

    res.json({ itinerary: tripResponse(trip, itinerary) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load itinerary.' });
  }
}

export async function saveItinerary(req, res) {
  try {
    const data = normalizeTrip(req.body.trip);
    const requestedMembers = Array.isArray(req.body.memberEmails) ? req.body.memberEmails : [];

    let trip = await Trip.findOne({ tripId: data.tripId });
    if (trip && trip.owner.toString() !== req.user._id.toString()) {
      const isMember = trip.members.some((id) => id.toString() === req.user._id.toString());
      if (!isMember) return res.status(403).json({ message: 'You cannot edit this trip.' });
    }

    if (!trip) {
      trip = new Trip({
        tripId: data.tripId,
        title: data.title,
        owner: req.user._id,
        members: [],
        ...data,
      });
    } else {
      trip.title = data.title;
      trip.destination = data.destination;
      trip.dates = data.dates;
      trip.daysCount = data.daysCount;
      trip.travelersCount = data.travelersCount;
      trip.budgetTotal = data.budgetTotal;
      trip.budgetPerPerson = data.budgetPerPerson;
      trip.budgetTier = data.budgetTier;
      trip.tags = data.tags;
      trip.days = data.days;
    }

    if (requestedMembers.length && trip.owner.toString() === req.user._id.toString()) {
      const emails = requestedMembers.map((email) => String(email).trim().toLowerCase()).filter(Boolean);
      const users = await User.find({ email: { $in: emails } }).select('_id email');
      const notFound = emails.filter((email) => !users.some((u) => u.email.toLowerCase() === email));
      if (notFound.length) {
        return res.status(400).json({ message: `No TripTailor account found for: ${notFound.join(', ')}` });
      }
      const ids = users.map((u) => u._id.toString()).filter((id) => id !== trip.owner.toString());
      trip.members = [...new Set([...(trip.members || []).map((id) => id.toString()), ...ids])];
    }

    await trip.save();

    const item = await Itinerary.findOneAndUpdate(
      { userId: trip.owner, tripId: data.tripId },
      { $set: { ...data, userId: trip.owner, tripRef: trip._id }, $setOnInsert: { savedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await item.populate({ path: 'tripRef', populate: [{ path: 'owner', select: 'name email avatar' }, { path: 'members', select: 'name email avatar' }] });

    res.json({ itinerary: tripResponse(item.tripRef, item) });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to save itinerary.' });
  }
}

export async function deleteItinerary(req, res) {
  try {
    const deleted = await Itinerary.findOneAndDelete({
      tripId: req.params.tripId,
      userId: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: 'Saved itinerary not found.' });

    res.json({ message: 'Saved itinerary deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete trip.' });
  }
}

export async function inviteMembers(req, res) {
  try {
    const trip = await Trip.findOne({ tripId: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or you are not the owner.' });

    const emails = Array.isArray(req.body.emails) ? req.body.emails : [];
    if (!emails.length) return res.status(400).json({ message: 'Add at least one email address.' });

    const normalized = emails.map((email) => String(email).trim().toLowerCase()).filter(Boolean);
    const users = await User.find({ email: { $in: normalized } }).select('_id email name avatar');
    const missing = normalized.filter((email) => !users.some((u) => u.email.toLowerCase() === email));
    if (missing.length) return res.status(400).json({ message: `No TripTailor account found for: ${missing.join(', ')}` });

    const ids = users.map((u) => u._id.toString()).filter((id) => id !== trip.owner.toString());
    trip.members = [...new Set([...(trip.members || []).map((id) => id.toString()), ...ids])];
    await trip.save();

    await trip.populate('owner', 'name email avatar');
    await trip.populate('members', 'name email avatar');
    res.json({ trip });
  } catch (error) {
    res.status(500).json({ message: 'Unable to invite members.' });
  }
}
