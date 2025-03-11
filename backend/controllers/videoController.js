const Video = require('../models/Video');
const Profile = require('../models/Profile');
const { uploadVideo, deleteVideo } = require('../utils/cloudinary');

// Create a new video
exports.createVideo = async (req, res) => {
  try {
    const { title, description, video, location, duration } = req.body;
    const userId = req.user.userId;

    if (!title || !video || !location || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Starting video upload to Cloudinary...');
    
    // Upload video to Cloudinary
    const uploadResult = await uploadVideo(`data:video/mp4;base64,${video}`);
    
    console.log('Video uploaded successfully:', uploadResult);

    // Create video document
    const newVideo = new Video({
      userId,
      title,
      description,
      videoUrl: uploadResult.videoUrl,
      thumbnail: uploadResult.thumbnailUrl,
      duration: Math.round(duration),
      location,
      weather: {
        temp: 0,
        description: 'Unknown',
        icon: 'unknown'
      }
    });

    await newVideo.save();
    console.log('Video document saved:', newVideo._id);

    // Update user's profile stats
    await Profile.findOneAndUpdate(
      { userId },
      { $inc: { 'stats.totalVideos': 1 } }
    );

    // Populate user info before sending response
    const populatedVideo = await Video.findById(newVideo._id)
      .populate('userId', 'fullName username profileImage');

    res.status(201).json(populatedVideo);
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Failed to create video', error: error.message });
  }
};

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('userId', 'fullName username profileImage')
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
};

// Get videos by user ID
exports.getUserVideos = async (req, res) => {
  try {
    const { userId } = req.params;
    const videos = await Video.find({ userId })
      .populate('userId', 'fullName username profileImage')
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ message: 'Failed to fetch user videos' });
  }
};

// Like/unlike a video
exports.likeVideo = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const userId = req.user.userId;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const isLiked = video.likes.includes(userId);
    const update = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      update,
      { new: true }
    ).populate('userId', 'fullName username profileImage');

    res.json(updatedVideo);
  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({ message: 'Failed to update video likes' });
  }
};

// Add comment to video
exports.addComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.comments.push({ userId, text });
    await video.save();

    const updatedVideo = await Video.findById(videoId)
      .populate('userId', 'fullName username profileImage')
      .populate('comments.userId', 'fullName username profileImage');

    res.json(updatedVideo);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Delete a video
exports.deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.userId;

    const video = await Video.findOne({ _id: videoId, userId });
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete video from Cloudinary
    await deleteVideo(video.videoUrl);

    // Delete video document
    await video.deleteOne();

    // Update user's profile stats
    await Profile.findOneAndUpdate(
      { userId },
      { $inc: { 'stats.totalVideos': -1 } }
    );

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Failed to delete video' });
  }
};

// Increment video views
exports.incrementViews = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'fullName username profileImage');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Increment views error:', error);
    res.status(500).json({ message: 'Failed to update video views' });
  }
}; 