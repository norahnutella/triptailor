import crypto from 'crypto';
import Trip from '../models/Trip.js';
import TripMessage from '../models/TripMessage.js';
import User from '../models/User.js';

function mapUser(user) {
  if (!user) return null;
  return { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar || '', role: user.role || 'Traveler' };
}

function mapMessage(message, viewerId) {
  const poll = message.poll?.question ? {
    question: message.poll.question,
    options: (message.poll.options || []).map((option, index) => ({
      text: option.text,
      votes: (message.poll.votes || []).filter((vote) => vote.optionIndex === index).length,
    })),
    votedOptionIndex: (message.poll.votes || []).find((vote) => vote.user?.toString() === viewerId?.toString())?.optionIndex ?? null,
  } : undefined;

  return {
    id: message._id.toString(),
    text: message.text || '',
    createdAt: message.createdAt,
    sender: mapUser(message.sender),
    kind: message.kind || 'text',
    attachment: message.attachment || undefined,
    poll,
  };
}

function mapTrip(trip) {
  return {
    id: trip.tripId,
    title: trip.title,
    destination: trip.destination || '',
    dates: trip.dates || '',
    daysCount: trip.daysCount || 0,
    travelersCount: trip.travelersCount || 1,
    budgetTotal: trip.budgetTotal || 0,
    budgetPerPerson: trip.budgetPerPerson || 0,
    budgetTier: trip.budgetTier || 'Moderate',
    tags: trip.tags || [],
    days: trip.days || [],
    owner: mapUser(trip.owner),
    members: (trip.members || []).map(mapUser),
    updatedAt: trip.updatedAt?.toISOString?.(),
  };
}

async function getAccessibleTrip(tripId, userId) {
  return Trip.findOne({ tripId, $or: [{ owner: userId }, { members: userId }] })
    .populate('owner', 'name email avatar role')
    .populate('members', 'name email avatar role');
}

export async function listTrips(req, res) {
  try {
    const trips = await Trip.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] })
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .sort({ updatedAt: -1 });
    res.json({ trips: trips.map(mapTrip) });
  } catch (error) { res.status(500).json({ message: error.message || 'Unable to load trips.' }); }
}

export async function createTrip(req, res) {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ message: 'Trip name is required.' });
    const requestedIds = Array.isArray(req.body.memberIds) ? req.body.memberIds.map(String) : [];
    const uniqueIds = [...new Set(requestedIds)].filter((id) => id !== req.user._id.toString());
    const members = uniqueIds.length ? await User.find({ _id: { $in: uniqueIds } }).select('_id') : [];
    const trip = await Trip.create({ tripId: `trip-${crypto.randomUUID()}`, title, owner: req.user._id, members: members.map((member) => member._id) });
    await trip.populate('owner', 'name email avatar role');
    await trip.populate('members', 'name email avatar role');
    res.status(201).json({ trip: mapTrip(trip) });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to create trip.' }); }
}

