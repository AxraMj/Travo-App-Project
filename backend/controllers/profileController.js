const Profile = require('../models/Profile');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create profile
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      // Create a new profile if it doesn't exist
      profile = await Profile.create({
        userId,
        bio: '',
        location: '',
        socialLinks: {},
        interests: [],
        stats: {
          totalPosts: 0,
          totalGuides: 0,
          totalLikes: 0
        }
      });
    }

    // Combine user and profile data
    const response = {
      ...profile.toObject(),
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        profileImage: user.profileImage,
        accountType: user.accountType
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find or create profile
    let profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) {
      profile = new Profile({
        userId: req.user.userId,
        bio: '',
        location: '',
        socialLinks: {},
        interests: [],
        stats: {
          totalPosts: 0,
          totalGuides: 0,
          totalLikes: 0
        }
      });
    }

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user data
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.username) {
      const existingUser = await User.findOne({
        username: req.body.username,
        _id: { $ne: req.user.userId }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = req.body.username;
    }
    if (req.body.profileImage) user.profileImage = req.body.profileImage;

    // Update profile data
    if (req.body.bio !== undefined) profile.bio = req.body.bio;
    if (req.body.location !== undefined) profile.location = req.body.location;
    if (req.body.socialLinks) profile.socialLinks = req.body.socialLinks;
    if (req.body.interests) profile.interests = req.body.interests;

    // Save both documents
    await Promise.all([user.save(), profile.save()]);

    // Return combined response
    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        profileImage: user.profileImage,
        accountType: user.accountType
      },
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.updateStats = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    let profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update stats
    profile.stats = {
      ...profile.stats,
      ...req.body.stats
    };

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ message: 'Failed to update stats' });
  }
}; 