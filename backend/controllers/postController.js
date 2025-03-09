const Post = require('../models/Post');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { createNotification } = require('./notificationController');
const mongoose = require('mongoose');

exports.createPost = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.body.image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const postData = {
      userId: req.user.userId,
      image: req.body.image,
      description: req.body.description || '',
      location: req.body.location || {
        name: 'Unknown Location',
        coordinates: {
          latitude: 0,
          longitude: 0
        }
      },
      weather: req.body.weather || {
        temp: 0,
        description: 'Unknown',
        icon: 'unknown'
      },
      travelTips: req.body.travelTips || []
    };

    const post = new Post(postData);
    await post.save();

    // Update user's post count
    await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { $inc: { 'stats.totalPosts': 1 } }
    );

    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'username profileImage fullName');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username profileImage fullName')
      .populate('comments.userId', 'username profileImage fullName')
      .sort({ createdAt: -1 });

    // Add isLiked and isSaved fields for the current user
    const enhancedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (req.user) {
        postObj.isLiked = post.likes.includes(req.user.userId);
        postObj.isSaved = post.savedBy.includes(req.user.userId);
      }
      return postObj;
    });

    res.json(enhancedPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId })
      .populate('userId', 'username profileImage fullName')
      .populate('comments.userId', 'username profileImage fullName')
      .sort({ createdAt: -1 });

    // Add isLiked and isSaved fields for the current user
    const enhancedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (req.user) {
        postObj.isLiked = post.likes.includes(req.user.userId);
        postObj.isSaved = post.savedBy.includes(req.user.userId);
      }
      return postObj;
    });

    res.json(enhancedPosts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Failed to fetch user posts' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    console.log('Like post request:', { postId, userId });

    // Validate postId
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      console.error('Invalid post ID:', postId);
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find post and populate necessary fields
    const post = await Post.findById(postId)
      .populate('userId', 'username profileImage fullName');

    if (!post) {
      console.error('Post not found:', postId);
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log('Found post:', post._id);

    const hasLiked = post.likes.includes(userId);
    if (hasLiked) {
      // Unlike
      console.log('Removing like');
      post.likes = post.likes.filter(id => id.toString() !== userId);
      
      // Update profile stats
      await Profile.findOneAndUpdate(
        { userId: post.userId._id },
        { $inc: { 'stats.totalLikes': -1 } }
      );
    } else {
      // Like
      console.log('Adding like');
      post.likes.push(userId);
      
      // Update profile stats
      await Profile.findOneAndUpdate(
        { userId: post.userId._id },
        { $inc: { 'stats.totalLikes': 1 } }
      );
      
      // Create notification for post owner
      if (post.userId._id.toString() !== userId) {
        try {
          await createNotification(
            post.userId._id,
            userId,
            'like',
            { postId: post._id }
          );
        } catch (notifError) {
          console.error('Notification creation error:', notifError);
          // Don't fail the like operation if notification fails
        }
      }
    }

    await post.save();

    // Re-fetch the post to get updated data
    const updatedPost = await Post.findById(postId)
      .populate('userId', 'username profileImage fullName')
      .populate('comments.userId', 'username profileImage fullName');

    const postObj = updatedPost.toObject();
    postObj.isLiked = updatedPost.likes.includes(userId);
    postObj.isSaved = updatedPost.savedBy.includes(userId);

    console.log('Successfully processed like/unlike');
    res.json(postObj);
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ 
      message: 'Failed to like post',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasSaved = post.savedBy.includes(userId);
    if (hasSaved) {
      // Unsave
      post.savedBy.pull(userId);
    } else {
      // Save
      post.savedBy.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('userId', 'username profileImage fullName')
      .populate('comments.userId', 'username profileImage fullName');

    const postObj = updatedPost.toObject();
    postObj.isLiked = updatedPost.likes.includes(userId);
    postObj.isSaved = updatedPost.savedBy.includes(userId);

    res.json(postObj);
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ message: 'Failed to save post' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      userId,
      text,
      createdAt: new Date()
    });

    await post.save();

    // Create notification for post owner
    if (post.userId.toString() !== userId) {
      await createNotification(post.userId, userId, postId, 'comment');
    }

    const updatedPost = await Post.findById(postId)
      .populate('userId', 'username profileImage fullName')
      .populate('comments.userId', 'username profileImage fullName');

    const postObj = updatedPost.toObject();
    postObj.isLiked = updatedPost.likes.includes(userId);
    postObj.isSaved = updatedPost.savedBy.includes(userId);

    res.json(postObj);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is comment owner or post owner
    if (comment.userId.toString() !== userId && post.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('userId', 'username profileImage fullName')
      .populate('comments.userId', 'username profileImage fullName');

    const postObj = updatedPost.toObject();
    postObj.isLiked = updatedPost.likes.includes(userId);
    postObj.isSaved = updatedPost.savedBy.includes(userId);

    res.json(postObj);
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(postId);

    // Update user's post count
    await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { $inc: { 'stats.totalPosts': -1 } }
    );

    res.json({ message: 'Post deleted successfully', deletedPostId: postId });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
}; 