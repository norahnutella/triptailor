import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  tripId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  destination: { type: String, default: '' },
  dates: { type: String, default: '' },
  daysCount: Number,
  travelersCount: Number,
  budgetTotal: Number,
  budgetPerPerson: Number,
  budgetTier: String,
  tags: [String],
  days: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

tripSchema.index({ owner: 1, updatedAt: -1 });
tripSchema.index({ members: 1, updatedAt: -1 });

export default mongoose.model('Trip', tripSchema);
