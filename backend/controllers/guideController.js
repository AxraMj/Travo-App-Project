const Guide = require('../models/Guide');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createGuide = async (req, res) => {
  try {
    // Log the entire request for debugging
    console.log('Guide Creation Request:', {
      body: req.body,
      user: req.user,
      headers: req.headers.authorization ? 'Token present' : 'No token'
    });

    if (!req.user || !req.user.userId) {
      console.error('Missing user ID in request');
      return res.status(401).json({ message: 'User ID is required' });
    }

    if (!req.body.text) {
      console.error('Missing text in request');
      return res.status(400).json({ message: 'Guide text is required' });
    }

    // Create guide with explicit schema matching
    const guideData = {
      _id: new mongoose.Types.ObjectId(),
      text: req.body.text,
      userId: req.user.userId,
      category: req.body.category || 'Other',
      tags: req.body.tags || [],
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: []
    };

    console.log('Creating guide with data:', guideData);

    const guide = new Guide(guideData);
    
    // Validate the guide before saving
    const validationError = guide.validateSync();
    if (validationError) {
      console.error('Guide validation error:', validationError);
      return res.status(400).json({ 
        message: 'Guide validation failed',
        errors: validationError.errors
      });
    }

    console.log('Guide model created:', guide);
    const savedGuide = await guide.save();
    console.log('Guide saved successfully:', savedGuide);

    // Populate user details
    const populatedGuide = await Guide.findById(savedGuide._id)
      .populate('userId', 'username profileImage');

    console.log('Sending populated guide:', populatedGuide);
    res.status(201).json(populatedGuide);
  } catch (error) {
    console.error('Guide creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create guide',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

exports.getAllGuides = async (req, res) => {
  try {
    const guides = await Guide.find()
      .populate('userId', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(guides);
  } catch (error) {
    console.error('Get guides error:', error);
    res.status(500).json({ message: 'Failed to fetch guides' });
  }
};

exports.getUserGuides = async (req, res) => {
  try {
    const { userId } = req.params;
    const guides = await Guide.find({ userId })
      .populate('userId', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(guides);
  } catch (error) {
    console.error('Get user guides error:', error);
    res.status(500).json({ message: 'Failed to fetch user guides' });
  }
};

exports.likeGuide = async (req, res) => {
  try {
    const { guideId } = req.params;
    const userId = req.user.id;

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    // Check if already liked
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
    const userId = req.user.id;

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    // Check if already disliked
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
    
    // Check if guide exists and user is authorized
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    // Verify ownership
    if (guide.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this guide' });
    }

    // Delete the guide
    await Guide.findByIdAndDelete(guideId);

    // Send success response with the deleted guide ID
    res.json({ 
      message: 'Guide deleted successfully',
      deletedGuideId: guideId 
    });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({ message: 'Failed to delete guide' });
  }
}; 