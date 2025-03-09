const Guide = require('../models/Guide');
const User = require('../models/User');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');

exports.createGuide = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.body.text) {
      return res.status(400).json({ message: 'Guide text is required' });
    }

    const guideData = {
      text: req.body.text,
      location: req.body.location || '',
      locationNote: req.body.locationNote || '',
      userId: req.user.userId,
      category: req.body.category || 'Other',
      tags: req.body.tags || []
    };

    const guide = new Guide(guideData);
    await guide.save();

    // Update user's profile stats
    await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { $inc: { 'stats.totalGuides': 1 } }
    );

    // Populate user information
    const populatedGuide = await Guide.findById(guide._id)
      .populate('userId', 'username profileImage fullName');

    // Format response
    const response = {
      _id: populatedGuide._id,
      text: populatedGuide.text,
      location: populatedGuide.location,
      locationNote: populatedGuide.locationNote,
      username: populatedGuide.userId.username,
      userImage: populatedGuide.userId.profileImage,
      likes: populatedGuide.likes,
      dislikes: populatedGuide.dislikes,
      createdAt: populatedGuide.createdAt,
      updatedAt: populatedGuide.updatedAt
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Guide creation error:', error);
    res.status(500).json({ message: 'Failed to create guide' });
  }
};

exports.getAllGuides = async (req, res) => {
  try {
    const guides = await Guide.find()
      .populate('userId', 'username profileImage fullName')
      .sort({ createdAt: -1 });

    // Format response
    const formattedGuides = guides.map(guide => ({
      _id: guide._id,
      text: guide.text,
      location: guide.location,
      locationNote: guide.locationNote,
      username: guide.userId.username,
      userImage: guide.userId.profileImage,
      likes: guide.likes,
      dislikes: guide.dislikes,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt
    }));

    res.json(formattedGuides);
  } catch (error) {
    console.error('Get guides error:', error);
    res.status(500).json({ message: 'Failed to fetch guides' });
  }
};

exports.getUserGuides = async (req, res) => {
  try {
    const { userId } = req.params;
    const guides = await Guide.find({ userId })
      .populate('userId', 'username profileImage fullName')
      .sort({ createdAt: -1 });

    // Format response
    const formattedGuides = guides.map(guide => ({
      _id: guide._id,
      text: guide.text,
      location: guide.location,
      locationNote: guide.locationNote,
      username: guide.userId.username,
      userImage: guide.userId.profileImage,
      likes: guide.likes,
      dislikes: guide.dislikes,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt
    }));

    res.json(formattedGuides);
  } catch (error) {
    console.error('Get user guides error:', error);
    res.status(500).json({ message: 'Failed to fetch user guides' });
  }
};

exports.likeGuide = async (req, res) => {
  try {
    const { guideId } = req.params;
    const userId = req.user.userId;

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    const hasLiked = guide.likedBy.includes(userId);
    const hasDisliked = guide.dislikedBy.includes(userId);

    if (hasLiked) {
      // Unlike
      guide.likedBy.pull(userId);
      guide.likes--;
    } else {
      // Like and remove dislike if exists
      guide.likedBy.push(userId);
      guide.likes++;
      if (hasDisliked) {
        guide.dislikedBy.pull(userId);
        guide.dislikes--;
      }
    }

    await guide.save();
    res.json(guide);
  } catch (error) {
    console.error('Like guide error:', error);
    res.status(500).json({ message: 'Failed to like guide' });
  }
};

exports.dislikeGuide = async (req, res) => {
  try {
    const { guideId } = req.params;
    const userId = req.user.userId;

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    const hasDisliked = guide.dislikedBy.includes(userId);
    const hasLiked = guide.likedBy.includes(userId);

    if (hasDisliked) {
      // Remove dislike
      guide.dislikedBy.pull(userId);
      guide.dislikes--;
    } else {
      // Dislike and remove like if exists
      guide.dislikedBy.push(userId);
      guide.dislikes++;
      if (hasLiked) {
        guide.likedBy.pull(userId);
        guide.likes--;
      }
    }

    await guide.save();
    res.json(guide);
  } catch (error) {
    console.error('Dislike guide error:', error);
    res.status(500).json({ message: 'Failed to dislike guide' });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    const { guideId } = req.params;
    
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    if (guide.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this guide' });
    }

    await Guide.findByIdAndDelete(guideId);

    // Update user's profile stats
    await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { $inc: { 'stats.totalGuides': -1 } }
    );

    res.json({ message: 'Guide deleted successfully', deletedGuideId: guideId });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({ message: 'Failed to delete guide' });
  }
}; 