export async function getTrip(req, res) {
  try {
    const trip = await getAccessibleTrip(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found or you are not a member.' });
    res.json({ trip: mapTrip(trip) });
  } catch (error) { res.status(500).json({ message: error.message || 'Unable to load trip.' }); }
}

export async function updateTrip(req, res) {
  try {
    const trip = await getAccessibleTrip(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found or you are not a member.' });
    if (String(trip.owner._id) !== String(req.user._id)) return res.status(403).json({ message: 'Only the trip owner can edit this trip.' });
    const allowed = ['title', 'destination', 'dates', 'daysCount', 'travelersCount', 'budgetTotal', 'budgetPerPerson', 'budgetTier', 'tags', 'days'];
    for (const key of allowed) if (req.body[key] !== undefined) trip[key] = req.body[key];
    await trip.save();
    await trip.populate('owner', 'name email avatar role');
    await trip.populate('members', 'name email avatar role');
    res.json({ trip: mapTrip(trip) });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to update trip.' }); }
}

export async function deleteTrip(req, res) {
  try {
    const trip = await Trip.findOne({ tripId: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or only the trip owner can delete it.' });
    await TripMessage.deleteMany({ trip: trip._id });
    await Trip.deleteOne({ _id: trip._id });
    res.json({ message: 'Trip chat deleted successfully.' });
  } catch (error) { res.status(500).json({ message: error.message || 'Unable to delete trip chat.' }); }
}

export async function addMember(req, res) {
  try {
    const trip = await Trip.findOne({ tripId: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or only the trip owner can add members.' });
    const user = await User.findOne({ _id: req.body.userId }).select('_id name email avatar role');
    if (!user) return res.status(404).json({ message: 'That TripTailor user was not found.' });
    if (user._id.toString() === req.user._id.toString()) return res.status(400).json({ message: 'You are already the trip owner.' });
    if (!trip.members.some((id) => id.toString() === user._id.toString())) trip.members.push(user._id);
    await trip.save();
    await trip.populate('owner', 'name email avatar role');
    await trip.populate('members', 'name email avatar role');
    res.json({ trip: mapTrip(trip) });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to add member.' }); }
}

export async function removeMember(req, res) {
  try {
    const trip = await Trip.findOne({ tripId: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or only the trip owner can remove members.' });
    if (trip.owner.toString() === String(req.params.userId)) return res.status(400).json({ message: 'The trip owner cannot be removed.' });
    trip.members = trip.members.filter((id) => id.toString() !== String(req.params.userId));
    await trip.save();
    await trip.populate('owner', 'name email avatar role');
    await trip.populate('members', 'name email avatar role');
    res.json({ trip: mapTrip(trip) });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to remove member.' }); }
}

export async function searchUsers(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ users: [] });
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({ _id: { $ne: req.user._id }, $or: [{ name: regex }, { email: regex }] })
      .select('name email avatar role').limit(10).lean();
    res.json({ users: users.map(mapUser) });
  } catch (error) { res.status(500).json({ message: error.message || 'Unable to search users.' }); }
}

export async function getMessages(req, res) {
  try {
    const trip = await getAccessibleTrip(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found or you are not a member.' });
    const messages = await TripMessage.find({ trip: trip._id }).populate('sender', 'name email avatar role').sort({ createdAt: 1 }).lean();
    res.json({ messages: messages.map((message) => mapMessage(message, req.user._id)) });
  } catch (error) { res.status(500).json({ message: error.message || 'Unable to load trip chat.' }); }
}

function validateAttachment(attachment) {
  if (!attachment || typeof attachment !== 'object') throw new Error('Attachment is required.');
  const name = String(attachment.name || '').trim();
  const type = String(attachment.type || 'application/octet-stream').slice(0, 120);
  const size = Number(attachment.size || 0);
  const dataUrl = String(attachment.dataUrl || '');
  if (!name || !dataUrl || !size) throw new Error('Invalid attachment.');
  if (size > 2 * 1024 * 1024) throw new Error('Files must be 2 MB or smaller.');
  if (!dataUrl.startsWith('data:')) throw new Error('Invalid file data.');
  return { name: name.slice(0, 180), type, size, dataUrl };
}

export async function sendMessage(req, res) {
  try {
    const trip = await getAccessibleTrip(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found or you are not a member.' });
    const kind = req.body.kind || 'text';
    const payload = { trip: trip._id, sender: req.user._id, kind };
    if (kind === 'file') {
      payload.attachment = validateAttachment(req.body.attachment);
    } else if (kind === 'poll') {
      const question = String(req.body.poll?.question || '').trim();
      const options = Array.isArray(req.body.poll?.options) ? req.body.poll.options.map((x) => String(x).trim()).filter(Boolean) : [];
      if (!question || options.length < 2 || options.length > 6) return res.status(400).json({ message: 'A poll needs a question and 2–6 options.' });
      payload.poll = { question: question.slice(0, 240), options: options.map((text) => ({ text: text.slice(0, 120) })), votes: [] };
    } else {
      const text = String(req.body.text || '').trim();
      if (!text) return res.status(400).json({ message: 'Message cannot be empty.' });
      payload.text = text;
      payload.kind = 'text';
    }
    const message = await TripMessage.create(payload);
    await message.populate('sender', 'name email avatar role');
    res.status(201).json({ message: mapMessage(message.toObject(), req.user._id) });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to send message.' }); }
}

export async function votePoll(req, res) {
  try {
    const trip = await getAccessibleTrip(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found or you are not a member.' });
    const message = await TripMessage.findOne({ _id: req.params.messageId, trip: trip._id });
    if (!message || message.kind !== 'poll' || !message.poll?.question) return res.status(404).json({ message: 'Poll not found.' });
    const optionIndex = Number(req.body.optionIndex);
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= message.poll.options.length) return res.status(400).json({ message: 'Invalid poll option.' });
    const existing = message.poll.votes.find((vote) => vote.user.toString() === req.user._id.toString());
    if (existing) existing.optionIndex = optionIndex;
    else message.poll.votes.push({ user: req.user._id, optionIndex });
    await message.save();
    await message.populate('sender', 'name email avatar role');
    res.json({ message: mapMessage(message.toObject(), req.user._id) });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to vote.' }); }
}

export async function leaveTrip(req, res) {
  try {
    const trip = await Trip.findOne({ tripId: req.params.tripId, members: req.user._id });
    if (!trip) return res.status(404).json({ message: 'You are not a member of this trip.' });
    trip.members = trip.members.filter((id) => id.toString() !== req.user._id.toString());
    await trip.save();
    res.json({ message: 'You left the trip.' });
  } catch { res.status(500).json({ message: 'Unable to leave trip.' }); }
}
