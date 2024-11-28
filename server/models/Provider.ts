import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: String,
  certifications: [String]
});

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  certifications: [String],
  contact: {
    phone: String,
    email: String,
    website: String
  },
  facilities: [facilitySchema],
  approved: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Provider = mongoose.model('Provider', providerSchema);