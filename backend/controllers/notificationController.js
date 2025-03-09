const Notification = require('../models/Notification');
const User = require('../models/User');
const Post = require('../models/Post');

exports.getNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      console.error('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Fetching notifications for user:', req.user.userId);
    
    // First check if the user exists
    const userExists = await User.findById(req.user.userId);
    if (!userExists) {
      console.error('User not found:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    const notifications = await Notification.find({ userId: req.user.userId })
      .populate('triggeredBy', 'username profileImage')
      .populate('postId', 'image')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(); // Use lean() for better performance

    console.log('Raw notifications found:', notifications.length);

    if (!Array.isArray(notifications)) {
      console.error('Notifications is not an array:', notifications);
      return res.status(500).json({ message: 'Invalid notifications data' });
    }

    // Group notifications by date
    const groupedNotifications = notifications.reduce((groups, notification) => {
      try {
        const date = new Date(notification.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let groupKey;
        if (date.toDateString() === today.toDateString()) {
          groupKey = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          groupKey = 'Yesterday';
        } else if (today.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
          groupKey = 'This Week';
        } else {
          groupKey = 'Earlier';
        }

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(notification);
      } catch (err) {
        console.error('Error processing notification:', err, notification);
      }
      return groups;
    }, {});

    console.log('Grouped notifications:', Object.keys(groupedNotifications));

    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.userId, 
      read: false 
    });

    console.log('Unread count:', unreadCount);

    res.json({
      unreadCount,
      groups: groupedNotifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify ownership
    if (notification.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this notification' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      updated: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

exports.createNotification = async (userId, triggeredBy, type, data = {}) => {
  try {
    console.log('Creating notification:', { userId, triggeredBy, type, data });

    // Don't create notification if user is interacting with their own content
    if (userId.toString() === triggeredBy.toString()) {
      console.log('Skipping notification for self-interaction');
      return null;
    }

    // Check if a similar notification exists within the last hour
    const recentNotification = await Notification.findOne({
      userId,
      triggeredBy,
      type,
      postId: data.postId,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    if (recentNotification) {
      console.log('Similar recent notification exists, skipping');
      return null;
    }

    const notification = new Notification({
      userId,
      triggeredBy,
      type,
      ...data,
      read: false
    });

    await notification.save();

    // Populate the notification before sending
    const populatedNotification = await Notification.findById(notification._id)
      .populate('triggeredBy', 'username profileImage')
      .populate('postId', 'image');

    // Emit real-time notification through WebSocket
    if (global.io) {
      console.log('Emitting notification to user:', userId);
      global.io.to(userId.toString()).emit('notification', {
        event: 'notification',
        data: populatedNotification
      });
    } else {
      console.log('WebSocket io not available');
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
}; 