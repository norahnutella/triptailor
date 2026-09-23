import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 200
  },

  phone: {
    type: String,
    default: '',
    maxlength: 30
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  // Password reset fields
  resetPasswordToken: {
    type: String,
    default: null,
    select: false
  },

  resetPasswordExpires: {
    type: Date,
    default: null,
    select: false
  },

  avatar: {
    type: String,
    default: ''
  },

  role: {
    type: String,
    default: 'Traveler'
  },

  bio: {
    type: String,
    default: ''
  },

  joinedDate: {
    type: String
  },

  tripsCount: {
    type: Number,
    default: 0
  },

  savedPlacesCount: {
    type: Number,
    default: 0
  },

  currency: {
    type: String,
    default: 'INR (₹)'
  },

  travelPace: {
    type: String,
    enum: ['Relaxed', 'Balanced', 'Packed'],
    default: 'Balanced'
  },

  preferredCuisines: {
    type: [String],
    default: []
  }

}, { timestamps: true });

export default mongoose.model('User', userSchema);