import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 180 },
  type: { type: String, required: true, maxlength: 120 },
  size: { type: Number, required: true, max: 2 * 1024 * 1024 },
  dataUrl: { type: String, required: true },
}, { _id: false });

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 120 },
}, { _id: false });

const pollVoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  optionIndex: { type: Number, required: true, min: 0 },
}, { _id: false });

const tripMessageSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['text', 'file', 'poll'], default: 'text' },
  text: { type: String, trim: true, maxlength: 2000, default: '' },
  attachment: { type: attachmentSchema, default: null },
  poll: {
    question: { type: String, trim: true, maxlength: 240 },
    options: { type: [pollOptionSchema], default: undefined },
    votes: { type: [pollVoteSchema], default: [] },
  },
}, { timestamps: true });

tripMessageSchema.index({ trip: 1, createdAt: 1 });

export default mongoose.model('TripMessage', tripMessageSchema);
