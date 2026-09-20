import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function publicUser(user) {
  return {
    id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar,
    role: user.role, bio: user.bio, joinedDate: user.joinedDate,
    tripsCount: user.tripsCount, savedPlacesCount: user.savedPlacesCount,
    currency: user.currency, travelPace: user.travelPace, preferredCuisines: user.preferredCuisines
  };
}

function issueToken(user) {
  return jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req, res) {
  try {
    const { name, email, password, avatar, travelPace } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hash, avatar: avatar || '', travelPace: travelPace || 'Balanced', joinedDate: new Date().getFullYear().toString() });
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('register error', error);
    return res.status(500).json({ message: 'Unable to create the account right now.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ message: 'Unable to sign in right now.' });
  }
}

export async function me(req, res) { return res.json({ user: publicUser(req.user) }); }

export async function updateMe(req, res) {
  try {
    const allowed = ['name', 'email', 'avatar', 'bio', 'currency', 'travelPace', 'preferredCuisines'];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
    if (updates.email) updates.email = String(updates.email).trim().toLowerCase();
    if (updates.name) updates.name = String(updates.name).trim();
    if (updates.email && updates.email !== req.user.email) {
      const duplicate = await User.findOne({ email: updates.email, _id: { $ne: req.user._id } });
      if (duplicate) return res.status(409).json({ message: 'That email is already in use.' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('update profile error', error);
    return res.status(400).json({ message: 'Unable to update your profile.' });
  }
}
