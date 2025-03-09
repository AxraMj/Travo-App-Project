const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxLength: 500
  },
  location: {
    type: String,
    maxLength: 100
  },
  locationNote: {
    type: String,
    maxLength: 100
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Guide', guideSchema); 