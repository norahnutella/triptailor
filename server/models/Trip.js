import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
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
  days: mongoose.Schema.Types.Mixed
}, { timestamps: true });
tripSchema.index({ userId: 1, tripId: 1 }, { unique: true });
export default mongoose.model('Trip', tripSchema);
