import mongoose from 'mongoose';

const tripMessageSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

tripMessageSchema.index({ trip: 1, createdAt: 1 });

export default mongoose.model('TripMessage', tripMessageSchema);
