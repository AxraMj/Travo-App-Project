const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    console.log('Creating post:', {
      userId: req.user?.userId,
      hasImage: !!req.body.image
    });

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.body.image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Create post with all required fields
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

    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'username profileImage');

    console.log('Post created successfully');
    res.status(201).json(populatedPost);

  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId })
      .populate('userId', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Failed to fetch user posts' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership
    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.json({ 
      message: 'Post deleted successfully',
      deletedPostId: postId 
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // Add like
      post.likes.push(userId);
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
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

    // Populate the new comment's user details
    const populatedPost = await Post.findById(postId)
      .populate('userId', 'username profileImage')
      .populate('comments.userId', 'username profileImage');

    res.json(populatedPost);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
}; 