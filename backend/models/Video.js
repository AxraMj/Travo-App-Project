const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  description: {
    type: String,
    maxLength: 1000
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxLength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    }
  },
  weather: {
    temp: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: 'Unknown'
    },
    icon: {
      type: String,
      default: 'unknown'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for user information
videoSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual field for likes count
videoSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual field for comments count
videoSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Add indexes for better performance
videoSchema.index({ userId: 1, createdAt: -1 });
videoSchema.index({ 'location.coordinates': '2dsphere' });
videoSchema.index({ likes: 1 });
videoSchema.index({ views: -1 });

module.exports = mongoose.model('Video', videoSchema); 