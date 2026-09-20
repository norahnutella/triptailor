import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tripId: { type: String, required: true },
  title: String,
  destination: String,
  dates: String,
  daysCount: Number,
  travelersCount: Number,
  budgetTotal: Number,
  budgetPerPerson: Number,
  budgetTier: String,
  tags: [String],
  days: mongoose.Schema.Types.Mixed,
  savedAt: { type: Date, default: Date.now }
}, { timestamps: true });
itinerarySchema.index({ userId: 1, tripId: 1 }, { unique: true });
export default mongoose.model('Itinerary', itinerarySchema);
